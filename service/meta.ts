export const defaultItemsFormValues = {
  plu: '',
  barcode: '',
  sku: '',
  vendor_sku: '',
  name_en: '',
  name_zh: '',
  default_image_file_id: undefined,
  image_file_id_list: [],
  status: 0,
  remarks: '',
  type: '',
  spec: '',
  category_id: undefined,
  tax_rate: 0,
  tax_amount: 0,
  price_like_code: '',
  base_unit_id: undefined,
  case_unit_id: undefined,
  case_exchange_rate: 1,
  lastest_sales_price: 0,
  minimum_inventory: 0,
  aisle: '',
  pur_ref_cost: 0,
  is_available: true,
  vendor_id: undefined,
};

export const defaultWarehouseFormValues = {
  name: '',
  description: '',
  location: '',
  isActive: true,
};
export const defaultUnitFormValues = {
  unit_slug: '',
  name: '',
  remarks: '',
  isActive: true,
};
export const defaultZoneFormValues = {
  name: '',
  description: '',
  capacity: 9999,
  location: '',
  isActive: true,
  storageType: '',
};
export const defaultShelfFormValues = {
  name: '',
  description: '',
  capacity: 9999,
  location: '',
  isActive: true,
  storageType: '',
  zone_id: undefined,
};
export const defaultBinFormValues = {
  name: '',
  description: '',
  capacity: 9999,
  location: '',
  isActive: true,
  storageType: '',
  shelf_id: undefined,
};
export const defaultCategoryFormValues = {
  name: '',
  description: '',
  isActive: true,
};
export const defaultVendorFormValues = {
  vendor_type: '',
  //vendorId
  lboss_vendor_id: '',
  //unit_symbol
  slug: '',
  //名称
  name: '',
  //查询
  search: '',
  phone: '',
  // email: '',//email不要写，因为检测email格式
  address: '',
  city: '',
  province: '',
  postcode: '',
  //备注
  remarks: '',
  isActive: true,
  isOnlyOwnItem: false,
};
export const defaultItemFormValues = {
  plu: undefined,
  barcode: undefined,
  sku: '',
  vendor_sku: undefined,
  name_zh: '',
  name_en: '',
  description: '',
  category: '',
  warehouse: undefined,
  spec: '',
  tax_rate: 0,
  aisle: '',
  base_unit: undefined,
  case_unit: undefined,
  //备注
  remarks: '',
  is_available: true,
};

export const defaultUserFormValues = {
  firstName: '',
  lastName: '',
  role: 'USER',
  email: '',
  //查询
  search: '',
  phone: '',
  avatar: '',
  isActive: true,
};
