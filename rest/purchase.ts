import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCalculatePruchaseOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.pruchaseOrder.calculate,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else { setServerError(null); 
      }
    },
    onError: (error: Error) => {
      setServerError(error.message)
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useCreatePruchaseOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.createOrder,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useUpdatePruchaseOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.updateOrder,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useDeletePruchaseOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.deleteOrder,
    {
      onSuccess: (data: any) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useSearchPruchaseOrderList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.searchPurchaseOrderList,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useGetPurchaseHistoryByPlu() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseItem.getPurchaseHistoryByPlu,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}
export const useGetPurchaseOrderById = (params: any) => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.PURCHASE_ORDER_FIND_BY_ID, params],
    queryFn: ({ queryKey }) =>
      client.pruchaseOrder.getPurchaseOrderById(queryKey[1]),
    enabled: false,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export function useUpdatePurOrderStatus() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.updateStatus,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else { setServerError(null); 
        }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}
export function usePdfPurOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.pruchaseOrder.pdfOrder,
    {
      onSuccess: (data) => {
        // if (data.code !== 0) {
        //   setServerError(data.msg);
        // } else {
        // }
      },
      onError: (error: Error) => {
        setServerError(error.message)
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}
