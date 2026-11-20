# 前端权限对接说明（wms-basic-backend）

本文说明前端如何对接基于 **permission key** 的菜单与接口权限，行为与 na-wms 方案一致。

---

## 1. 模型概要

| 类型 | 前缀 | 用途 |
|------|------|------|
| 页面 / 菜单 | `page.*` | 控制路由、侧栏是否展示 |
| 接口 | `api.*` | 后端校验；前端可用于按钮、Tab 显隐（可选） |

- **JWT 里不含权限列表**，只含 `userId`、`role`（枚举）、`storeId` 等。
- 权限来自数据库 `roles` → `role_permissions` → `permission_keys`，按用户 `role_id` 解析。
- 服务端对用户权限有约 **5 分钟** 缓存；角色被管理员修改后，可重新调用 `POST /auth/me` 刷新。

---

## 2. 推荐登录与会话流程

```
1. POST /auth/login          → 拿到 accessToken、user（含 role 枚举）
2. POST /auth/me             → 带上 Bearer Token，拿到 permissions.pages / apis
3. 将 permissions 存入内存 +（可选）localStorage
4. 渲染菜单 / 路由守卫 / 按钮权限
5. 业务请求 Header: Authorization: Bearer <accessToken>
```

### 2.1 登录

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "******",
  "storeId": 1
}
```

**响应（当前实现，非统一 code 包装）：**

```json
{
  "user": { "id": "...", "role": "ADMIN", "storeId": 1, "email": "..." },
  "token": {
    "expiresIn": 3600,
    "accessToken": "<jwt>"
  },
  "info": { }
}
```

后续请求使用：`Authorization: Bearer <token.accessToken>`。

### 2.2 获取当前用户与权限（**前端主入口**）

```http
POST /auth/me
Authorization: Bearer <accessToken>
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "…",
      "lastName": "…",
      "role": "USER",
      "email": "…",
      "storeId": 1,
      "isActive": true
    },
    "permissions": {
      "pages": [
        "page.dashboard",
        "page.items",
        "page.inbound.order-list"
      ],
      "apis": [
        "api.items.view",
        "api.inbound-order.manage"
      ]
    }
  },
  "msg": "Success"
}
```

注意：

- `user.role` 仍是历史 **枚举**（`USER` / `ADMIN` / `SINV_USER` / …），仅作展示或兼容；**鉴权不要只依赖 role 字符串**。
- 若用户未迁移 `role_id` 或库中无赋权，`pages` / `apis` 可能为空数组，菜单应全部隐藏或提示联系管理员。

---

## 3. 本系统固定的 `page.*` 列表

每条侧栏 / 路由建议绑定一个 **permission key**（与后端 seed 一致）：

| Permission Key | 建议用途 |
|----------------|----------|
| `page.dashboard` | 仪表盘 |
| `page.items` | 商品 |
| `page.report.inv-transactions` | 库存流水报表 |
| `page.report.inventory-by-item` | 按商品库存报表 |
| `page.report.inventory-by-warehouse` | 按仓库库存报表 |
| `page.inbound.create` | 创建入库 |
| `page.inbound.order-list` | 入库单列表 |
| `page.inbound.request-list` | 入库申请列表 |
| `page.outbound.create` | 创建出库 |
| `page.outbound.order-list` | 出库单列表 |
| `page.outbound.picking-list` | 拣货列表 |
| `page.outbound.request-list` | 出库申请列表 |
| `page.transfer-order.create` | 创建调拨 |
| `page.transfer-order.order-list` | 调拨单列表 |
| `page.vendor` | 供应商 |
| `page.warehouse` | 仓库 |
| `page.location` | 库位 |
| `page.category` | 分类 |
| `page.unit` | 单位 |
| `page.users` | 用户管理 |

**菜单显隐：**

```typescript
function canShowPage(permissions: { pages: string[] }, key: string): boolean {
  return permissions.pages.includes(key);
}
```

**路由守卫示例（伪代码）：**

```typescript
// route.meta.permission = 'page.items'
if (!permissions.pages.includes(route.meta.permission)) {
  redirect('/403');
}
```

---

## 4. `api.*` 在前端的用法

后端每个受保护接口声明所需 key（如 `@Auth(['api.items.create'])`），用户须 **拥有列表中的全部 key**（AND）。

前端常见用法：

1. **按钮级**：`v-if="hasApi('api.items.import')"`。
2. **调用前校验**：无 key 则不发起请求，避免无意义 403。
3. **403 兜底**：仍须处理接口返回的权限错误（见下）。

常用 key 示例（完整列表见 `src/modules/role/scripts/insert-permission-keys.sql`）：

- 商品：`api.items.view` / `create` / `update` / `import` / `sync` / `vendor-view`
- 入库：`api.inbound-request.view|manage|approve`，`api.inbound-order.view|manage|approve`
- 出库：`api.outbound-request.*`，`api.outbound-order.*`
- 库存：`api.inventory.view`，`api.inventory.vendor-view`
- 用户：`api.users.view` / `create` / `update` / `list`
- 角色管理：`api.roles.view` / `permissions.update` 等（通常 ADMIN / SUPER）

```typescript
function hasApi(permissions: { apis: string[] }, key: string): boolean {
  return permissions.apis.includes(key);
}

function hasAllApis(permissions: { apis: string[] }, keys: string[]): boolean {
  return keys.every((k) => permissions.apis.includes(k));
}
```

---

## 5. 无权限时的 HTTP 表现

业务接口缺少 `api.*` 时，HTTP **403**，body 形如：

```json
{
  "code": 7001,
  "data": "Forbidden",
  "msg": "You are not authorized to access this resource"
}
```

`7001` = `PERMISSION_NO_ACCESS`（见 `src/common/other-config.ts`）。

前端建议：统一拦截 `code === 7001`，提示无权限；401 则跳转登录。

---

## 6. 与旧版「按 role 写死菜单」的差异

| 以前 | 现在 |
|------|------|
| 前端根据 `user.role === 'ADMIN'` 写死菜单 | 根据 `permissions.pages` 动态显隐 |
| 接口仅靠 role 推断 | 以 `permissions.apis` + 后端 403 为准 |
| 改权限要发版 | SUPER/ADMIN 可在后台改角色权限（见下） |

**不要**在新功能里继续堆砌 `role === 'USER_SINV'` 菜单逻辑；`SINV` 等业务规则（如强制 `vendorId`）仍由后端处理，前端只负责展示与请求。

---

## 7. 角色权限管理 API（可选，做「权限配置」页时用）

Base path：**`/roles`**（与主应用相同前缀，当前未设置全局 `/api`）。

| 方法 | 路径 | 所需 api.* |
|------|------|------------|
| GET | `/roles` | `api.roles.view` |
| GET | `/roles/:id` | `api.roles.view` |
| GET | `/roles/:id/permissions` | `api.roles.permissions.view` |
| POST | `/roles/:id/permissions` | `api.roles.permissions.update` |
| POST | `/roles/super/assign-all-permissions` | `api.roles.super.assign-permissions` |

响应多为 `{ code, data, msg }` 结构（与 `POST /auth/me` 一致）。

保存单条权限示例：

```http
POST /roles/2/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionKey": "page.items",
  "enabled": true
}
```

---

## 8. TypeScript 类型建议

```typescript
export interface UserPermissions {
  pages: string[];
  apis: string[];
}

export interface AuthMeResponse {
  code: number;
  msg: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName?: string | null;
      role: string;
      email?: string | null;
      storeId: number;
      isActive: boolean;
    };
    permissions: UserPermissions;
  };
}
```

---

## 9. 前端自检清单

- [ ] 登录成功后 **必须** 调 `POST /auth/me` 拉取 permissions
- [ ] 每条菜单配置 `page.*`，用 `includes` 判断
- [ ] 敏感按钮配置 `api.*`（可选但推荐）
- [ ] 处理 `code: 7001` 与 401
- [ ] 管理员改权限后，用户重新登录或再调 `/auth/me`（或等待缓存过期）
- [ ] 勿再单独用 `user.role` 作为唯一权限来源

---

## 10. 相关后端文件

- 权限目录 SQL：`src/modules/role/scripts/insert-permission-keys.sql`
- 页面 key 列表：同上 `page.*` 段
- 接口实现：`POST /auth/me` → `src/modules/auth/auth.controller.ts`
- 角色管理：`src/modules/role/role.controller.ts`

如有新页面，先在后端增加 `page.xxx` 并赋权给角色，再在前端路由绑定同一 key。