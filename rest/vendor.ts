import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';
import { SelectOptions } from '@/types';

export function useGetAllVendors(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_ALL_VENDORS, params],
    ({ queryKey }) => client.vendor.getAllVendors(queryKey[1]),
    { enabled: true },
  );

  return { data, isLoading, error, ...props };
}

export const useSyncAllVendor = () => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.SYNC_ALL_VENDORS],
    queryFn: ({ queryKey }) => client.vendor.syncAllVendor(),
    enabled: false,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export function useCreateVendors() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.vendor.createVendors,
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

export function useUpdateVendors() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.vendor.updateVendors,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
