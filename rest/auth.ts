import { useMutation, useQuery, useQueryClient } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import {
  storeInfoAtomS,
  userInfoAtomS,
  userRoleAtomS,
  permissionsAtomS,
} from '@/stores/atom';
import { parsePermissionsFromPayload } from '@/lib/auth-session';

export const useMe = (): any => {
  const [isMe, setIsMe] = useState(false);
  const router = useRouter();
  const { removeToken } = useToken();
  const [userInfo, setUserInfo] = useAtom(userInfoAtomS);
  const [, setUserRoles] = useAtom(userRoleAtomS);
  const [storeInfo, setStoreInfo] = useAtom(storeInfoAtomS);
  const [, setPermissions] = useAtom(permissionsAtomS);

  const { mutate, data, isLoading } = useMutation(client.auth.getMe, {
    onSuccess: (response: any) => {
      if (response?.code === 0 && response?.data) {
        const { user, permissions } = response.data;

        if (user) {
          setUserInfo(user);
          if (user.role) {
            setUserRoles(user.role);
          }
          setIsMe(true);
        }

        if (user?.store) {
          setStoreInfo({
            ...storeInfo,
            ...user.store,
          });
        }

        if (permissions) {
          setPermissions({
            pages: Array.isArray(permissions.pages) ? permissions.pages : [],
            apis: Array.isArray(permissions.apis) ? permissions.apis : [],
          });
        } else {
          setPermissions(parsePermissionsFromPayload(response));
        }
      } else if (typeof response?.id === 'string') {
        setUserInfo(response);
        setIsMe(true);
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        removeToken();
        router.push('/login');
      }
    },
  });

  return { mutate, data, isLoading, isMe, me: userInfo };
};

export const useBackEndVersion = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.BACKEND_V],
    () => client.auth.getBackendV(),
  );

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export const usePostEmailForForgotPsw = () => {
  return useMutation(client.auth.postEmailForForgotPsw, {
    onSuccess: () => {
      toast.success('Email sent successfully! ');
    },
    onError: () => {
      toast.error('---wrong');
    },
  });
};

export const useResetPsw = () => {
  return useMutation(client.auth.resetPassword, {
    onSuccess: (data: any) => {
      if (data!.code === 1) {
        toast.success('Password Reset Successful!');
      } else {
        toast.error('Password Reset Failed!');
      }
    },
    onError: () => {
      toast.error('Password Reset Failed!');
    },
  });
};