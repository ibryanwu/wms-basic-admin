import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useMutation, useQuery } from 'react-query';
import { SelectOptions } from '@/types';
import {
  convertCategoryOptions,
  convertItemsOptions,
} from '@/utils/convertToSelectOptions';
import { useState } from 'react';

export function useGetCategory(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_ALL_CATEGORIES, params],
    ({ queryKey }) => client.category.getAllCategories(queryKey[1]),
    { enabled: true },
  );

  function handleFun() {
    let options: SelectOptions[] = [];
    if (data) {
      options = convertCategoryOptions(data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}

export function useCreateCategory() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.category.createCategory,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      console.log('🚀 ~ useCreateZone ~ error:', error);
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useUpdateCategory() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.category.updateCategory,
    onSuccess: (data: any) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useDeleteCategory() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.category.deleteCategory,
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
