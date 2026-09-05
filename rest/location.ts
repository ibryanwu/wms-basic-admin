import { useMutation, useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { useState } from 'react';
import { SelectOptions } from '@/types';
import {
  convertShelfOptions,
  convertBinOptions,
  convertZoneOptions,
} from '@/utils/convertToSelectOptions';

export function useGetZonesByWarehouse() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.location.getZonesByWarehouse,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else {
          setServerError(null); // 清除错误
        }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      //@ts-ignore
      options = convertZoneOptions(data.data);
    }
    return options;
  }

  return {
    mutate,
    options: handleFun(),
    data,
    isLoading,
    serverError,
    setServerError,
  };
}
export function getZonesAndBinItemCountsByWarehouse() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.location.getZonesAndBinItemCountsByWarehouse,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else {
          setServerError(null); // 清除错误
        }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      //@ts-ignore
      options = convertZoneOptions(data.data);
    }
    return options;
  }

  return {
    mutate,
    options: handleFun(),
    data,
    isLoading,
    serverError,
    setServerError,
  };
}
export function useGetNonEmptyBinsByZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.location.getNonEmptyBinsByZone,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else {
          setServerError(null); // 清除错误
        }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  return {
    mutate,
    data,
    isLoading,
    serverError,
    setServerError,
  };
}
export function useGetEmptyBinsByZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.location.getEmptyBinsByZone,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else {
          setServerError(null); // 清除错误
        }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  return {
    mutate,
    data,
    isLoading,
    serverError,
    setServerError,
  };
}
export function useGetAllBinsByZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation(
    client.location.getAllBinsByZone,
    {
      onSuccess: (data) => {
        if (data.code !== 0) {
          setServerError(data.msg);
        } else {
          setServerError(null); // 清除错误
        }
      },
      onError: (error: Error) => {
        setServerError(error.message);
      },
    },
  );

  return {
    mutate,
    data,
    isLoading,
    serverError,
    setServerError,
  };
}

export function useGetShelvesByZoneId(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_SHELVES_BY_ZONE_ID, params],
    ({ queryKey }) => client.location.getShelvesByZoneId(queryKey[1]),
    { enabled: true },
  );
  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      //@ts-ignore
      options = convertShelfOptions(data.data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}
export function useGetBinsByShelfId(params: any) {
  const { data, isLoading, error, ...props } = useQuery(
    [API_ENDPOINTS.GET_BINS_BY_SHELF_ID, params],
    ({ queryKey }) => client.location.getBinsByShelfId(queryKey[1]),
    { enabled: true },
  );
  function handleFun() {
    let options: SelectOptions[] = [];
    if (data && !+data.code) {
      //@ts-ignore
      options = convertBinOptions(data.data);
    }
    return options;
  }

  return { options: handleFun(), data, isLoading, error, ...props };
}
//----------------------------------------------------------------

export function useCreateZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.createZone,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      console.log('🚀 ~ useCreateZone ~ error:', error);
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}

export function useCreateShelf() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.createShelf,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useCreateBin() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.createBin,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
//----------------------------------------------------------------
export function useUpdateZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.updateZone,
    onSuccess: (data) => {
      if (data.code !== 0) {
        setServerError(data.msg);
      } else {
        setServerError(null); // 清除错误
      }
    },
    onError: (error: Error) => {
      setServerError(error.message); // 直接设置错误消息
    },
  });

  return { mutate, data, isLoading, serverError, setServerError };
}
export function useUpdateShelf() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.updateShelf,
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
export function useUpdateBin() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.updateBin,
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
//----------------------------------------------------------------
export function useDeleteZone() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.deleteZone,
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
export function useDeleteShelf() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.deleteShelf,
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
export function useDeleteBin() {
  let [serverError, setServerError] = useState<string | null>(null);

  const { mutate, data, isLoading } = useMutation({
    mutationFn: client.location.deleteBin,
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
