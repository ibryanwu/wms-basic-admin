import React from 'react';
import { useMutation, useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { useAtom } from 'jotai';
import {
  storeInfoAtomS,
  userInfoAtomS,
  userRoleAtomS,
  permissionsAtomS,
} from '../stores/atom';
import {
  clearAuthSession,
  emptyPermissions,
  parsePermissionsFromPayload,
} from '@/lib/auth-session';
import { findFirstAccessiblePage } from '@/lib/route-permission';
import { normalizePermissionApis } from '@/lib/permission';
import { useToken } from '../lib/hooks/use-token';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY, ROLE_USER } from '../lib/constants';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

export function cleanCache() {
  const { removeToken } = useToken();
  removeToken();
  clearAuthSession();
}

export function useLogin() {
  const router = useRouter();

  //const { t } = useTranslation('common');
  const [, setUserRoles] = useAtom(userRoleAtomS);
  const [, setUserInfo] = useAtom(userInfoAtomS);
  const [, setStoreInfo] = useAtom(storeInfoAtomS);
  const [, setPermissions] = useAtom(permissionsAtomS);
  const { setToken } = useToken();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [loginError, setError] = useState(false);

  const { mutate, isLoading, ...props } = useMutation(client.users.login, {
    onSuccess: (data: any): any => {
      if (!data.token) {
        setError(true);
        setErrorCode(data.code);
        setErrorMsg(data.message);

        return data;
      }
      // clear token
      Cookies.remove(AUTH_TOKEN_KEY);
      // clear storage
      setUserRoles('');
      setPermissions(emptyPermissions());
      // login
      setToken(data.token.accessToken, data.token.expiresIn);
      setUserInfo(data.user);
      setUserRoles(data.user.role);
      setStoreInfo({ ...data.user.store, ...data.info });

      const permissionsData = parsePermissionsFromPayload(data);
      setPermissions(permissionsData);

      const navigateAfterLogin = (perms = permissionsData) => {
        router.push(findFirstAccessiblePage(perms));
      };

      const hasPermissions =
        permissionsData.pages.length > 0 ||
        normalizePermissionApis(permissionsData.apis).length > 0;

      if (!hasPermissions) {
        client.auth
          .getMe()
          .then((response: any) => {
            if (response?.code === 0 && response?.data?.permissions) {
              const next = {
                pages: Array.isArray(response.data.permissions.pages)
                  ? response.data.permissions.pages
                  : [],
                apis: Array.isArray(response.data.permissions.apis)
                  ? response.data.permissions.apis
                  : [],
              };
              setPermissions(next);
              navigateAfterLogin(next);
              return;
            }
            navigateAfterLogin();
          })
          .catch(() => navigateAfterLogin());
      } else {
        setTimeout(navigateAfterLogin, 300);
      }
    },
    onError: (err: Error) => {
      setError(true);
      setErrorMsg(err.message);
    },
  });

  return {
    mutate,
    isLoading,
    errorCode,
    errorMsg,
    loginError,
    ...props,
  };
}

export function useRegister() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginError, setError] = useState(false);

  const { mutate, isLoading, ...props } = useMutation(client.users.register, {
    onSuccess: (data: { user: any }) => {
      console.log('Successful', data);
    },
    onError: (err: Error) => {
      setError(true);
      setErrorMsg(err.message);
    },
  });

  return {
    mutate,
    isLoading,
    errorMsg,
    loginError,
    ...props,
  };
}

export const useMe = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.ME],
    ({ queryKey }) => client.users.me(),
  );

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};
export function useGetAllUser(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_ALL_USER, params],
    ({ queryKey }) => client.users.getAllUser(queryKey[1]),
    { enabled: true },
  );

  return { data, isLoading, ...props };
}

//[ADMIN]

//[ADMIN]
export function useChangePassword() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isLoading, ...props } = useMutation(
    client.users.changePassword,
    {
      onSuccess: (data: any) => {
        return data;
      },
      onError: (error: Error) => {
        toast.error('Reset Password Failed !', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      },
    },
  );

  return { mutate, isLoading, serverError, setServerError, ...props };
}

export function useCreateUser() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.users.createUser,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null);
      }
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useUpdateUser() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.users.updateUser,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null);
      }
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
