import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY } from '../../lib/constants';
import { HttpClientPostOptions } from '@/types';

// const PUBLIC_REST_API_ENDPOINT = process.env.PUBLIC_REST_API_ENDPOINT;

const Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT,
  timeout: 5000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
Axios.interceptors.request.use((config: any) => {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token ? token : ''}`,
  };

  return config;
});

// Change response data/error here
Axios.interceptors.response.use(
  (response) => response,
  function (error) {
    if (
      error.response &&
      error.response.status === 401 //No Token -- Unauthorized
      //||  (error.response && error.response.status === 403) //Has Token -- Forbidden
    ) {
      Cookies.remove(AUTH_TOKEN_KEY);
    }

    return Promise.reject(error);
  },
);

function appendQueryParamsToUrl(
  url: string,
  params?: Record<string, any>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return url; // 如果 params 为 undefined 或为空对象，直接返回原始的 url
  }

  const queryParams = new URLSearchParams(params);
  const fullUrl =
    url + (url.includes('?') ? '&' : '?') + queryParams.toString();
  return fullUrl;
}

interface PostForPdfProps {
  url: string;
  data: any;
  headers?: any;
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream';
}

//服务器端的请求调用，header要带token，从getServerSideProps传递过来
export class HttpServer {
  // 创建 Axios 实例
  private static createAxiosInstance(token: string | null = null) {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_ENDPOINT, // 替换为你的 API 地址
      timeout: 500000,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 允许发送 cookies
    });
  }

  // 封装 GET 方法
  static async get<T>(
    url: string,
    params?: Record<string, any>,
    token: string | null = null,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const axiosInstance = this.createAxiosInstance(token);

    try {
      const response: AxiosResponse<T> = await axiosInstance.get(url, {
        ...config,
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`HTTP GET Error: ${url}`, error);
      throw error;
    }
  }

  // 静态 POST 方法（可选）
  static async post<T>(
    url: string,
    data?: any,
    token: string | null = null,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const axiosInstance = this.createAxiosInstance(token);

    try {
      const response: AxiosResponse<T> = await axiosInstance.post(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      console.error(`HTTP POST Error: ${url}`, error);
      throw error;
    }
  }
  // 静态 PUT 方法(未测试过)
  static async put<T>(
    url: string,
    data?: any,
    token: string | null = null,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const axiosInstance = this.createAxiosInstance(token);

    try {
      const response: AxiosResponse<T> = await axiosInstance.put(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      console.error(`HTTP PUT Error: ${url}`, error);
      throw error;
    }
  }

  // 静态 DELETE 方法(未测试过)
  static async delete<T>(
    url: string,
    token: string | null = null,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const axiosInstance = this.createAxiosInstance(token);

    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(
        url,
        config,
      );
      return response.data;
    } catch (error) {
      console.error(`HTTP DELETE Error: ${url}`, error);
      throw error;
    }
  }
}

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await Axios.get<T>(url, { params });
    return response.data;
  }

  static async post<T>(props: HttpClientPostOptions) {
    let { url, data, params, options, id } = props;
    // Replace {id} in URL if id is provided
    if (id) {
      url = url.replace('{id}', encodeURIComponent(id.toString()));
    }
    const response = await Axios.post<T>(
      appendQueryParamsToUrl(url, params),
      data,
      options,
    );
    return response.data;
  }

  static async postForPDF<T>(props: PostForPdfProps): Promise<T> {
    const { url, data, headers, responseType = 'json' } = props;

    try {
      const response = await Axios.post<T>(url, data, {
        headers: headers,
        responseType: responseType, // 使用传递的 responseType
      });
      return response.data;
    } catch (error) {
      // 根据你的错误处理策略处理错误，这里只是简单地抛出了异常
      throw error;
    }
  }

  static async put<T>(url: string, data: unknown) {
    const response = await Axios.put<T>(url, data);
    return response.data;
  }

  static async delete<T>(props: HttpClientPostOptions) {
    let { url, id } = props;
    // Replace {id} in URL if id is provided
    if (id) {
      url = url.replace('{id}', encodeURIComponent(id.toString()));
    }
    const response = await Axios.delete<T>(url);
    return response.data;
  }
}
