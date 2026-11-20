import { menuPermissionVisible } from '@/lib/permission';

export function flattenMenuLinks(menuItem) {
  const links = [];

  if (!menuItem) {
    return links;
  }

  if (Array.isArray(menuItem.children)) {
    for (const child of menuItem.children) {
      if (child.type === 'link') {
        links.push(child);
      }
      if (Array.isArray(child.children)) {
        links.push(...flattenMenuLinks(child));
      }
    }
  }

  return links;
}

export function isChildMenuVisible(childItem, permissions, storeInfo) {
  return (
    !childItem?.permission ||
    menuPermissionVisible(childItem.permission, permissions, storeInfo)
  );
}

export function getVisibleLinks(menuItem, permissions, storeInfo) {
  return flattenMenuLinks(menuItem).filter((child) =>
    isChildMenuVisible(child, permissions, storeInfo),
  );
}

export function isPrimaryMenuVisible(menuItem, permissions, storeInfo) {
  if (!menuItem) {
    return false;
  }

  if (menuItem.type === 'link') {
    return isChildMenuVisible(menuItem, permissions, storeInfo);
  }

  return getVisibleLinks(menuItem, permissions, storeInfo).length > 0;
}