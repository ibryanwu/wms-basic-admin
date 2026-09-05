import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCalculateOutboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.outbound.calculate,
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
export function useCreateOutboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.outbound.createOrder, {
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

export function useUpdateOutboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.outbound.updateOrder, {
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

export function useDeleteOutboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.outbound.deleteOrder, {
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

export function useSearchOutboundOrderList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.searchOrderList,
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
// export function useGetPurchaseHistoryByPlu() {
//   let [serverError, setServerError] = useState<string | null>(null);

//   const { mutate, data, isLoading } = useMutation(
//     client.inbound.getPurchaseHistoryByPlu,
//     {
//       onSuccess: (data) => {
//         if (data.code !== 0) {
//           setServerError(data.msg);
//         } else {
//           setServerError(null);
//         }
//       },
//       onError: (error: Error) => {
//         setServerError(error.message);
//       },
//     },
//   );

//   return { mutate, data, isLoading, serverError, setServerError };
// }

export function useGetOutboundOrderById(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.OUTBOUND_ORDER_FIND_BY_ID, params],
    ({ queryKey }) => client.outbound.getOrderById(queryKey[1]),
    { enabled: false },
  );

  return { data, isLoading, error, ...props };
}

export function useApproveOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.approveOrder,
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
export function useCancelPicking() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.cancelPicking,
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
export function useFinishOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.outbound.finishOrder, {
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

  const { mutate, data, isLoading } = useMutation(
    client.outbound.approveOrder,
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
export function usePdfOutboundOrder() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(client.outbound.pdfOrder, {
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
export function usePrintPickingList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.printPickingList,
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
export function useGetPickingListData() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.getPickingList,
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

export function useGetBulkPickingListData() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outbound.getBulkPickingList,
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
