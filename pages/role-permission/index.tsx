import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Breadcrumb,
  Stack,
  Table,
  Badge,
} from 'react-bootstrap';
import Seo from '@/shared/layout-components/seo/seo';
import { useGetAllRoles } from '@/rest/role';
import { useTranslation } from 'react-i18next';
import RolePermissionDrawer from '@/component-lib/modal/drawer/RolePermissionDrawer';
import { Role } from '@/types/role';
import { useAtom } from 'jotai';
import { permissionsAtomS } from '@/stores/atom';
import { hasPagePermission } from '@/utils/public';
import { useRouter } from 'next/router';
import { getStaticTranslations } from '@/lib/i18n';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'role', 'menu']);
}

const RolePermissionPage = () => {
  const { t } = useTranslation(['common', 'role', 'menu']);
  const router = useRouter();
  const [permissions] = useAtom(permissionsAtomS);
  
  // 所有 hooks 必须在条件返回之前调用
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: rolesData, isLoading, refetch } = useGetAllRoles();

  // 检查页面权限（在所有 hooks 调用之后）
  const hasPermission = hasPagePermission('page.role.permission', permissions);
  if (!hasPermission) {
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    return null;
  }

  /**
   * 打开权限管理抽屉
   */
  const handleOpenDrawer = (role: Role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  /**
   * 关闭权限管理抽屉
   */
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRole(null);
  };

  return (
    <>
      <div>
        <Seo title={t('role:permission_management', '权限管理')} />

        {/* <!-- breadcrumb --> */}
        <div className="breadcrumb-header justify-content-between">
          <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              {t('role:permission_management', '权限管理')}
            </span>
          </div>
          <div className="justify-content-center mt-2">
            <Breadcrumb className="breadcrumb">
              <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                {t('menu:setting', '设置')}
              </Breadcrumb.Item>
              <Breadcrumb.Item
                className="breadcrumb-item "
                active
                aria-current="page"
              >
                {t('role:permission_management', '权限管理')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        {/* <!-- /breadcrumb --> */}

        {/* <!-- row --> */}
        <Row className="row-sm">
          <Col xl={12} md={12}>
            <Card>
              <Card.Header>
                <Stack direction="horizontal" gap={3} className="mg-b-10">
                  <Button
                    variant="primary"
                    onClick={() => {
                      refetch();
                    }}
                  >
                    {t('common:btn_refresh', '刷新')}
                  </Button>
                </Stack>
              </Card.Header>
              <Card.Body>
                {isLoading ? (
                  <div className="text-center p-4">
                    {t('common:loading', '加载中...')}
                  </div>
                ) : !rolesData || rolesData.length === 0 ? (
                  <div className="text-center p-4">
                    {t('role:no_roles', '暂无角色数据')}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="table table-bordered text-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>{t('role:role_code', '角色代码')}</th>
                          <th>{t('role:role_name', '角色名称')}</th>
                          <th>{t('role:role_name_en', '英文名称')}</th>
                          <th>{t('role:level', '级别')}</th>
                          <th>{t('role:is_system', '系统角色')}</th>
                          <th>{t('role:is_active', '状态')}</th>
                          <th>{t('common:action', '操作')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolesData.map((role: Role) => (
                          <tr key={role.id}>
                            <td>{role.code}</td>
                            <td>{role.name}</td>
                            <td>{role.nameEn || '-'}</td>
                            <td>{role.level}</td>
                            <td>
                              {role.isSystem ? (
                                <Badge bg="info">
                                  {t('common:yes', '是')}
                                </Badge>
                              ) : (
                                <Badge bg="secondary">
                                  {t('common:no', '否')}
                                </Badge>
                              )}
                            </td>
                            <td>
                              {role.isActive ? (
                                <Badge bg="success">
                                  {t('common:active', '启用')}
                                </Badge>
                              ) : (
                                <Badge bg="danger">
                                  {t('common:inactive', '禁用')}
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleOpenDrawer(role)}
                              >
                                {t('role:manage_permissions', '管理权限')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* <!-- row closed --> */}
      </div>

      {/* 角色权限管理抽屉 */}
      <RolePermissionDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        roleId={selectedRole?.id || null}
        roleName={selectedRole?.name}
      />
    </>
  );
};

RolePermissionPage.propTypes = {};
RolePermissionPage.defaultProps = {};
RolePermissionPage.layout = 'Contentlayout';

export default RolePermissionPage;

