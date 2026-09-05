import { SelectOptions } from '.';



export interface ItotalAmount {
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  discount_rate?: number;
  discount_amount?: number;
}

export interface IChangedValueForCaculate {
  exchange_rate: string;
  tax_rate: string;
  qty_pur: string;
  price_pur: string;
  discount_rate?: string;
  discount_amount?: string;
}

export interface PurItemDrawerFormData {
  item: IItem;
  exchange_rate: number;
  tax_rate: number;
  qty_pur: number;
  price_pur: number;
  received_qty: number;
  qty_base: number;
  price_base: number;
  is_partial_received: boolean;
  remarks: string;
  promotional_source_items: any;
  is_promotional_item: boolean;
  total: ItotalAmount;
  base_unit_id: IUnitId;
  pur_unit_id: IUnitId;
  discount_rate?: string;
  discount_amount?: string;
  cost_base?: string;
}

export interface IItem {
  value: string;
  label: string;
  id: string;
  plu: string;
  storeId: string;
  barcode: string;
  sku: string;
  vendor_sku: string;
  name_localizations: any;
  description: string;
  search: string;
  status: number;
  remarks: string;
  type: string;
  spec: string;
  tax_rate: string;
  tax_amount: string;
  price_like_code: string;
  exchange_rate: string;
  lastest_sales_price: string;
  pur_ref_cost: string;
  is_available: boolean;
  base_unit_id: IUnitId;
  pur_unit_id: IUnitId;
}
export interface IItemInItemListDatas extends IItem {}

export interface IPromotionalSourceItems extends PurItemDrawerFormData {
  value: string;
  label: string;
  search: string;
}

export interface IUnitId extends SelectOptions {
  name?: string;
}
export interface ISearchOrderParams {
  batch_number: string | undefined;
  highlight: string | undefined;
  invoice_no: string | undefined;
  payment_method: any;
  payment_status: any;
  payment_remark: string | undefined;
  start_date: string | undefined;
  end_date: string | undefined;
  remark: string | undefined;
  vendor: any;
}

export interface IItemListDatas {
  barcode: string;
  base_unit_id: IUnitId | undefined;
  pur_unit_id: IUnitId | undefined;
  exchange_rate: string;
  is_partial_received: boolean;
  is_promotional_item: boolean;
  item: IItemInItemListDatas;
  label: string;
  price_base: number;
  price_pur: string;
  promotional_source_items: IPromotionalSourceItems[];
  promotional_allocated_cost_pur: number;
  promotional_allocated_count?: number;
  promotional_allocated_cost_amount?: number;
  promotional_relationship_value_percentages?: number;
  tax_rate: string;
  qty_pur: string;
  received_qty: string;
  qty_base: number;
  remark: string;
  value: string;
  search: string;
  total: ItotalAmount;
  discount_rate?: string;
  discount_amount?: number;
  cost_base?: number;
  cost_pur?: number;
  subtotal?: number;
  tax_amount?: number;
  row_uuid: string;
}
