export const API_ENDPOINTS = {
  //AUTH
  LOGIN: 'auth/login',
  REGISTER: '',
  ME: 'auth/me',
  FORGOT_PASSWORD: '',
  RESET_PASSWORD: '',
  BACKEND_V: 'auth/v',
  CHANGE_PASSWORD: '',

  //Users
  USERS: 'users',
  USERS_CREATE: 'users/create',
  USERS_UPDATE: 'users/update',
  GET_ALL_USER: 'users/getAllUser',

  //OtherInv

  //LOG
  LOG_SEARCH: 'log/searchLog',

  //warehouse
  GET_WAREHOUSE: 'warehouse/getWarehouse',
  WAREHOUSE_CREATE: 'warehouse/create',
  WAREHOUSE_UPDATE: 'warehouse/{id}',

  //Location
  ZONE_CREATE: 'zone/create',
  GET_LOCATION: 'zone/getZonesByWarehouse',
  GET_LOCATION_BY_BIN_COUNTS: 'zone/getZonesAndBinItemCountsByWarehouse',
  GET_ZONE_BY_ID: 'zone/{id}',
  ZONE_UPDATE: 'zone/{id}',
  ZONE_DELETE: 'zone/{id}',
  //
  SHELF_CREATE: 'shelf/create',
  GET_SHELF_BY_ID: 'shelf/{id}',
  GET_SHELVES_BY_ZONE_ID: 'shelf/getShelvesByZoneId',
  SHELF_UPDATE: 'shelf/{id}',
  SHELF_DELETE: 'shelf/{id}',
  //
  BIN_CREATE: 'bin/create',
  GET_BIN_BY_ID: 'bin/{id}',
  GET_BINS_BY_SHELF_ID: 'bin/getBinsByShelfId',
  BIN_UPDATE: 'bin/{id}',
  BIN_DELETE: 'bin/{id}',
  //Bin Analysis
  GET_NON_EMPTY_BINS_BY_ZONE: 'zone/getNonEmptyBinsByZone',
  GET_EMPTY_BINS_BY_ZONE: 'zone/getEmptyBinsByZone',
  GET_ALL_BINS_BY_ZONE: 'zone/getAllBinsByZone',

  //InvTrans
  SEARCH_INVENTORY_TRANSACTIONS: 'inv/searchInventoryTransactions',

  //Inventory
  INVENTORY_SEARCH_DETAIL: 'inventory/searchInventories',
  INVENTORY_SUMMARIZE_BY_ITEM: 'inventory/summarizeByItem',
  INVENTORY_IS_PICKED: 'inventory/isPicked', //单个出库单拣货
  INVENTORY_BULK_CONFIRM_PICKED: 'inventory/bulkConfirmPicked', //单个出库单拣货

  //Inbound-request
  INBOUND_REQUEST_CREATE: 'inbound-request/create',
  INBOUND_REQUEST_UPDATE: 'inbound-request/{id}',
  INBOUND_REQUEST_SEARCH: 'inbound-request/searchRequestWithRef', //获取入库申请带外键数据
  INBOUND_REQUEST_FIND_BY_ID: 'inbound-request/getOneWithRefById', //获取一个order的全量数据
  INBOUND_REQUEST_DELETE: 'inbound-request/{id}',
  INBOUND_REQUEST_CALCULATE: 'inbound-request/calculate',
  INBOUND_REQUEST_APPROVE: 'inbound-request/approve/{id}', // 审核操作，设置 is_approved
  PDF_INBOUND_REQUEST: 'pdf/inbound-order-pdf',

  //Outbound-request
  OUTBOUND_REQUEST_CREATE: 'outbound-request/create',
  OUTBOUND_REQUEST_UPDATE: 'outbound-request/{id}',
  OUTBOUND_REQUEST_SEARCH: 'outbound-request/searchRequestWithRef', //获取出库申请带外键数据
  OUTBOUND_REQUEST_FIND_BY_ID: 'outbound-request/getOneWithRefById', //获取一个order的全量数据
  OUTBOUND_REQUEST_DELETE: 'outbound-request/{id}',
  OUTBOUND_REQUEST_CALCULATE: 'outbound-request/calculate',
  OUTBOUND_REQUEST_APPROVE: 'outbound-request/approve/{id}', // 审核操作，设置 is_approved
  PDF_OUTBOUND_REQUEST: 'pdf/outbound-order-pdf',

  //Inbound
  INBOUND_ORDER_CREATE: 'inbound-orders/create',
  INBOUND_ORDER_UPDATE: 'inbound-orders/{id}',
  INBOUND_ORDER_SEARCH: 'inbound-orders/searchOrderWithRef', //获取入库单带外键数据
  INBOUND_ORDER_FIND_BY_ID: 'inbound-orders/getOneWithRefById', //获取一个order的全量数据
  INBOUND_ORDER_DELETE: 'inbound-orders/{id}',
  INBOUND_ORDER_CALCULATE: 'inbound-orders/calculate',
  INBOUND_ORDER_APPROVE: 'inbound-orders/approve/{id}', // 审核操作，设置 is_approved
  INBOUND_ITEM_HISTORY: 'inbound-orders/getPurchaseHistoryByPlu', //??
  PDF_INBOUND_ORDER: 'pdf/inbound-order-pdf',

  //Outbound
  OUTBOUND_ORDER_CREATE: 'outbound-orders/create',
  OUTBOUND_ORDER_UPDATE: 'outbound-orders/{id}',
  OUTBOUND_ORDER_SEARCH: 'outbound-orders/searchOrderWithRef', //获取入库单带外键数据
  OUTBOUND_ORDER_FIND_BY_ID: 'outbound-orders/getOneWithRefById', //获取一个order的全量数据
  OUTBOUND_ORDER_DELETE: 'outbound-orders/{id}',
  OUTBOUND_ORDER_CALCULATE: 'outbound-orders/calculate',
  OUTBOUND_ORDER_APPROVE: 'outbound-orders/approve/{id}', // 审核操作，设置 is_approved
  OUTBOUND_CANCEL_PICKING: 'outbound-orders/cancelPicking/{id}', // 取消拣货
  OUTBOUND_FINISHED: 'outbound-orders/finishOrder/{id}', // 完成
  OUTBOUND_ITEM_HISTORY: 'outbound-orders/getPurchaseHistoryByPlu', //??
  PDF_OUTBOUND_ORDER: 'pdf/outbound-order-pdf',
  PDF_OUTBOUND_ORDER_PICKING: 'pdf/outbound-order-picking-pdf',
  OUTBOUND_PICKING_LIST: 'outbound-orders/generatePickingList/{id}',
  OUTBOUND_BULK_PICKING_LIST: '/outbound-orders/bulkGeneratePickingList',

  //Transfer
  TRANSFER_ORDER_CREATE: 'transfer-orders/create',
  TRANSFER_ORDER_UPDATE: 'transfer-orders/{id}',
  TRANSFER_ORDER_SEARCH: 'transfer-orders/searchOrderWithRef', //获取入库单带外键数据
  TRANSFER_ORDER_DELETE: 'transfer-orders/{id}',
  TRANSFER_ORDER_APPROVE: 'transfer-orders/approve/{id}', // 审核操作，设置 is_approved
  TRANSFER_ORDER_FIND_BY_ID: 'transfer-orders/getOneWithRefById', //获取一个order的全量数据
  PDF_TRANSFER_ORDER: 'pdf/transfer-order-pdf',

  //Purchase
  PURCHASE_ORDER_CREATE: 'purchase-order/create',
  PURCHASE_ORDER_UPDATE: 'purchase-order/update',
  PURCHASE_ORDER_SEARCH: 'purchase-order/search',
  PURCHASE_ORDER_FIND_BY_ID: 'purchase-order/find-by-id',
  PURCHASE_ORDER_DELETE: 'purchase-order/delete',
  PURCHASE_ORDER_CALCULATE: 'purchase-order/calculate',
  PURCHASE_ORDER_UPDATE_STATUS: 'purchase-order/updateStatus',
  PURCHASE_ITEM_HISTORY: 'purchase-item/getPurchaseHistoryByPlu',
  PDF_PUR_ORDER: 'pdf/pur-order-pdf',

  //Sales
  SALES_ORDER_CREATE: 'sales-order/create',
  SALES_ORDER_UPDATE: 'sales-order/update',
  SALES_ORDER_SEARCH: 'sales-order/search',
  SALES_ORDER_FIND_BY_ID: 'sales-order/find-by-id',
  SALES_ORDER_DELETE: 'sales-order/delete',
  SALES_ORDER_CALCULATE: 'sales-order/calculate',
  SALES_ORDER_UPDATE_STATUS: 'sales-order/updateStatus',
  PDF_SALES_ORDER: 'pdf/sales-order-pdf',
  //SALES_ITEM_HISTORY: 'sales-order/getSalesHistoryByPlu',

  //Report
  GET_ITEMS_SALE_PRICE_DEFICIT: 'report/getItemsSalePriceDeficit',
  GET_COVERED_ITEM: 'report/getCoveredItem',
  GET_GROSS_MARGIN_ESTIMATE: 'report/getGrossMarginEstimate',
  GET_SUB_DEPT_OPTIONS: 'report/getSubDeptOptions',
  GET_GROSS_PROFIT_ANALYSIS: 'report/analysisGrossProfitPLUSalesByDay',

  //Unit
  GET_UNIT: 'unit/getAllUnits',
  UNIT_CREATE: 'unit/create',
  UNIT_UPDATE: 'unit/{id}',

  //Category
  CATEGORY_CREATE: 'categories/create',
  CATEGORY_UPDATE: 'categories/{id}',
  CATEGORY_DELETE: 'categories/delete',
  GET_ALL_CATEGORIES: 'categories/getAllCategory',

  //Items
  // GET_ALL_ITEMS: 'items/getAllItems', // 获取不带库存余量的参照
  GET_ALL_ITEMS: 'items/getAllItemsWithInventory', // 获取带库存余量的参照
  SEARCH_ITEMS: 'items/searchItems',
  ITEMS_CREATE: 'items/create',
  ITEMS_UPDATE: 'items/update/{id}',
  SYNC_ALL_ITEMS: 'items/syncLbossItems',
  GET_ONE_ITEM_BY_ID: 'items/getOneItemsById',
  INVENTORY_BY_ITEM: 'items/searchItemsInventory',
  INVENTORY_BY_WAREHOUSE: 'items/searchItemsInventoryByWarehouse',
  INVENTORY_WITH_COST: 'items/searchItemsInventoryWithAvgCost',

  //Vendor
  GET_ALL_VENDORS: 'vendor/getAllVendors',
  VENDORS_CREATE: 'vendor/create',
  VENDORS_UPDATE: 'vendor/{id}',
  SYNC_ALL_VENDORS: 'vendor/incrementalSyncOfAllVendor',

  //Payment
  GET_ALL_PAYMENT_METHOD: 'payment/getAllPaymentMethod',
  GET_ALL_PAYMENT_STATUS: 'payment/getAllPaymentStatus',

  //Admin Management

  //Dashboard report
  GET_TOTALIZERS_VIEW: 'report/getTotalizersView',
  FETCH_DAY_TOTALIZER: 'report/fetchDayReport',
};
