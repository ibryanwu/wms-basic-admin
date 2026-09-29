export const SYS_VERSION = 'v26.09.28';
export const DEFAULT_STORE_LOGO = '/assets/img/brand/wms-logo.svg';
export const mobileWidth = parseInt(
  process.env.NEXT_PUBLIC_MOBILE_WIDTH as string,
);

export function getStoreLogoUrl(logoUrl?: string | null) {
  return logoUrl?.trim() ? logoUrl.trim() : DEFAULT_STORE_LOGO;
}
