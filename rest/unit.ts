import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';
import { SelectOptions } from '@/types';
import { convertUnitOptions } from '@/utils/convertToSelectOptions';

export function useGetAllUnits(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_UNIT, params],
    ({ queryKey }) => client.unit.getAllUnits(queryKey[1]),
    { enabled: true },
  );
  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      //@ts-ignore
      options = convertUnitOptions(data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}

export function useUpdateUnit() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.unit.updateUnit,
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

export function useCreateUnit() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.unit.createUnit,
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
