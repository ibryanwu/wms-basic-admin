import { useMutation, useQuery } from 'react-query';
import client from './client';
import { useState } from 'react';

export function useSearchInventories() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inventory.searchInventories,
    onSuccess: (data: any) => {
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
export function useItemSummarize() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inventory.itemSummarize,
    onSuccess: (data: any) => {
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

export function useIsPicked() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inventory.isPicked,
    onSuccess: (data: any) => {
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

export function useBulkConfirmPicked() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inventory.bulkConfirmPicked,
    onSuccess: (data: any) => {
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
