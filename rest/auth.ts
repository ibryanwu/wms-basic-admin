import { useMutation, useQuery, useQueryClient } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';

export const useMe = (): any => {
  const [isMe, setIsMe] = useState(false);
  const router = useRouter();
  const { hasToken, removeToken } = useToken();
  const { mutate, data, isLoading } = useMutation(client.auth.getMe, {
    onSuccess: (data: any) => {
      if (typeof data?.id === 'string') {
        setIsMe(true);
      }
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        removeToken();
        router.push('/login');
      }
    },
    onSettled: () => {},
  });

  return { mutate, data, isLoading, isMe };
};
export const useBackEndVersion = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.BACKEND_V],
    ({ queryKey }) => client.auth.getBackendV(),
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
    onSuccess: (data) => {
      toast.success('Email sent successfully! ');
    },
    onError: (error) => {
      console.log(
        '🚀 ~ file: auth.ts:17 ~ usePostEmailForForgotPsw ~ error:',
        error,
      );
      toast.error('---wrong');
    },
    onSettled: () => {},
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
    onError: (error) => {

      toast.error('Password Reset Failed!');
    },
    onSettled: () => {},
  });
};
