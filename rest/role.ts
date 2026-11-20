import { useQuery, useMutation, useQueryClient } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { SavePermissionRequest } from '@/types/role';
import { toast } from 'react-toastify';

export function useGetAllRoles() {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.ROLES_GET_ALL],
    () => client.role.getAll(),
    {
      enabled: true,
    },
  );

  return {
    data: data?.data || null,
    isLoading,
    error,
    refetch,
  };
}

export function useGetRolePermissions(roleId: number | null, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.ROLE_PERMISSIONS_GET, roleId],
    () => {
      if (!roleId) {
        return Promise.resolve({ code: 0, data: null, msg: '' });
      }
      return client.role.getPermissions(roleId);
    },
    {
      enabled: enabled && !!roleId,
    },
  );

  return {
    data: data?.data || null,
    isLoading,
    error,
    refetch,
  };
}

export function useSaveRolePermission() {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    ({ roleId, data }: { roleId: number; data: SavePermissionRequest }) =>
      client.role.savePermission(roleId, data),
    {
      onSuccess: (response, variables) => {
        if (response.code === 0) {
          queryClient.invalidateQueries([
            API_ENDPOINTS.ROLE_PERMISSIONS_GET,
            variables.roleId,
          ]);
          toast.success(response.msg || '保存成功');
        } else {
          toast.error(response.msg || '保存失败');
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || '保存失败');
      },
    },
  );

  return {
    mutate,
    isLoading,
  };
}