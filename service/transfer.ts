import {
  DECIMAL_GREATER_EQUAL_0_NULLABLE,
  DECIMAL_GREATER_THAN_0,
  NUMERIC_GREATER_OR_LESS_0,
} from '@/lib/constants';

import { generateShortUUID, toastOptions } from '@/utils/public';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { ITransferItem } from '@/types/transfer';

// 入库单Header格式化 ----------------------------------------------------------------
export function formatTransferOrderHeaderForEdit(order: any) {
  const initOrderHeaderData: any = {};

  initOrderHeaderData.id = order.id;
  initOrderHeaderData.order_no = order.order_no;
  initOrderHeaderData.approved_by = order.approved_by;

  initOrderHeaderData.fromWarehouse = {
    ...order.vendor,
    value: order.fromWarehouse.id,
    label: order.fromWarehouse.name,
  };

  initOrderHeaderData.toWarehouse = {
    ...order.vendor,
    value: order.toWarehouse.id,
    label: order.toWarehouse.name,
  };

  initOrderHeaderData.highlight = order.highlight;
  initOrderHeaderData.is_approved = order.is_approved;
  initOrderHeaderData.print_remark = order.print_remark;
  //@ts-ignore
  initOrderHeaderData.outbound_date = order.outbound_date
    ? dayjs(order.outbound_date).toDate()
    : null;
  //@ts-ignore
  initOrderHeaderData.received_date = order.received_date
    ? dayjs(order.received_date).toDate()
    : null;
  initOrderHeaderData.remark = order.remark;
  initOrderHeaderData.store_id = order.store_id;

  return initOrderHeaderData;
}
export function formatTransferOrderDetailForEdit(orderDetails: any) {
  const tempOutboundOrderItems: any[] = [];
  const initDetailItem = {
    inventory_id: '',
    transfer_quantity: 0,
    toLocationCode: '',
    remark: '',
    detail: { label: '' },
  };
  orderDetails.map((detailItem: any) => {
    let tempDetail = { ...initDetailItem };

    tempDetail.inventory_id = detailItem.inventory_id;
    tempDetail.transfer_quantity = Number(detailItem.transfer_quantity);
    tempDetail.toLocationCode = detailItem.to_location_code;
    tempDetail.remark = detailItem.remark;
    tempDetail.detail.label = `[${detailItem.item.upc}]-${
      detailItem.item.name_localizations.en
    } ${
      _.isEmpty(detailItem.batch_number)
        ? `Batch#:${detailItem.batch_number}`
        : ''
    } ${
      _.isEmpty(detailItem.expiry_date)
        ? `Expiry:${detailItem.expiry_date}`
        : ''
    } | Lo:${detailItem.from_location_code}`;

    tempOutboundOrderItems.push(tempDetail);
  });

  return tempOutboundOrderItems;
}

//保存前check 是否必填字段都填写了
export const checkData = (data: any) => {
  if (_.isNil(data.fromWarehouse) || _.isEmpty(data.fromWarehouse)) {
    toast.error(`Please select a warehouse for transfer out`, toastOptions);
    return false;
  }
  if (_.isNil(data.toWarehouse) || _.isEmpty(data.toWarehouse)) {
    toast.error(`Please select a warehouse for transfer in`, toastOptions);
    return false;
  }

  return true;
};

export function formatPdfData(order: any) {
  const itemsTemp: any = [];
  const pdfParams: any = {
    fromWarehouse: {
      name: order.fromWarehouse.name,
      location: order.fromWarehouse.location,
    },
    toWarehouse: {
      name: order.toWarehouse.name,
      location: order.toWarehouse.location,
    },
    storeImageUrl: '',
    header: {
      seqNo: order.order_no,
      orderDate: order.createdAt,
      printRemark: order.print_remark,
      orderNo: order.order_no,
    },
    footer: {
      isApproved: order.is_approved,
      approvedBy: order.approved_by,
      approvedData: order.approved_date,
    },
  };

  order.transferOrderDetails.map((detail: any) => {
    let itemTemp = {
      sku: detail.item.upc,
      name: detail.item.name_localizations.en || '',
      spec: detail.item.spec,
      batchNumber: detail.batch_number,
      expiryDate: detail.expiry_date,
      remarks: detail.remark,
      qty: Number(detail.transfer_quantity),
      fromLocationCode: detail.from_location_code,
      toLocationsCode: detail.to_location_code,
    };
    itemsTemp.push(itemTemp);
  });

  pdfParams.items = [...itemsTemp];
  return pdfParams;
}

export const formatItemListData = (data: ITransferItem[]) => {
  console.log('🚀 ~ formatItemListData9991 ~ data:', data);

  const itemListDatasTemp: any[] = [];

  let code = 0;

  const currentItems = [...data];

  if (currentItems.length > 0) {
    currentItems.forEach((rowItem: any, index: number) => {
      if (!rowItem.detail) {
        code++;
        return;
      }
      let temp: any = {
        detail: { ...rowItem.detail },
        inventory_id: rowItem.inventory_id,
        remark: rowItem.remark || '',
        transfer_quantity: Number(rowItem.transfer_quantity),
        toLocationCode: rowItem.toLocationCode,
        sort_index: rowItem.sort_index,
      };

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

// 导出入库单
export const exportTransferOrderListToCSV = (orderListData: any) => {
  console.log(
    '🚀 ~ exportOutboundListToCSV ~ orderListData111:',
    orderListData,
  );
  const poListHeader =
    'Order Number / 出库单号,Vendor / 客户,Number of items,Outbound Date / 日期,SubTotal	,Tax,Shipping Fee,Total';

  if (orderListData) {
    const csv = `${poListHeader}\n${orderListData.data
      .map((row: any) => {
        const field: any[] = [];
        field.push(row.order_no);
        field.push(row.vendor.name);
        field.push(row.outboundOrderDetail.length);
        field.push(row.outbound_date);
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
    const fileName = `outbound-order-list-${currentDate}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
