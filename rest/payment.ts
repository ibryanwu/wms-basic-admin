import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';
import { SelectOptions } from '@/types';
import {
  convertPaymentMethodOptions,
  convertPaymentStatusOptions,
} from '@/utils/convertToSelectOptions';

export function useGetAllPaymentMethod() {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_ALL_PAYMENT_METHOD],
    ({ queryKey }) => client.payment.getAllPaymentMethod(),
    { enabled: true },
  );
  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      // @ts-ignore
      options = convertPaymentMethodOptions(data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}

export function useGetAllPaymentStatus() {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_ALL_PAYMENT_STATUS],
    ({ queryKey }) => client.payment.getAllPaymentStatus(),
    { enabled: true },
  );
  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      // @ts-ignore
      options = convertPaymentStatusOptions(data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}
