import { IUnitId } from './purchase';

export interface IItem {
  id?: string;
  plu?: string;
  upc?: string;
  storeId: string;
  barcode: string;
  sku?: string;
  category: any;
  category_id?: string;
  vendor_sku: string;
  name_localizations: any;
  description: string;
  search: string;
  status: number;
  remarks: string;
  type: string;
  spec: string;
  tax_rate: string | number;
  tax_amount: string | number;
  price_like_code: string;
  case_exchange_rate: string | number;
  lastest_sales_price: string;
  pur_ref_cost: string;
  is_available: boolean;
  base_unit_id: IUnitId;
  case_unit_id: IUnitId;
  vendor_id?: string;
  base_unit?: any;
  case_unit?: any;
  vendor: any;
  minimum_inventory?: string | number;
}

export interface ISearchItem {
  sku?: string;
  search: string;
  remarks: string;
  warehouse_id: string;
  category_id: string;
  is_available: boolean;
}
