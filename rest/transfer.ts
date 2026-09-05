import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCreateTransferOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.transfer.createOrder, {
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

export function useUpdateTransferOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.transfer.updateOrder, {
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

export function useDeleteTransferOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.transfer.deleteOrder, {
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

export function useSearchTransferOrderList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.transfer.searchOrderList,
    {
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
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useApproveOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.transfer.approveOrder,
    {
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
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function usePdfTransferOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.transfer.pdfOrder, {
    onSuccess: (data) => {},
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useGetTransferOrderById(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.TRANSFER_ORDER_FIND_BY_ID, params],
    ({ queryKey }) => client.transfer.getOrderById(queryKey[1]),
    { enabled: false },
  );

  return { data, isLoading, error, ...props };
}
