import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';

export const useGetTotalizersView = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_TOTALIZERS_VIEW],
    ({ queryKey }) => client.report.getTotalizersView(),
  );

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export const useFetchDayTotalizer = (params: any) => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.FETCH_DAY_TOTALIZER, params],
    queryFn: ({ queryKey }) => client.report.getFetchDayTotalizer(queryKey[1]),
    enabled: false,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};
export const useGetSubDeptOptions = (): any => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.GET_SUB_DEPT_OPTIONS],
    queryFn: ({}) => client.report.getSubDeptOptions(),
    enabled: true,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export const useGetItemsSalePriceDeficit = (params: any): any => {
  const { data, isLoading, error, ...props } = useQuery({
    queryKey: [API_ENDPOINTS.GET_ITEMS_SALE_PRICE_DEFICIT, params],
    queryFn: ({ queryKey }) =>
      client.report.getItemsSalePriceDeficit(queryKey[1]),
    enabled: false,
  });

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export const useGetCoveredItem = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_COVERED_ITEM],
    ({ queryKey }) => client.report.getCoveredItem(),
  );

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};
export const useGetGrossMarginEstimate = (): any => {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_GROSS_MARGIN_ESTIMATE],
    ({ queryKey }) => client.report.getGrossMarginEstimate(),
  );

  return {
    data: data,
    isLoading,
    error,
    ...props,
  };
};

export function useAnalysisGrossProfitPLUSalesByDay() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.report.analysisGrossProfitPLUSalesByDay,
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
