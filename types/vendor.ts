export interface IVendor {
  id: string;
  //客户供应商 1-供应商 2-客户 3-客户&供应商
  vendor_type: number;
  vendor_type_selected: any;
  //vendorId
  lboss_vendor_id: string;
  //unit_symbol
  slug?: string;
  //名称
  name: string;
  //查询
  search?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postcode?: string;
  //备注
  remarks: string;
  isActive?: boolean;
  isOnlyOwnItem?: boolean;
}
