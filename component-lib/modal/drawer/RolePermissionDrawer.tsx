'use client';
import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Sheet,
  DialogTitle,
  DialogContent,
  ModalClose,
  Divider,
  Box,
  Typography,
  Switch,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Card,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Select,
  Option,
} from '@mui/joy';
import { useGetRolePermissions, useSaveRolePermission } from '@/rest/role';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_MODULE_FILTER_ALL = 'all';

interface RolePermissionDrawerProps {
  /**
   * 是否显示抽屉
   */
  open: boolean;
  /**
   * 关闭抽屉的回调
   */
  onClose: () => void;
  /**
   * 角色ID
   */
  roleId: number | null;
  /**
   * 角色名称（用于显示）
   */
  roleName?: string;
}

/**
 * 角色权限管理抽屉组件
 * 用于显示和编辑角色的权限设置
 */
const RolePermissionDrawer: React.FC<RolePermissionDrawerProps> = ({
  open,
  onClose,
  roleId,
  roleName,
}) => {
  const { t } = useTranslation(['common', 'role']);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [apiModuleFilter, setApiModuleFilter] = useState<string>(
    API_MODULE_FILTER_ALL,
  );
  const [showOnlyUngranted, setShowOnlyUngranted] = useState(false);

  const {
    data: permissionsData,
    isLoading,
    error,
    refetch,
  } = useGetRolePermissions(roleId, open && !!roleId);

  const { mutate: savePermission, isLoading: isSaving } = useSaveRolePermission();

  // 初始化展开所有模块
  useEffect(() => {
    if (permissionsData && Object.keys(permissionsData).length > 0) {
      setExpandedModules(Object.keys(permissionsData));
    }
  }, [permissionsData]);

  // 打开抽屉或切换角色时重置 API 权限筛选
  useEffect(() => {
    if (open) {
      setApiModuleFilter(API_MODULE_FILTER_ALL);
      setShowOnlyUngranted(false);
      setActiveTab(0);
    }
  }, [open, roleId]);

  /**
   * 切换权限状态
   */
  const handleTogglePermission = async (
    permissionKey: string,
    enabled: boolean,
  ) => {
    if (!roleId) return;

    savePermission(
      {
        roleId,
        data: {
          permissionKey,
          enabled,
        },
      },
      {
        onSuccess: () => {
          // 保存成功后刷新列表
          refetch();
        },
      },
    );
  };

  /**
   * 切换模块展开/收起
   */
  const handleModuleToggle = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module],
    );
  };

  /**
   * 判断权限是否是 page 权限
   */
  const isPagePermission = (permissionKey: string): boolean => {
    return permissionKey.startsWith('page.');
  };

  /**
   * 将权限数据分为 page 权限和其他权限
   */
  const categorizePermissions = () => {
    if (!permissionsData) {
      return { pagePermissions: {}, otherPermissions: {} };
    }

    const pagePermissions: Record<string, any> = {};
    const otherPermissions: Record<string, any> = {};

    Object.entries(permissionsData).forEach(([module, modulePerms]) => {
      const pageGranted = modulePerms.granted.filter((p) =>
        isPagePermission(p.permissionKey),
      );
      const pageUngranted = modulePerms.ungranted.filter((p) =>
        isPagePermission(p.permissionKey),
      );
      const otherGranted = modulePerms.granted.filter(
        (p) => !isPagePermission(p.permissionKey),
      );
      const otherUngranted = modulePerms.ungranted.filter(
        (p) => !isPagePermission(p.permissionKey),
      );

      if (pageGranted.length > 0 || pageUngranted.length > 0) {
        pagePermissions[module] = {
          module,
          granted: pageGranted,
          ungranted: pageUngranted,
        };
      }

      if (otherGranted.length > 0 || otherUngranted.length > 0) {
        otherPermissions[module] = {
          module,
          granted: otherGranted,
          ungranted: otherUngranted,
        };
      }
    });

    return { pagePermissions, otherPermissions };
  };

  /**
   * 按类别 / 未授权筛选 API 权限
   */
  const filterApiPermissions = (
    modules: Record<string, any>,
  ): Record<string, any> => {
    const filtered: Record<string, any> = {};

    Object.entries(modules).forEach(([module, modulePerms]) => {
      if (
        apiModuleFilter !== API_MODULE_FILTER_ALL &&
        module !== apiModuleFilter
      ) {
        return;
      }

      const granted = showOnlyUngranted ? [] : modulePerms.granted;
      const ungranted = modulePerms.ungranted;

      if (granted.length > 0 || ungranted.length > 0) {
        filtered[module] = {
          module,
          granted,
          ungranted,
        };
      }
    });

    return filtered;
  };

  if (!open || !roleId) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      variant="plain"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-content': {
          width: {
            xs: '100vw',      // 手机：全屏
            sm: '100vw',      // 小屏：全屏
            md: '100vw',      // Pad (768px-1024px)：全屏
            lg: '85vw',       // 桌面：85vw
            xl: '85vw',       // 大桌面：85vw
          },
          maxWidth: {
            xs: '100vw',
            sm: '100vw',
            md: '100vw',
            lg: '1400px',
            xl: '1400px',
          },
        },
      }}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { md: 3, sm: 0 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet
        sx={{
          borderRadius: 'md',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <DialogTitle>
          {t('role:permission_management', '权限管理')}
          {roleName && ` - ${roleName}`}
        </DialogTitle>
        <ModalClose onClick={onClose} />
        <Divider />

        <DialogContent sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert color="danger" variant="soft">
              {t('common:error_loading_data', '加载数据失败')}
            </Alert>
          ) : !permissionsData || Object.keys(permissionsData).length === 0 ? (
            <Alert color="neutral" variant="soft">
              {t('role:no_permissions', '暂无权限数据')}
            </Alert>
          ) : (
            <Box sx={{ p: 2 }}>
              {(() => {
                const { pagePermissions, otherPermissions } =
                  categorizePermissions();

                /**
                 * 渲染权限模块列表
                 */
                const renderPermissionModules = (
                  modules: Record<string, any>,
                  showPermissionKey: boolean,
                ) => {
                  if (Object.keys(modules).length === 0) {
                    return (
                      <Alert color="neutral" variant="soft" sx={{ mt: 2 }}>
                        {t('role:no_permissions', '暂无权限数据')}
                      </Alert>
                    );
                  }

                  return (
                    <Box>
                      {Object.entries(modules).map(([module, modulePerms]) => {
                        const totalCount =
                          modulePerms.granted.length +
                          modulePerms.ungranted.length;
                        const grantedCount = modulePerms.granted.filter(
                          (p: any) => p.enabled,
                        ).length;

                        return (
                          <Accordion
                            key={module}
                            expanded={expandedModules.includes(module)}
                            onChange={() => handleModuleToggle(module)}
                            sx={{ mb: 2 }}
                          >
                            <AccordionSummary
                              indicator={<ExpandMoreIcon />}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'background.level1',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  width: '100%',
                                  pr: 2,
                                }}
                              >
                                <Typography level="title-md">
                                  {module.toUpperCase()}
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'center',
                                  }}
                                >
                                  <Chip
                                    size="sm"
                                    variant="soft"
                                    color="success"
                                  >
                                    {grantedCount}/{totalCount}
                                  </Chip>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              {totalCount === 0 ? (
                                <Box sx={{ p: 2 }}>
                                  <Typography
                                    level="body-sm"
                                    sx={{ color: 'text.tertiary' }}
                                  >
                                    {t(
                                      'role:no_permissions_in_module',
                                      '该模块暂无权限',
                                    )}
                                  </Typography>
                                </Box>
                              ) : (
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  {/* 已授权权限 */}
                                  {modulePerms.granted.map((perm: any) => (
                                    <Grid xs={12} sm={6} md={3} key={perm.id}>
                                      <Card
                                        variant="outlined"
                                        sx={{
                                          p: 1.5,
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'space-between',
                                          '&:hover': {
                                            boxShadow: 'md',
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                          }}
                                        >
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                              level="body-md"
                                              sx={{
                                                fontWeight: 500,
                                                mb: 0.5,
                                                wordBreak: 'break-word',
                                              }}
                                            >
                                              {perm.description ||
                                                perm.permissionKey}
                                            </Typography>
                                            {showPermissionKey && (
                                              <Typography
                                                level="body-sm"
                                                sx={{
                                                  color: 'text.tertiary',
                                                  fontSize: '0.75rem',
                                                  wordBreak: 'break-all',
                                                }}
                                              >
                                                {perm.permissionKey}
                                              </Typography>
                                            )}
                                          </Box>
                                          <Switch
                                            checked={perm.enabled}
                                            onChange={(e) =>
                                              handleTogglePermission(
                                                perm.permissionKey,
                                                e.target.checked,
                                              )
                                            }
                                            disabled={isSaving}
                                            color={
                                              perm.enabled
                                                ? 'success'
                                                : 'neutral'
                                            }
                                            sx={{ flexShrink: 0 }}
                                          />
                                        </Box>
                                      </Card>
                                    </Grid>
                                  ))}

                                  {/* 未授权权限 */}
                                  {modulePerms.ungranted.map((perm: any) => (
                                    <Grid xs={12} sm={6} md={3} key={perm.id}>
                                      <Card
                                        variant="outlined"
                                        sx={{
                                          p: 1.5,
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'space-between',
                                          opacity: 0.7,
                                          '&:hover': {
                                            boxShadow: 'md',
                                            opacity: 0.9,
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                          }}
                                        >
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                              level="body-md"
                                              sx={{
                                                fontWeight: 500,
                                                mb: 0.5,
                                                wordBreak: 'break-word',
                                              }}
                                            >
                                              {perm.description ||
                                                perm.permissionKey}
                                            </Typography>
                                            {showPermissionKey && (
                                              <Typography
                                                level="body-sm"
                                                sx={{
                                                  color: 'text.tertiary',
                                                  fontSize: '0.75rem',
                                                  wordBreak: 'break-all',
                                                }}
                                              >
                                                {perm.permissionKey}
                                              </Typography>
                                            )}
                                          </Box>
                                          <Switch
                                            checked={false}
                                            onChange={(e) =>
                                              handleTogglePermission(
                                                perm.permissionKey,
                                                e.target.checked,
                                              )
                                            }
                                            disabled={isSaving}
                                            color="neutral"
                                            sx={{ flexShrink: 0 }}
                                          />
                                        </Box>
                                      </Card>
                                    </Grid>
                                  ))}
                                </Grid>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  );
                };

                return (
                  <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value as number)}
                  >
                    <TabList>
                      <Tab>
                        {t('role:page_permissions', '页面权限')} (
                        {Object.keys(pagePermissions).length})
                      </Tab>
                      <Tab>
                        {t('role:api_permissions', 'API权限')} (
                        {Object.keys(otherPermissions).length})
                      </Tab>
                    </TabList>
                    <TabPanel value={0}>
                      {renderPermissionModules(pagePermissions, true)}
                    </TabPanel>
                    <TabPanel value={1}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          alignItems: 'flex-end',
                          mb: 2,
                          mt: 1,
                        }}
                      >
                        <FormControl size="sm" sx={{ minWidth: 200 }}>
                          <FormLabel>
                            {t('role:filter_by_category', '按类别过滤')}
                          </FormLabel>
                          <Select
                            value={apiModuleFilter}
                            onChange={(_, value) =>
                              setApiModuleFilter(
                                (value as string) || API_MODULE_FILTER_ALL,
                              )
                            }
                            placeholder={t('role:all_categories', '全部类别')}
                          >
                            <Option value={API_MODULE_FILTER_ALL}>
                              {t('role:all_categories', '全部类别')}
                            </Option>
                            {Object.keys(otherPermissions).map((module) => (
                              <Option key={module} value={module}>
                                {module.toUpperCase()}
                              </Option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl
                          orientation="horizontal"
                          size="sm"
                          sx={{
                            gap: 1,
                            alignItems: 'center',
                            pb: 0.5,
                          }}
                        >
                          <Switch
                            checked={showOnlyUngranted}
                            onChange={(e) =>
                              setShowOnlyUngranted(e.target.checked)
                            }
                            color={showOnlyUngranted ? 'warning' : 'neutral'}
                          />
                          <FormLabel sx={{ m: 0 }}>
                            {t(
                              'role:show_only_ungranted',
                              '只显示未授权',
                            )}
                          </FormLabel>
                        </FormControl>
                      </Box>
                      {renderPermissionModules(
                        filterApiPermissions(otherPermissions),
                        false,
                      )}
                    </TabPanel>
                  </Tabs>
                );
              })()}
            </Box>
          )}
        </DialogContent>
      </Sheet>
    </Drawer>
  );
};

export default RolePermissionDrawer;

