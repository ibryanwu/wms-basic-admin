import { itemListAtom } from '@/stores/atom';
import { IItemListDatas } from '@/types/purchase';
import { convertItemsLabel } from '@/utils/convertToSelectOptions';
import { Label } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';

//Values ----------------------------------------------------------------

export const defaultPurItemsDrawerFormValues = {
  item: '',
  base_unit_id: '',
  pur_unit_id: '',
  exchange_rate: '1',
  tax_rate: '0',
  qty_pur: '0',
  price_pur: '0',
  received_qty: '0',
  qty_base: '0',
  price_base: '0',
  is_partial_received: false,
  remark: '',
  promotional_source_items: [],
  is_promotional_item: false,
};
export const defaultPurItemsDrawerFormTotalAmountValue = {
  taxRate: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
};
export const defaultOrderHeaderData = {
  id: '',
  approved_by: '',
  approved_date: undefined,
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
  purchased_date: '',
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

//Functions ----------------------------------------------------------------
export function formatPurOrderDetailForEdit(order: any) {
  const { purchaseItems } = order;
  const itemsList: any[] = [];

  purchaseItems.map((item: any) => {
    let formatedItem = {
      qty_pur: item.qty_pur,
      price_pur: item.price_pur,
      tax_rate: parseFloat(item.tax_rate) * 100,
      remark: item.remark,
      item_id: item.item_id,
      detail: {
        ...item.item,
        base_unit: { ...item.base_unit },
        pur_unit: { ...item.pur_unit },
      },
    };
    itemsList.push(formatedItem);
  });

  return itemsList;
}
export function formatPurOrderHeaderDataForEdit(order: any) {
  const { paymentMethod, paymentStatus, total } = order;
  const initOrderHeaderData = { ...defaultOrderHeaderData };

  initOrderHeaderData.id = order.id;
  initOrderHeaderData.is_finished = order.is_finished;
  initOrderHeaderData.approved_by = order.approved_by;
  //@ts-ignore
  initOrderHeaderData.approved_date = order.approved_date
    ? dayjs(order.approved_date).toDate()
    : null;
  initOrderHeaderData.batch_number = order.batch_number;
  initOrderHeaderData.warehouse = order.warehouse;
  initOrderHeaderData.discount_amount = order.discount_amount;
  initOrderHeaderData.discount_rate = order.discount_rate;
  initOrderHeaderData.highlight = order.highlight;
  initOrderHeaderData.invoice_no = order.invoice_no;
  initOrderHeaderData.is_approved = order.is_approved;
  initOrderHeaderData.shipping_fee = order.shipping_fee;
  initOrderHeaderData.payment_method = {
    ...order.paymentMethod,
    value: order.paymentMethod.id,
    label: order.paymentMethod.name,
  };
  initOrderHeaderData.payment_status = {
    ...order.paymentStatus,
    value: order.paymentStatus.id,
    label: order.paymentStatus.name,
  };
  initOrderHeaderData.payment_remark = order.payment_remark;
  initOrderHeaderData.print_remark = order.print_remark;
  initOrderHeaderData.pur_order_no = order.pur_order_no;
  //@ts-ignore
  initOrderHeaderData.purchased_date = order.purchased_date
    ? dayjs(order.purchased_date).toDate()
    : null;
  //@ts-ignore
  initOrderHeaderData.received_date = order.received_date
    ? dayjs(order.received_date).toDate()
    : null;
  initOrderHeaderData.remark = order.remark;
  initOrderHeaderData.store_id = order.store_id;
  initOrderHeaderData.subtotal_amount = order.subtotal_amount;
  initOrderHeaderData.tax_amount = order.tax_amount;
  initOrderHeaderData.total = { ...order.total };
  initOrderHeaderData.total_amount = order.total_amount;
  initOrderHeaderData.vendor = {
    ...order.vendor,
    value: order.vendor.id,
    label: order.vendor.name,
  };
  initOrderHeaderData.warehouse = {
    ...order.warehouse,
    value: order.warehouse.id,
    label: `${order.warehouse.name} - ${order.warehouse.description}`,
  };

  return initOrderHeaderData;
}

export function formatPurOrderDetailDataForEdit(purchaseItems: any) {
  const tempPurchaseItems: IItemListDatas[] = [];
  const initPurchaseItem = {
    id: '',
    base_unit_id: undefined,
    pur_unit_id: undefined,
    exchange_rate: '',
    is_partial_received: false,
    is_promotional_item: false,
    item: null,
    label: '',
    price_base: 0,
    price_pur: '',
    promotional_source_items: undefined,
    promotional_allocated_cost_pur: 0,
    promotional_allocated_count: 0,
    promotional_allocated_cost_amount: 0,
    promotional_relationship_value_percentages: 0,
    promotional_allocat_sum_value: 0,
    promotional_allocat_sum_cost: 0,
    tax_rate: '',
    qty_pur: '',
    received_qty: '',
    qty_base: 0,
    remark: '',
    value: '',
    search: '',
    total: {},
    discount_rate: '',
    discount_amount: 0,
    cost_base: 0,
    cost_pur: 0,
    subtotal: 0,
    tax_amount: 0,
    row_uuid: '',
    barcode: '',
    item_id: '',
    sale_price_base_snapshot: '',
    sort_index: 0,
  };
  purchaseItems.map((purchaseItem: any) => {
    let tempPurchaseItem = { ...initPurchaseItem };

    tempPurchaseItem.id = purchaseItem.id;
    tempPurchaseItem.item_id = purchaseItem.item_id;
    tempPurchaseItem.base_unit_id = {
      ...purchaseItem.base_unit,
      value: purchaseItem.base_unit.id,
      label: purchaseItem.base_unit.unit_slug,
      name: purchaseItem.base_unit.name,
    };
    tempPurchaseItem.pur_unit_id = {
      ...purchaseItem.pur_unit,
      value: purchaseItem.pur_unit.id,
      label: purchaseItem.pur_unit.unit_slug,
      name: purchaseItem.pur_unit.name,
    };
    tempPurchaseItem.barcode = purchaseItem.barcode;
    tempPurchaseItem.exchange_rate = purchaseItem.exchange_rate;
    tempPurchaseItem.is_partial_received = purchaseItem.is_partial_received;
    tempPurchaseItem.is_promotional_item = purchaseItem.is_promotional_item;
    tempPurchaseItem.item = {
      ...purchaseItem.item,
      value: purchaseItem.item.id,
      label: convertItemsLabel(purchaseItem.item),
    };
    tempPurchaseItem.label = convertItemsLabel(purchaseItem.item);
    tempPurchaseItem.price_base = parseFloat(purchaseItem.price_base);
    tempPurchaseItem.price_pur = purchaseItem.price_pur;
    //@ts-ignore
    tempPurchaseItem.promotional_source_items = [
      ...purchaseItem.promotional_source_items,
    ];

    tempPurchaseItem.promotional_allocated_cost_pur = parseFloat(
      purchaseItem.price_base,
    );
    tempPurchaseItem.promotional_allocated_count = parseFloat(
      purchaseItem.price_base,
    );
    tempPurchaseItem.promotional_allocated_cost_amount = parseFloat(
      purchaseItem.promotional_allocated_cost_amount,
    );
    tempPurchaseItem.promotional_relationship_value_percentages = parseFloat(
      purchaseItem.promotional_relationship_value_percentages,
    );

    tempPurchaseItem.tax_rate = (
      parseFloat(purchaseItem.tax_rate) * 100
    ).toFixed(2);
    tempPurchaseItem.qty_pur = purchaseItem.qty_pur;
    tempPurchaseItem.received_qty = purchaseItem.received_qty;
    tempPurchaseItem.qty_base = parseFloat(purchaseItem.qty_base);
    tempPurchaseItem.remark = purchaseItem.remark;
    tempPurchaseItem.value = purchaseItem.item_id;
    tempPurchaseItem.search = purchaseItem.item.search;
    tempPurchaseItem.total = { ...purchaseItem.total };
    tempPurchaseItem.discount_rate = purchaseItem.discount_rate;
    tempPurchaseItem.discount_amount = parseFloat(purchaseItem.discount_amount);
    tempPurchaseItem.cost_base = parseFloat(purchaseItem.cost_base);
    tempPurchaseItem.cost_pur = parseFloat(purchaseItem.cost_pur);
    tempPurchaseItem.subtotal = parseFloat(purchaseItem.subtotal);
    tempPurchaseItem.tax_amount = parseFloat(purchaseItem.tax_amount);
    tempPurchaseItem.row_uuid = purchaseItem.row_uuid;
    tempPurchaseItem.sort_index = purchaseItem.sort_index;
    tempPurchaseItem.sale_price_base_snapshot =
      purchaseItem.sale_price_base_snapshot;

    //@ts-ignore
    tempPurchaseItems.push(tempPurchaseItem);
  });

  return tempPurchaseItems;
}

export function apportionCostToSourceItem() {
  //1.过滤出有赠品的数据
  //2.循环把成本累计到来源item上
  //3.组装返回值
  const [itemListDatas, setItemListDatas] = useAtom(itemListAtom);
  // step 1:
  const pomotionalItems = itemListDatas.filter(
    (item) => item.is_promotional_item,
  );
  //step 2:
  if (pomotionalItems?.length > 0) {
    pomotionalItems.map((item) => {
      //按item分摊
      //计算方法: 【销售额比例分摊】来源商品
      if (item.promotional_source_items.length > 0) {
        item.promotional_source_items.map((sourceItem: any) => {});
      }
      //整单分摊
      if (item.promotional_source_items.length === 0) {
      }
    });
  }
}

export function convertPurOrderSeqNo(orderSeqNo: string) {
  return `P${String(orderSeqNo).padStart(5, '0')}`;
}

export function formatPdfData(order: any) {
  const itemsTemp: any = [];
  const pdfParams: {
    vendor: { name: string; address: string; email: string; phone: string };
    warehouse: { name: string; location: string };
    storeImageUrl: string;
    header: { seqNo: string; orderDate: string; invoiceNo: string };
    footer: {
      subtotal: string;
      tax: string;
      shippingFee: string;
      return: string;
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
      name: order.vendor.name,
      address: order.vendor.address,
      phone: order.vendor.phone,
      email: order.vendor.email,
    },
    warehouse: {
      name: order.warehouse.name,
      location: order.warehouse.location,
    },
    storeImageUrl: '',
    header: {
      seqNo: convertPurOrderSeqNo(order.seq_order_no),
      orderDate: order.purchased_date,
      invoiceNo: order.invoice_no,
    },
    footer: {
      subtotal: order.total.subtotal.toFixed(2),
      tax: order.total.tax.toFixed(2),
      shippingFee:
        parseFloat(order.total.shipping_fee) !== 0
          ? order.total.shipping_fee.toFixed(2)
          : 0,
      return:
        parseFloat(order.total.return_amount) !== 0
          ? order.total.return_amount.toFixed(2)
          : 0,
      total: order.total.total.toFixed(2),
    },
  };

  order.purchaseItems.map((item: any) => {
    let itemTemp = {
      sku: item.sku,
      name: `${parseFloat(item.qty_pur) < 0 ? '[Return]====' : ''}${
        item.name_localizations.en
      }`,
      spec: item.spec,
      remarks: item.remark,
      unit: item.pur_unit.name,
      taxR: parseFloat(item.tax_rate) * 100,
      taxAmount: parseFloat(item.tax_amount).toFixed(2),
      qty: parseFloat(item.qty_pur).toFixed(2),
      price: parseFloat(item.price_pur).toFixed(2),
      total: parseFloat(item.total.total).toFixed(2),
    };
    itemsTemp.push(itemTemp);
  });

  pdfParams.items = [...itemsTemp];
  return pdfParams;
}
