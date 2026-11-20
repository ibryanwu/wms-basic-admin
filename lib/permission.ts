import { useAtom } from 'jotai';
import { permissionsAtomS, storeInfoAtomS } from '@/stores/atom';
import type { UserPermissions } from '@/types/role';

interface StoreInfo {
  blockedFeature?: string[] | null;
}

type PermissionApiEntry = string | { key?: string };

export function normalizePermissionApis(apis: unknown): string[] {
  if (!Array.isArray(apis) || apis.length === 0) return [];
  return (apis as PermissionApiEntry[])
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && 'key' in entry) {
        const k = (entry as { key?: string }).key;
        return typeof k === 'string' ? k.trim() : '';
      }
      return '';
    })
    .filter((k) => k.length > 0);
}

export function hasPagePermission(
  permission: string,
  permissions?: UserPermissions,
  storeInfo?: StoreInfo,
): boolean {
  if (!permission) {
    return true;
  }

  if (permissions?.pages && permissions.pages.length > 0) {
    return permissions.pages.includes(permission);
  }

  if (
    storeInfo?.blockedFeature &&
    Array.isArray(storeInfo.blockedFeature) &&
    storeInfo.blockedFeature.length > 0
  ) {
    const slug = permission.replace('page.', '').split('.')[0];
    return !storeInfo.blockedFeature.includes(slug);
  }

  if (
    permissions !== undefined &&
    (!permissions?.pages || permissions.pages.length === 0) &&
    (!storeInfo?.blockedFeature ||
      !Array.isArray(storeInfo.blockedFeature) ||
      storeInfo.blockedFeature.length === 0)
  ) {
    return false;
  }

  return true;
}

export function hasApiPermission(
  apiPermission: string,
  permissions?: UserPermissions,
  storeInfo?: StoreInfo,
): boolean {
  if (!apiPermission) {
    return true;
  }

  const apiKeys = normalizePermissionApis(permissions?.apis);

  if (apiKeys.length > 0) {
    return apiKeys.includes(apiPermission);
  }

  if (
    permissions !== undefined &&
    (!permissions?.pages || permissions.pages.length === 0) &&
    (!storeInfo?.blockedFeature ||
      !Array.isArray(storeInfo.blockedFeature) ||
      storeInfo.blockedFeature.length === 0)
  ) {
    return false;
  }

  if (permissions !== undefined && apiKeys.length === 0) {
    return false;
  }

  return true;
}

export function hasAnyPagePermission(
  permissionList: string[],
  permissions?: UserPermissions,
  storeInfo?: StoreInfo,
): boolean {
  if (!permissionList || permissionList.length === 0) {
    return true;
  }
  return permissionList.some((permission) =>
    hasPagePermission(permission, permissions, storeInfo),
  );
}

export function menuPermissionVisible(
  permission: string | undefined,
  permissions?: UserPermissions,
  storeInfo?: StoreInfo,
): boolean {
  if (!permission) {
    return true;
  }
  if (permission.startsWith('api.')) {
    return hasApiPermission(permission, permissions, storeInfo);
  }
  return hasPagePermission(permission, permissions, storeInfo);
}

export function useHasPagePermission(permission: string): boolean {
  const [permissions] = useAtom(permissionsAtomS);
  const [storeInfo] = useAtom(storeInfoAtomS);
  return hasPagePermission(permission, permissions, storeInfo);
}

export function useHasApiPermission(apiPermission: string): boolean {
  const [permissions] = useAtom(permissionsAtomS);
  const [storeInfo] = useAtom(storeInfoAtomS);
  return hasApiPermission(apiPermission, permissions, storeInfo);
}