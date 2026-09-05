export interface ITransferItem {
  item_id: string;
  from_warehouse_id: number;
  transfer_quantity: number;
  sort_index: number;
  from_zone_id: number;
  from_shelf_id: number;
  from_bin_id: number;
  remark: string;
  to_warehouse_id: number;
  to_zone_id: number;
  to_shelf_id: number;
  to_bin_id: number;
  batch_number: string;
  expiry_date: string;
}
