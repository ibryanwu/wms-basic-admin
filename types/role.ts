// 角色
export interface Role {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GrantedPermission {
  id: number;
  permissionKeyId: number;
  permissionKey: string;
  module: string;
  description?: string | null;
  resource?: string | null;
  action?: string | null;
  enabled: boolean;
  permissionValue?: Record<string, any> | null;
}

export interface UngrantedPermission {
  id: number;
  permissionKey: string;
  module: string;
  description?: string | null;
  resource?: string | null;
  action?: string | null;
  defaultValue?: Record<string, any> | null;
}

export interface ModulePermissions {
  module: string;
  granted: GrantedPermission[];
  ungranted: UngrantedPermission[];
}

export type RolePermissionsResponse = Record<string, ModulePermissions>;

export interface ApiResponse<T> {
  code: number;
  data: T | null;
  msg: string;
}

export interface SavePermissionRequest {
  permissionKey: string;
  enabled: boolean;
}

export interface SavePermissionResponse {
  id: number;
  roleId: number;
  permissionKeyId: number;
  permissionKey: string;
  enabled: boolean;
  permissionValue: Record<string, any>;
}

export interface UserPermissions {
  pages: string[];
  apis: string[] | Array<{ key?: string }>;
}