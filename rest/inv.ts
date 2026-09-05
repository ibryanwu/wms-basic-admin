import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useMutation, useQuery } from 'react-query';
import { SelectOptions } from '@/types';
import { convertItemsOptions } from '@/utils/convertToSelectOptions';
import { useState } from 'react';

export function useGetWarehouse(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_WAREHOUSE, params],
    ({ queryKey }) => client.inv.getWarehouse(queryKey[1]),
    { enabled: true },
  );

  return { data, isLoading, error, ...props };
}

export function useCreateWarehouse() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.createWarehouse,
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

export function useUpdateWarehouse() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.updateWarehouse,
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

export function useSearchInventoryTransactions() {
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.searchInventoryTransactions,
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

export function useSearchItemsInventoryWithCost() {
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.searchItemsInventoryWithCost,
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

// 这是纯获取Inv_Balance
export function useSearchItemsInventory() {
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.searchItemsInventory,
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
export function useSearchItemsInventoryByWarehouse() {
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inv.searchItemsInventoryByWarehouse,
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

export function useSearchLog() {
  let [serverError, setServerError] = useState<string | null>(null);
  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.log.searchLog,
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
