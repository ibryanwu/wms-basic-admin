import { MENUITEMS } from '@/shared/layout-components/sidebar/nav';
import { flattenMenuLinks } from '@/shared/layout-components/sidebar/menu-utils';
import { hasPagePermission } from '@/lib/permission';
import type { UserPermissions } from '@/types/role';

interface MenuLinkItem {
  path?: string;
  permission?: string;
}

export enum RouteType {
  PRIVATE = 'private',
  GUEST_ONLY = 'guest',
  PUBLIC = 'public',
}

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const GUEST_ONLY_ROUTES = ['/login', '/signup'];

export function getPermissionByPath(pathname: string): string | null {
  const pathWithoutQuery = pathname.split('?')[0];
  const segments = pathWithoutQuery.split('/').filter(Boolean);

  for (const menuGroup of MENUITEMS) {
    if (menuGroup.Items) {
      for (const item of menuGroup.Items) {
        if (item.path === pathWithoutQuery && item.permission) {
          return item.permission;
        }

        const childLinks = flattenMenuLinks(item) as MenuLinkItem[];
        for (const child of childLinks) {
          if (child.path === pathWithoutQuery && child.permission) {
            return child.permission;
          }

          if (segments.length >= 2 && child.path) {
            const childSegments = child.path.split('/').filter(Boolean);
            if (
              childSegments.length === 1 &&
              segments[0] === childSegments[0] &&
              child.permission
            ) {
              return child.permission;
            }
          }
        }

        if (segments.length === 2) {
          const staticSeconds = new Set(
            childLinks
              .map((ch: MenuLinkItem) => {
                const p = ch.path?.split('/').filter(Boolean) ?? [];
                return p.length >= 2 ? p[1] : null;
              })
              .filter((x): x is string => Boolean(x)),
          );
          if (!staticSeconds.has(segments[1])) {
            const parentSeg = segments[0];
            const tmpl = childLinks.find(
              (ch) => ch.path === `/${parentSeg}/create`,
            );
            if (tmpl?.permission) {
              return tmpl.permission;
            }
            const detailTmpl = childLinks.find(
              (ch) =>
                ch.path === `/${parentSeg}/order-list` ||
                ch.path === `/${parentSeg}/request-list`,
            );
            if (detailTmpl?.permission) {
              return detailTmpl.permission;
            }
          }
        }
      }
    }
  }

  return null;
}

export function getRouteType(pathname: string): RouteType {
  if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return RouteType.GUEST_ONLY;
  }

  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return RouteType.PUBLIC;
  }

  return RouteType.PRIVATE;
}

export function shouldCheckPermission(pathname: string): boolean {
  return getRouteType(pathname) === RouteType.PRIVATE;
}

export function getAllMenuPaths(): Array<{
  path: string;
  permission: string | null;
}> {
  const paths: Array<{ path: string; permission: string | null }> = [];

  for (const menuGroup of MENUITEMS) {
    if (menuGroup.Items) {
      for (const item of menuGroup.Items) {
        if (item.path && item.path !== '/') {
          paths.push({
            path: item.path,
            permission: item.permission || null,
          });
        }

        const childLinks = flattenMenuLinks(item) as MenuLinkItem[];
        for (const child of childLinks) {
          if (child.path) {
            paths.push({
              path: child.path,
              permission: child.permission || null,
            });
          }
        }
      }
    }
  }

  return paths;
}

export function findFirstAccessiblePage(
  permissions?: UserPermissions,
): string {
  const paths = getAllMenuPaths();

  if (!permissions?.pages?.length) {
    return '/login';
  }

  for (const { path, permission } of paths) {
    if (!permission) {
      if (path !== '/login' && path !== '/signup') {
        return path;
      }
      continue;
    }

    if (hasPagePermission(permission, permissions)) {
      return path;
    }
  }

  return '/login';
}