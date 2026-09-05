import { IInboundItem } from '@/types/inbound';
import { convertItemsLabel } from '@/utils/convertToSelectOptions';
import { generateShortUUID, toastOptions } from '@/utils/public';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
//      'pur:采购入库,other-in:其他入库,trans-in:调拨入库,surplus:盘盈入库,free:赠品入库,return:退货入库',
export const orderTypeOptions = [
  {
    value: 'pur',
    label: 'PUR-采购入库',
  },
  {
    value: 'return',
    label: 'RETURN-退货入库',
  },
  {
    value: 'other-in',
    label: 'OTHER-其他入库',
  },
  {
    value: 'trans-in',
    label: 'TRANS-调拨入库',
  },
  {
    value: 'surplus',
    label: 'SURPLUS-盘盈入库',
  },
  {
    value: 'free',
    label: 'FREE-赠品入库',
  },
];
export const defaultRequestHeaderData = {
  id: '',
  approved_by: '',
  orderType: {},
  batch_number: '',
  discount_amount: '',
  discount_rate: '',
  highlight: '',
  invoice_no: '',
  is_approved: '',
  payment_method: undefined,
  payment_status: undefined,
  payment_remark: '',
  print_remark: '',
  pur_order_no: '',
  inbound_date: '',
  received_date: '',
  remark: '',
  store_id: '',
  subtotal_amount: '',
  tax_amount: '',
  total: undefined,
  total_amount: '',
  vendor: undefined,
  warehouse: undefined,
  is_finished: false,
  shipping_fee: 0,
};

export const formatItemListData = (data: IInboundItem[]) => {

  const itemListDatasTemp: any[] = [];

  let code = 0;

  const currentItems = [...data];

  if (currentItems.length > 0) {
    currentItems.forEach((rowItem: any, index: number) => {
      if (!rowItem.item) {
        code++;
        return;
      }
      let temp: any = {
        item: { ...rowItem.item },
        item_id: rowItem.item.value,
        batchNumber: rowItem.batchNumber || '',
        locationCode: rowItem.locationCode,
        case_exchange_rate: rowItem.case_exchange_rate
          ? parseFloat(rowItem.case_exchange_rate) || 1
          : 1,
        tax_rate: rowItem.tax_rate ? parseFloat(rowItem.tax_rate) || 0 : 0,
        qty_case: rowItem.qty_case ? parseFloat(rowItem.qty_case) || 0 : 0,
        qty_base: rowItem.qty_base ? parseFloat(rowItem.qty_base) || 0 : 0,
        price_case: rowItem.price_case
          ? parseFloat(rowItem.price_case) || 0
          : 0,
        price_base: rowItem.price_base
          ? parseFloat(rowItem.price_base) || 0
          : 0,

        received_qty: rowItem.qty_base ? parseFloat(rowItem.qty_base) || 0 : 0,
        is_partial_received: false,
        is_promotional_item: false,
        remark: rowItem.remark || '',
        base_unit_id: rowItem.item.base_unit_id,
        value: rowItem.item.id,
      };
      if (rowItem.expiry_date) {
        temp.expiry_date = rowItem.expiry_date;
      }
      if (rowItem.case_unit) {
        temp.case_unit_id = rowItem.case_unit.value;
      }
      if (rowItem.zone) {
        temp.zone_id = rowItem.zone.value;
      }
      if (rowItem.shelf) {
        temp.shelf_id = rowItem.shelf.value;
      }
      if (rowItem.bin) {
        temp.bin_id = rowItem.bin.value;
      }
      if (rowItem.id) {
        temp.id = rowItem.id;
      }

      temp.row_uuid = generateShortUUID();

      itemListDatasTemp.push({ ...temp });
    });
  } else {
    code++;
  }

  if (code === 0) {
    return { code, data: itemListDatasTemp, msg: 'success' };
  } else {
    return { code, data: [], msg: 'Items invalid' };
  }
};

//保存前check 是否必填字段都填写了
export const checkData = (data: any) => {

  if (data.orderType === undefined) {
    toast.error(`Please select a orderType`, toastOptions);
    return false;
  }
  return true;
};

export function convertInboundRequestSeqNo(orderSeqNo: string) {
  return `IN${String(orderSeqNo).padStart(5, '0')}`;
}

export function formatPdfData(order: any) {
  const itemsTemp: any = [];
  const pdfParams: {
    vendor: { name: string; address: string; email: string; phone: string };
    warehouse: { name: string; location: string };
    storeImageUrl: string;
    header: {
      seqNo: string;
      orderDate: string;
      invoiceNo: string;
      printRemark: string;
    };
    footer: {
      subtotal: string;
      tax: string;
      shippingFee: string;
      total: string;
    };
    items?: Array<{
      sku: string;
      name: string;
      spec: string;
      remarks: string;
      unit: string;
      taxR: string;
      qty: string;
      price: string;
      total: string;
    }>;
  } = {
    vendor: {
      name: order?.vendor?.name || '',
      address: order?.vendor?.address || '',
      phone: order?.vendor?.phone || '',
      email: order?.vendor?.email || '',
    },
    warehouse: {
      name: order.warehouse?.name || '',
      location: order.warehouse?.location || '',
    },
    storeImageUrl: '',
    header: {
      seqNo: order.order_no,
      orderDate: order.outbound_date,
      invoiceNo: order.invoice_no,
      printRemark: order.print_remark,
    },
    footer: {
      subtotal: Number(order.subtotal_amount).toFixed(2),
      tax: Number(order.total.tax).toFixed(2),
      shippingFee:
        parseFloat(order.shipping_fee) !== 0
          ? order.shipping_fee.toFixed(2)
          : 0,

      total: Number(order.total_amount).toFixed(2),
    },
  };

  order.inboundRequestDetail.map((detail: any) => {
    let itemTemp = {
      sku: detail.item.sku,
      name: detail.item.name_localizations.en || '',
      spec: detail.item.spec,
      remarks: detail.remark,
      unit: detail.base_unit.name,
      locationCode: detail.locationCode,
      taxR: parseFloat(detail.tax_rate) * 100,
      taxAmount: parseFloat(detail.tax_amount).toFixed(2),
      qty: parseFloat(detail.qty_base).toFixed(2),
      price: parseFloat(detail.price_base).toFixed(2),
      total: parseFloat(detail.total_amount).toFixed(2),
    };
    itemsTemp.push(itemTemp);
  });

  pdfParams.items = [...itemsTemp];
  return pdfParams;
}
// 入库单Header格式化 ----------------------------------------------------------------
export function formatInboundRequestHeaderForEdit(order: any) {
  const orderType = orderTypeOptions.find(
    (type) => type.value === order.order_type,
  );
  const { paymentMethod, paymentStatus, total } = order;
  const initRequestHeaderData = { ...defaultRequestHeaderData };

  initRequestHeaderData.id = order.id;
  initRequestHeaderData.is_finished = order.is_finished;
  initRequestHeaderData.approved_by = order.approved_by;
  initRequestHeaderData.orderType = orderType || {};

  initRequestHeaderData.batch_number = order.batch_number;
  initRequestHeaderData.warehouse = order.warehouse;
  initRequestHeaderData.discount_amount = order.discount_amount;
  initRequestHeaderData.discount_rate = order.discount_rate;
  initRequestHeaderData.highlight = order.highlight;
  initRequestHeaderData.invoice_no = order.invoice_no;
  initRequestHeaderData.is_approved = order.is_approved;
  initRequestHeaderData.shipping_fee = order.shipping_fee;

  initRequestHeaderData.payment_remark = order.payment_remark || '';
  initRequestHeaderData.print_remark = order.print_remark;
  initRequestHeaderData.pur_order_no = order.pur_order_no;
  //@ts-ignore
  initRequestHeaderData.inbound_date = order.inbound_date
    ? dayjs(order.inbound_date).toDate()
    : null;
  //@ts-ignore
  initRequestHeaderData.received_date = order.received_date
    ? dayjs(order.received_date).toDate()
    : null;
  initRequestHeaderData.remark = order.remark;
  initRequestHeaderData.store_id = order.store_id;
  initRequestHeaderData.subtotal_amount = order.subtotal_amount;
  initRequestHeaderData.tax_amount = order.tax_amount;
  initRequestHeaderData.total = { ...order.total };
  initRequestHeaderData.total_amount = order.total_amount;
  initRequestHeaderData.vendor = {
    ...order.vendor,
    value: order.vendor.id,
    label: order.vendor.name,
  };

  return initRequestHeaderData;
}
// 入库单detail格式化 ----------------------------------------------------------------
export function formatInboundRequestDetailForEdit(orderDetails: any) {
  const tempInboundRequestItems: any[] = [];
  const initDetailItem = {
    id: '',
    base_unit: undefined,
    case_unit: undefined,
    order_type: undefined,
    locationCode: '',
    zone: undefined,
    shelf: undefined,
    bin: undefined,
    expiry_date: null,
    case_exchange_rate: undefined,
    is_partial_received: false,
    is_promotional_item: false,
    item: null,
    label: '',
    price_base: 0,
    price_case: 0,
    tax_rate: 0,
    qty_case: 0,
    received_qty: 0,
    qty_base: 0,
    remark: '',
    value: '',
    search: '',
    total: {},
    subtotal: 0,
    item_id: '',
    batchNumber: '',
  };
  orderDetails.map((detailItem: any) => {
    let tempDetail = { ...initDetailItem };

    tempDetail.id = detailItem.id;
    tempDetail.item_id = detailItem.item_id;
    tempDetail.base_unit = {
      ...detailItem.base_unit,
      value: detailItem.base_unit.id,
      label: detailItem.base_unit.name,
    };

    if (detailItem.case_unit) {
      tempDetail.case_unit = {
        ...detailItem.case_unit,
        value: detailItem.case_unit.id,
        label: detailItem.case_unit.name,
      };
    }

    tempDetail.case_exchange_rate = detailItem.case_exchange_rate;
    tempDetail.is_partial_received = detailItem.is_partial_received;
    tempDetail.is_promotional_item = detailItem.is_promotional_item;
    tempDetail.item = {
      ...detailItem.item,
      base_unit: tempDetail.base_unit, //update后的item中要加个base_unit
      value: detailItem.item.id,
      label: convertItemsLabel(detailItem.item),
    };
    tempDetail.label = convertItemsLabel(detailItem.item);
    tempDetail.price_base = parseFloat(detailItem.price_base);
    tempDetail.price_case = detailItem.price_case
      ? parseFloat(detailItem.price_case) || 0
      : 0;

    tempDetail.tax_rate = detailItem.tax_rate
      ? parseFloat(detailItem.tax_rate) || 0
      : 0;

    if (detailItem.expiry_date) {
      //@ts-ignore
      tempDetail.expiry_date = detailItem.expiry_date
        ? dayjs(detailItem.expiry_date).toDate()
        : null;
    }

    tempDetail.qty_case = detailItem.qty_case
      ? parseFloat(detailItem.qty_case) || 0
      : 0;

    tempDetail.qty_base = parseFloat(detailItem.qty_base);
    tempDetail.batchNumber = detailItem.batchNumber;
    tempDetail.remark = detailItem.remark;
    tempDetail.locationCode = detailItem.locationCode;
    tempDetail.value = detailItem.item_id;
    tempDetail.search = detailItem.item.search;
    tempDetail.total = { ...detailItem.total };

    tempDetail.subtotal = parseFloat(detailItem.subtotal);

    // Location
    if (detailItem.zone) {
      tempDetail.zone = {
        ...detailItem.zone,
        value: detailItem.zone.id,
        label: detailItem.zone.name,
      };
    }
    if (detailItem.shelf) {
      tempDetail.shelf = {
        ...detailItem.shelf,
        value: detailItem.shelf.id,
        label: detailItem.shelf.name,
      };
    }
    if (detailItem.bin) {
      tempDetail.bin = {
        ...detailItem.bin,
        value: detailItem.bin.id,
        label: detailItem.bin.name,
      };
    }

    tempInboundRequestItems.push(tempDetail);
  });

  return tempInboundRequestItems;
}

// 导出入库单
export const exportInboundListToCSV = (orderListData: any) => {
  const poListHeader =
    'Inbound Request Number ,Vendor,Number of items,Inbound Date,SubTotal	,Tax,Shipping Fee,Total';

  if (orderListData) {
    const csv = `${poListHeader}\n${orderListData.data
      .map((row: any) => {
        const field: any[] = [];
        field.push(row.order_no);
        field.push(row.vendor.name);
        field.push(row.inboundRequestDetail.length);
        field.push(row.inbound_date);
        field.push(row.subtotal_amount);
        field.push(row.tax_amount);
        field.push(row.shipping_fee);
        field.push(row.total_amount);
        return field;
      })
      .join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // 获取当前日期并格式化为 YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `inbound-order-list-${currentDate}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
