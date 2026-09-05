import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCalculateSalesOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.salesOrder.calculate,
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
export function useCreateSalesOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.salesOrder.createOrder,
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

export function useUpdateSalesOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.salesOrder.updateOrder,
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

export function useDeleteSalesOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.salesOrder.deleteOrder,
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

export function useSearchSalesOrderList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.salesOrder.searchSalesOrderList,
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
// export function useGetSalesHistoryByPlu() {
//   let [serverError, setServerError] = useState<string | null>(null);

//   const { mutate, data, isLoading } = useMutation(
//     client.salesItem.getSalesHistoryByPlu,
//     {
//       onSuccess: (data) => {
//         if (data.code !== 0) {
//           setServerError(data.msg);
//         } else {
//         }
//       },
//       onError: (error: Error) => {
//         setServerError(error.message)
//       },
//     },
//   );

//   return { mutate, data, isLoading, serverError, setServerError };
// }
export const useGetSalesOrderById = (params: any) => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.PURCHASE_ORDER_FIND_BY_ID, params],
    queryFn: ({ queryKey }) => client.salesOrder.getSalesOrderById(queryKey[1]),
    enabled: false,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export function useUpdateSalesOrderStatus() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.salesOrder.updateStatus,
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

export function usePdfSalesOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.salesOrder.pdfOrder, {
    onSuccess: (data) => {
      // if (data.code !== 0) {
      //   setServerError(data.msg);
      // } else {
      // }
    },
    onError: (error: Error) => {
      setServerError(error.message)
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
