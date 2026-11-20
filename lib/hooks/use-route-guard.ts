import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToken } from '@/lib/hooks/use-token';
import { useAtom } from 'jotai';
import { permissionsAtomS } from '@/stores/atom';
import {
  getPermissionByPath,
  getRouteType,
  RouteType,
  shouldCheckPermission,
  findFirstAccessiblePage,
} from '@/lib/route-permission';
import { menuPermissionVisible } from '@/lib/permission';
import { PERMISSIONS_STORAGE_KEY } from '@/lib/constants';

export function useRouteGuard() {
  const router = useRouter();
  const { hasToken, removeToken } = useToken();
  const [permissions] = useAtom(permissionsAtomS);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRouteChange = (url: string) => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const routeType = getRouteType(url);

        if (routeType === RouteType.PRIVATE && !hasToken()) {
          router.push('/login').finally(() => {
            checkingRef.current = false;
          });
          return;
        }

        if (routeType === RouteType.GUEST_ONLY && hasToken()) {
          router
            .push(findFirstAccessiblePage(permissions))
            .finally(() => {
              checkingRef.current = false;
            });
          return;
        }

        if (shouldCheckPermission(url) && hasToken()) {
          const permission = getPermissionByPath(url);

          if (permission) {
            let allowed = menuPermissionVisible(permission, permissions);

            if (!allowed) {
              try {
                const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
                if (stored) {
                  allowed = menuPermissionVisible(
                    permission,
                    JSON.parse(stored),
                  );
                }
              } catch {
                // ignore parse errors
              }
            }

            if (!allowed) {
              removeToken();
              router.push('/login').finally(() => {
                checkingRef.current = false;
              });
              return;
            }
          }
        }

        checkingRef.current = false;
      } catch {
        checkingRef.current = false;
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    if (router.isReady) {
      handleRouteChange(router.pathname);
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, hasToken, permissions, removeToken]);
}