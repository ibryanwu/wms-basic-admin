import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCalculateOutboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.outboundRequest.calculate,
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
export function useCreateOutboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.createRequest,
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

export function useUpdateOutboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.updateRequest,
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

export function useDeleteOutboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.deleteRequest,
    {
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
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useSearchOutboundRequestList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.searchRequestList,
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

export function useGetOutboundRequestById(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.OUTBOUND_REQUEST_FIND_BY_ID, params],
    ({ queryKey }) => client.outboundRequest.getRequestById(queryKey[1]),
    { enabled: false },
  );

  return { data, isLoading, error, ...props };
}

export function useApproveRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.approveRequest,
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

export function useVoidRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.approveRequest,
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
export function usePdfOutboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.outboundRequest.pdfRequest,
    {
      onSuccess: (data) => {
        // if (data.code !== 0) {
        //   setServerError(data.msg);
        // } else {
        // }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  return { mutate, data, isLoading, serverError, setServerError };
}
