export interface IOutboundItem {
  item_id: string;
  batchNumber: string;
  sort_index: number;
  remark: string;
  case_exchange_rate: 1;
  qty_case: number;
  qty_base: number;
  base_unit_id: number;
  case_unit_id: number;
  price_base: number;
  price_case: number;
  tax_rate: number;
  expiry_date: Date;
  received_qty: 0;
  is_partial_received: boolean;
  is_promotional_item: boolean;
  warehouse_id: number;
  zone_id: number;
  shelf_id: number;
  bin_id: number;
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
export interface ItotalAmount {
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  discount_rate?: number;
  discount_amount?: number;
}
