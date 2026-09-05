import { Category } from './../../types/index';
import { Pagination, Response, UpdateParams } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient, HttpServer } from './http-client';
import { IItemListDatas } from '@/types/purchase';
import { IWarehouse } from '@/types/inv';
import { ISearchItem, IItem } from '@/types/items';
import { IUnit } from '@/types/unit';
import { IVendor } from '@/types/vendor';
import { IUser } from '@/types/user';
import { IBin, IShelf, IZone } from '@/types/location';
import { ICategory } from '@/types/category';

class Client {
  users = {
    login: (params: any): any => {
      const res = HttpClient.post({
        url: API_ENDPOINTS.LOGIN,
        data: params,
      }) as any;
      return res;
    },
    register: (params: any): any => {
      const res = HttpClient.post({
        url: API_ENDPOINTS.REGISTER,
        data: params,
      });
      return res;
    },
    me: () => {
      const res = HttpClient.get(API_ENDPOINTS.ME);
      return res;
    },

    changePassword: (params: {
      userId: string;
      originalPassword: string;
      newPassword: string;
    }): any => {
      return HttpClient.post({
        url: API_ENDPOINTS.CHANGE_PASSWORD,
        data: params,
      }) as any;
    },

    createUser: (payload: IUser) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.USERS_CREATE,
        data: payload,
      }),
    updateUser: (payload: IUser) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.USERS_UPDATE,
        data: payload,
      }),
    getAllUser: (params: any) => {
      return HttpClient.get<Response>(`${API_ENDPOINTS.GET_ALL_USER}`, params);
    },
  };
  auth = {
    getMe: () => {
      return HttpClient.post({
        url: API_ENDPOINTS.ME,
      });
    },
    postEmailForForgotPsw: (params: any): any => {
      return HttpClient.post({
        url: API_ENDPOINTS.FORGOT_PASSWORD,
        data: params,
      });
    },
    resetPassword: (params: {
      email: string;
      token: string;
      newPsw: string;
    }) => {
      return HttpClient.post({
        url: API_ENDPOINTS.RESET_PASSWORD,
        data: params,
      }) as any;
    },
    getBackendV: (): any => {
      return HttpClient.get(API_ENDPOINTS.BACKEND_V);
    },
  };
  //----------------------------------------------------------------
  dashboard = {};

  log = {
    searchLog: (payload: { order_id: string }) =>
      HttpClient.post<any>({
        url: API_ENDPOINTS.LOG_SEARCH,
        data: payload,
      }),
  };
  //----------------------------------------------------------------
  vendor = {
    getAllVendors: (params: any) => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_ALL_VENDORS}`,
        params,
      );
    },
    createVendors: (payload: IVendor) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.VENDORS_CREATE,
        data: payload,
      }),
    updateVendors: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.VENDORS_UPDATE,
        data,
        id,
      }),
    syncAllVendor: () => {
      return HttpClient.get<Response>(`${API_ENDPOINTS.SYNC_ALL_VENDORS}`);
    },
  };
  //----------------------------------------------------------------
  unit = {
    getAllUnits: (params: { isActive: undefined | boolean }) => {
      return HttpClient.get<Response>(`${API_ENDPOINTS.GET_UNIT}`, params);
    },
    createUnit: (payload: IUnit) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.UNIT_CREATE,
        data: payload,
      }),
    updateUnit: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.UNIT_UPDATE,
        data,
        id,
      }),
  };

  category = {
    getAllCategories: (params: any) => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_ALL_CATEGORIES}`,
        params,
      );
    },
    createCategory: (payload: ICategory) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.CATEGORY_CREATE,
        data: payload,
      }),
    updateCategory: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.CATEGORY_UPDATE,
        data,
        id,
      }),

    deleteCategory: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.CATEGORY_DELETE,
        id,
      }),
  };

  location = {
    getAllBinsByZone: (payload: { zoneId: number }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_ALL_BINS_BY_ZONE,
        data: payload,
      }),
    getNonEmptyBinsByZone: (payload: { zoneId: number }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_NON_EMPTY_BINS_BY_ZONE,
        data: payload,
      }),
    getEmptyBinsByZone: (payload: { zoneId: number }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_EMPTY_BINS_BY_ZONE,
        data: payload,
      }),
    getZonesByWarehouse: (payload: { warehouseId: number }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_LOCATION,
        data: payload,
      }),
    getZonesAndBinItemCountsByWarehouse: (payload: { warehouseId: number }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_LOCATION_BY_BIN_COUNTS,
        data: payload,
      }),
    createZone: (payload: IZone) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.ZONE_CREATE,
        data: payload,
      }),

    updateZone: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.ZONE_UPDATE,
        data,
        id,
      }),
    deleteZone: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.ZONE_DELETE,
        id,
      }),
    //----------------------------------------------------------------
    createShelf: (payload: IShelf) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SHELF_CREATE,
        data: payload,
      }),
    getShelvesByZoneId: (params: { id: string }) => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_SHELVES_BY_ZONE_ID}`,
        params,
      );
    },

    updateShelf: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SHELF_UPDATE,
        data,
        id,
      }),
    deleteShelf: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SHELF_DELETE,
        id,
      }),
    //----------------------------------------------------------------
    createBin: (payload: IBin) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.BIN_CREATE,
        data: payload,
      }),
    getBinsByShelfId: (params: { id: string }) => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_BINS_BY_SHELF_ID}`,
        params,
      );
    },

    updateBin: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.BIN_UPDATE,
        data,
        id,
      }),
    deleteBin: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.BIN_DELETE,
        id,
      }),
  };
  inventory = {
    searchInventories: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_SEARCH_DETAIL,
        params,
        data: payload,
      }),

    itemSummarize: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_SUMMARIZE_BY_ITEM,
        params,
        data: payload,
      }),

    isPicked: (payload: { lockId?: string; isPicked: boolean }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_IS_PICKED,
        data: payload,
      }),
    bulkConfirmPicked: (payload: {
      lockIds: string[];
      pickedQty: string;
      shortQty: string;
      totalQty: string;
      isForcePicked: boolean;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_BULK_CONFIRM_PICKED,
        data: payload,
      }),
  };
  inv = {
    getWarehouse: (params: { isActive: undefined | boolean }) => {
      return HttpClient.get<Response>(`${API_ENDPOINTS.GET_WAREHOUSE}`, params);
    },
    createWarehouse: (payload: IWarehouse) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.WAREHOUSE_CREATE,
        data: payload,
      }),
    updateWarehouse: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.WAREHOUSE_UPDATE,
        data,
        id,
      }),
    searchInventoryTransactions: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SEARCH_INVENTORY_TRANSACTIONS,
        params,
        data: payload,
      }),
    searchItemsInventory: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_BY_ITEM,
        params,
        data: payload,
      }),

    searchItemsInventoryByWarehouse: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_BY_WAREHOUSE,
        params,
        data: payload,
      }),

    searchItemsInventoryWithCost: ({
      params,
      payload,
    }: {
      params?: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INVENTORY_WITH_COST,
        params,
        data: payload,
      }),
  };
  //----------------------------------------------------------------
  items = {
    getAllItems: (payload: { isActive?: boolean; vendorId?: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_ALL_ITEMS,
        data: payload,
      }),

    searchItem: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: ISearchItem | {};
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SEARCH_ITEMS,
        params,
        data: payload,
      }),
    getOneItemsById: (params: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.GET_ONE_ITEM_BY_ID,
        params,
      }),
    createItem: (payload: IItem) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.ITEMS_CREATE,
        data: payload,
      }),
    updateItem: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.ITEMS_UPDATE,
        data,
        id,
      }),

    syncAllItems: () =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SYNC_ALL_ITEMS,
      }),
  };
  //----------------------------------------------------------------
  payment = {
    getAllPaymentMethod: () => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_ALL_PAYMENT_METHOD}`,
      );
    },
    getAllPaymentStatus: () => {
      return HttpClient.get<Response>(
        `${API_ENDPOINTS.GET_ALL_PAYMENT_STATUS}`,
      );
    },
  };
  //----------------------------------------------------------------
  inbound = {
    pdfOrder: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_INBOUND_ORDER,
        data: payload,
        responseType: 'blob',
      }),
    calculate: (payload: {
      shipping_fee?: number;
      inboundOrderDetail: any[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_ORDER_CALCULATE,
        data: payload,
      }),
    createOrder: (payload: { formData: any; itemListDatas: IItemListDatas }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_ORDER_CREATE,
        data: payload,
      }),

    updateOrder: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_ORDER_UPDATE,
        data,
        id,
      }),

    approveOrder: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_ORDER_APPROVE,
        id,
      }),

    deleteOrder: ({ id }: { id: string }) =>
      HttpClient.delete<void>({
        url: API_ENDPOINTS.INBOUND_ORDER_DELETE,
        id,
      }),

    searchOrderList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_ORDER_SEARCH,
        params,
        data: payload,
      }),

    getOrderById: (params: { id: number }) => {
      return HttpClient.get<Response>(
        API_ENDPOINTS.INBOUND_ORDER_FIND_BY_ID,
        params,
      );
    },
  };
  outbound = {
    pdfOrder: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_OUTBOUND_ORDER,
        data: payload,
        responseType: 'blob',
      }),

    printPickingList: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_OUTBOUND_ORDER_PICKING,
        data: payload,
        responseType: 'blob',
      }),

    getPickingList: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_PICKING_LIST,
        id,
      }),

    getBulkPickingList: (payload: any) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_BULK_PICKING_LIST,
        data: payload,
      }),

    calculate: (payload: {
      shipping_fee?: number;
      outboundOrderDetail: any[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_CALCULATE,
        data: payload,
      }),
    createOrder: (payload: { formData: any; itemListDatas: IItemListDatas }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_CREATE,
        data: payload,
      }),

    updateOrder: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_UPDATE,
        data,
        id,
      }),

    approveOrder: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_APPROVE,
        id,
      }),
    cancelPicking: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_CANCEL_PICKING,
        id,
      }),

    finishOrder: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_FINISHED,
        id,
      }),

    deleteOrder: ({ id }: { id: string }) =>
      HttpClient.delete<void>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_DELETE,
        id,
      }),

    searchOrderList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_ORDER_SEARCH,
        params,
        data: payload,
      }),

    getOrderById: (params: { id: number }) => {
      return HttpClient.get<Response>(
        API_ENDPOINTS.OUTBOUND_ORDER_FIND_BY_ID,
        params,
      );
    },
  };

  transfer = {
    getOrderById: (params: { id: number }) => {
      return HttpClient.get<Response>(
        API_ENDPOINTS.TRANSFER_ORDER_FIND_BY_ID,
        params,
      );
    },
    pdfOrder: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_TRANSFER_ORDER,
        data: payload,
        responseType: 'blob',
      }),
    createOrder: (payload: { formData: any; itemListDatas: IItemListDatas }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.TRANSFER_ORDER_CREATE,
        data: payload,
      }),

    updateOrder: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.TRANSFER_ORDER_UPDATE,
        data,
        id,
      }),

    approveOrder: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.TRANSFER_ORDER_APPROVE,
        id,
      }),

    deleteOrder: ({ id }: { id: string }) =>
      HttpClient.delete<void>({
        url: API_ENDPOINTS.TRANSFER_ORDER_DELETE,
        id,
      }),

    searchOrderList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.TRANSFER_ORDER_SEARCH,
        params,
        data: payload,
      }),
  };
  //----------------------------------------------------------------
  inboundRequest = {
    pdfRequest: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_INBOUND_REQUEST,
        data: payload,
        responseType: 'blob',
      }),
    calculate: (payload: {
      shipping_fee?: number;
      inboundRequestDetail: any[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_REQUEST_CALCULATE,
        data: payload,
      }),
    createRequest: (payload: {
      formData: any;
      itemListDatas: IItemListDatas;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_REQUEST_CREATE,
        data: payload,
      }),

    updateRequest: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_REQUEST_UPDATE,
        data,
        id,
      }),

    approveRequest: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_REQUEST_APPROVE,
        id,
      }),

    deleteRequest: ({ id }: { id: string }) =>
      HttpClient.delete<void>({
        url: API_ENDPOINTS.INBOUND_REQUEST_DELETE,
        id,
      }),

    searchRequestList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.INBOUND_REQUEST_SEARCH,
        params,
        data: payload,
      }),

    getRequestById: (params: { warehouseId: number }) => {
      return HttpClient.get<Response>(
        API_ENDPOINTS.INBOUND_REQUEST_FIND_BY_ID,
        params,
      );
    },
  };
  outboundRequest = {
    pdfRequest: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_OUTBOUND_REQUEST,
        data: payload,
        responseType: 'blob',
      }),

    calculate: (payload: {
      shipping_fee?: number;
      outboundRequestDetail: any[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_CALCULATE,
        data: payload,
      }),
    createRequest: (payload: {
      formData: any;
      itemListDatas: IItemListDatas;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_CREATE,
        data: payload,
      }),

    updateRequest: ({ id, data }: UpdateParams) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_UPDATE,
        data,
        id,
      }),

    approveRequest: ({ id }: { id: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_APPROVE,
        id,
      }),

    deleteRequest: ({ id }: { id: string }) =>
      HttpClient.delete<void>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_DELETE,
        id,
      }),

    searchRequestList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.OUTBOUND_REQUEST_SEARCH,
        params,
        data: payload,
      }),

    getRequestById: (params: { warehouseId: number }) => {
      return HttpClient.get<Response>(
        API_ENDPOINTS.OUTBOUND_REQUEST_FIND_BY_ID,
        params,
      );
    },
  };
  //----------------------------------------------------------------
  pruchaseOrder = {
    pdfOrder: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_PUR_ORDER,
        data: payload,
        responseType: 'blob',
      }),
    calculate: (payload: {
      discount_rate: string;
      discount_amount: string;
      shipping_fee?: number;
      itemListDatas: any[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ORDER_CALCULATE,
        data: payload,
      }),
    createOrder: (payload: { formData: any; itemListDatas: IItemListDatas }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ORDER_CREATE,
        data: payload,
      }),

    updateOrder: (payload: {
      id: string;
      formData: any;
      itemListDatas: IItemListDatas;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ORDER_UPDATE,
        data: payload,
      }),

    updateStatus: (payload: {
      id: string;
      isApproved?: boolean;
      isVoid?: boolean;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ORDER_UPDATE_STATUS,
        data: payload,
      }),

    deleteOrder: (payload: { orderId: string }) =>
      HttpClient.post<void>({
        url: API_ENDPOINTS.PURCHASE_ORDER_DELETE,
        data: payload,
      }),

    searchPurchaseOrderList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ORDER_SEARCH,
        params,
        data: payload,
      }),

    getPurchaseOrderById: (params: { id: string }) => {
      return HttpClient.post({
        url: `${API_ENDPOINTS.PURCHASE_ORDER_FIND_BY_ID}`,
        params: params,
      });
    },
  };

  salesOrder = {
    pdfOrder: (payload: any) =>
      HttpClient.postForPDF<Response>({
        url: API_ENDPOINTS.PDF_SALES_ORDER,
        data: payload,
        responseType: 'blob',
      }),
    calculate: (payload: {
      discount_rate: string;
      discount_amount: string;
      shipping_fee?: number;
      itemListDatas: IItemListDatas[];
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SALES_ORDER_CALCULATE,
        data: payload,
      }),
    createOrder: (payload: { formData: any; itemListDatas: IItemListDatas }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SALES_ORDER_CREATE,
        data: payload,
      }),

    updateOrder: (payload: {
      id: string;
      formData: any;
      itemListDatas: IItemListDatas;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SALES_ORDER_UPDATE,
        data: payload,
      }),
    updateStatus: (payload: {
      id: string;
      isApproved?: boolean;
      isVoid?: boolean;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SALES_ORDER_UPDATE_STATUS,
        data: payload,
      }),

    deleteOrder: (payload: { orderId: string }) =>
      HttpClient.post<void>({
        url: API_ENDPOINTS.SALES_ORDER_DELETE,
        data: payload,
      }),

    searchSalesOrderList: ({
      params,
      payload,
    }: {
      params: Pagination;
      payload: any;
    }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.SALES_ORDER_SEARCH,
        params,
        data: payload,
      }),

    getSalesOrderById: (params: { id: string }) => {
      return HttpClient.post({
        url: `${API_ENDPOINTS.SALES_ORDER_FIND_BY_ID}`,
        params: params,
      });
    },
  };
  pruchaseItem = {
    getPurchaseHistoryByPlu: (payload: { plu: string }) =>
      HttpClient.post<Response>({
        url: API_ENDPOINTS.PURCHASE_ITEM_HISTORY,
        data: payload,
      }),
  };

  report = {
    getTotalizersView: () => {
      return HttpClient.get(`${API_ENDPOINTS.GET_TOTALIZERS_VIEW}`);
    },
    getSubDeptOptions: () => {
      return HttpClient.get(`${API_ENDPOINTS.GET_SUB_DEPT_OPTIONS}`);
    },
    getFetchDayTotalizer: (params: any) => {
      return HttpClient.get(`${API_ENDPOINTS.FETCH_DAY_TOTALIZER}`, params);
    },
    getItemsSalePriceDeficit: (params: { grossMargin: string }) => {
      return HttpClient.get(
        `${API_ENDPOINTS.GET_ITEMS_SALE_PRICE_DEFICIT}`,
        params,
      );
    },
    getCoveredItem: () => {
      return HttpClient.get(`${API_ENDPOINTS.GET_COVERED_ITEM}`);
    },
    getGrossMarginEstimate: () => {
      return HttpClient.get(`${API_ENDPOINTS.GET_GROSS_MARGIN_ESTIMATE}`);
    },
    analysisGrossProfitPLUSalesByDay: (params: any) => {
      return HttpClient.post({
        url: `${API_ENDPOINTS.GET_GROSS_PROFIT_ANALYSIS}`,
        data: params,
      });
    },
  };
}

class Server {
  inbound = {
    getOrderByIdSSR: (params: { id: number }, token: string) => {
      return HttpServer.get<Response>(
        API_ENDPOINTS.INBOUND_ORDER_FIND_BY_ID,
        params,
        token,
      );
    },
  };
}

export default new Client();
export const server = new Server();
