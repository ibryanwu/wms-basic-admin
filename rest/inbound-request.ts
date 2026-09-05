import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export function useCalculateInboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.inboundRequest.calculate,
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
export function useCreateInboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.createRequest,
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

export function useUpdateInboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.updateRequest,
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

export function useDeleteInboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.deleteRequest,
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

export function useSearchInboundRequestList() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.searchRequestList,
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

export function useGetInboundRequestById(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.INBOUND_REQUEST_FIND_BY_ID, params],
    ({ queryKey }) => client.inboundRequest.getRequestById(queryKey[1]),
    { enabled: false },
  );

  return { data, isLoading, error, ...props };
}

export function useApproveRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.approveRequest,
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
    client.inboundRequest.approveRequest,
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
export function usePdfInboundRequest() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.inboundRequest.pdfRequest,
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
