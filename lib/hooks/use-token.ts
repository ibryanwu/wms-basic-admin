import Cookies from 'js-cookie';
import { AUTH_TOKEN_KEY } from '../constants';
export function useToken() {
  return {
    setToken(token: string, expires: number) {
      Cookies.set(AUTH_TOKEN_KEY, token, {
        expires: expires / 86400,
      });
    },
    getToken() {
      return Cookies.get(AUTH_TOKEN_KEY);
    },
    removeToken() {
      Cookies.remove(AUTH_TOKEN_KEY);
    },
    hasToken() {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) return false;
      return true;
    },
  };
}
