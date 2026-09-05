import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client, { server } from './client';
import { useState } from 'react';

export function useCalculateInboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inbound.calculate,
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
export function useCreateInboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.createOrder, {
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

export function useUpdateInboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.updateOrder, {
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

export function useDeleteInboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.deleteOrder, {
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

export function useSearchInboundOrderList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inbound.searchOrderList,
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

export function useGetInboundOrderById(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.INBOUND_ORDER_FIND_BY_ID, params],
    ({ queryKey }) => client.inbound.getOrderById(queryKey[1]),
    { enabled: false },
  );

  return { data, isLoading, error, ...props };
}

//不用hook为了服务端调用
export const fetchInboundOrderById = async (params: any, token: string) => {
  try {
    return await server.inbound.getOrderByIdSSR(params, token);
  } catch (error) {
    console.error('Error fetching inbound order:', error);
    throw new Error('Failed to fetch inbound order');
  }
};

export function useApproveOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.approveOrder, {
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
export function useVoidOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.approveOrder, {
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
export function usePdfInboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.inbound.pdfOrder, {
    onSuccess: (data) => {
      // if (data.code !== 0) {
      //   setServerError(data.msg);
      // } else {
      // }
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
