import Cookies from 'js-cookie';
import {
  AUTH_TOKEN_KEY,
  PERMISSIONS_STORAGE_KEY,
  USER_INFO_STORAGE_KEY,
  USER_ROLES_STORAGE_KEY,
  STORE_INFO,
} from '@/lib/constants';
import type { UserPermissions } from '@/types/role';

export function emptyPermissions(): UserPermissions {
  return { pages: [], apis: [] };
}

export function parsePermissionsFromPayload(data: any): UserPermissions {
  const sources = [
    data?.permissions,
    data?.data?.permissions,
    data?.user?.permissions,
    data?.info?.permissions,
    data?.data?.user?.permissions,
    data?.data?.info?.permissions,
  ];

  for (const p of sources) {
    if (p && (Array.isArray(p.pages) || Array.isArray(p.apis))) {
      return {
        pages: Array.isArray(p.pages) ? p.pages : [],
        apis: Array.isArray(p.apis) ? p.apis : [],
      };
    }
  }

  return emptyPermissions();
}

export function clearAuthSession(): void {
  Cookies.remove(AUTH_TOKEN_KEY);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
    localStorage.removeItem(USER_INFO_STORAGE_KEY);
    localStorage.removeItem(USER_ROLES_STORAGE_KEY);
    localStorage.removeItem(STORE_INFO);
  }
}