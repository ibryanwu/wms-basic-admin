import { atom, useAtom } from 'jotai';

import {
  AUTH_TOKEN_KEY,
  USER_ROLES_STORAGE_KEY,
  USER_INFO_STORAGE_KEY,
  STORE_INFO,
} from '../lib/constants';
import { atomWithStorage } from 'jotai/utils';

interface IuserInfo {
  name?: string;
  company?: { name?: string; id?: string; slug?: string; logo_slug?: string };
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Store
export const storeDefaultLanguageAtom = atom('en');
export const storeInfoAtomS = atomWithStorage(STORE_INFO, {});
// Order
export const orderMultiUnitAtomS = atomWithStorage('MULTI_UNIT', false); //出入库单是否显示价格
export const orderExtendInfoAtomS = atomWithStorage('EXTEND_INFO', false); //出入库单是否显示辅计量等信息
//Metadata Modal/Dialog Control
export const openWarehouseModalAtom = atom(false);
export const openItemModalAtom = atom(false);
export const openVendorModalAtom = atom(false);
export const openUnitModalAtom = atom(false);
export const openCategoryModalAtom = atom(false);
export const openUserModalAtom = atom(false);
export const openZoneModalAtom = atom(false);
export const openShelfModalAtom = atom(false);
export const openBinModalAtom = atom(false);

// Drawer
export const openPickingListDrawerAtom = atom(false);
export const openBulkPickingListDrawerAtom = atom(false);
export const openInUseOrEmptyBinListDrawerAtom = atom(false);
export const openInboundRequestViewDrawerAtom = atom(false);
export const openOutboundRequestViewDrawerAtom = atom(false);

// 触发仓库区架位重新搜索的开关 true则需要重新检索，检索完毕false
export const searchLocationAtom = atom(false);

//Purchase Order
export const itemListAtom = atom<any[]>([]); //采购单的商品
export const editItemAtom = atom<any>({});
export const openPurItemDrawerAtom = atom(false);
export const purOrderEditType = atom(''); //create | update
export const deleteOrderIdAtom = atom('');

//

//Purchase Item
export const pluPurHistoryAtom = atom('');

//Sales Order
export const itemListForSalesAtom = atom<any[]>([]); //销售单的商品
export const editItemForSalesAtom = atom<any>({});
export const openSalesItemDrawerAtom = atom(false);
export const salesOrderEditType = atom(''); //create | update
export const deleteSalesOrderIdAtom = atom('');

//Sales Item
export const pluSalesHistoryAtom = atom('');

//
export const userRoleAtomS = atomWithStorage(USER_ROLES_STORAGE_KEY, '');
export const userInfoAtomS = atomWithStorage<IuserInfo>(
  USER_INFO_STORAGE_KEY,
  {},
);
//
export const currentAnswerResultAtom = atom({});
export const allAnswerResultAtom = atom<
  {
    questionIndex: number;
    answer: any; // selected answer
    currentlyQuizResultId: string;
    answersJson: string; //Json format
  }[]
>([]);
export const authResponseAtom = atom(0); //0,401,403
export const forceRefreshAtom = atom(false);
//

export const changePasswordModalAtom = atom(false);
export const deleteQuizConfirmAtom = atom(false);
//-----------------
export function useClearAllAtom() {
  const [, setItemListDatas] = useAtom(itemListAtom);
  const [, setEditItemAtom] = useAtom(editItemAtom);
  const [, setOpenPurItemDrawerAtom] = useAtom(openPurItemDrawerAtom);
  const [, setPurOrderEditType] = useAtom(purOrderEditType);
  const [, setPluHist] = useAtom(pluPurHistoryAtom);
  //-----------------
  const [, setItemListForSalesAtom] = useAtom(itemListForSalesAtom);
  const [, setEditItemForSalesAtom] = useAtom(editItemForSalesAtom);
  const [, setOpenSalesItemDrawerAtom] = useAtom(openSalesItemDrawerAtom);
  const [, setSalesOrderEditType] = useAtom(salesOrderEditType);
  const [, setDeleteSalesOrderIdAtom] = useAtom(deleteSalesOrderIdAtom);
  return () => {
    setItemListDatas([]);
    setEditItemAtom({});
    setOpenPurItemDrawerAtom(false);
    setPurOrderEditType('');
    setPluHist('');
    //
    setItemListForSalesAtom([]);
    setEditItemForSalesAtom({});
    setOpenSalesItemDrawerAtom(false);
    setSalesOrderEditType('');
    setDeleteSalesOrderIdAtom('');
  };
}
