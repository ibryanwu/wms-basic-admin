import { itemListAtom } from '@/stores/atom';
import { IItemListDatas } from '@/types/sales';
import { convertItemsLabel } from '@/utils/convertToSelectOptions';
import { Label } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';

//Values ----------------------------------------------------------------

export const defaultSalesItemsDrawerFormValues = {
  item: '',
  base_unit_id: '',
  sales_unit_id: '',
  exchange_rate: '1',
  tax_rate: '0',
  qty_sales: '0',
  price_sales: '0',
  received_qty: '0',
  qty_base: '0',
  price_base: '0',
  is_partial_received: false,
  remark: '',
  promotional_source_items: [],
  is_promotional_item: false,
};
export const defaultSalesItemsDrawerFormTotalAmountValue = {
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
  sales_order_no: '',
  sales_order_date: '',
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
export function formatSalesOrderDetailForEdit(order: any) {
  const { salesOrderItems } = order;
  const itemsList: any[] = [];

  salesOrderItems.map((item: any) => {
    let formatedItem = {
      qty_sales: item.qty_sales,
      price_sales: item.price_sales,
      tax_rate: parseFloat(item.tax_rate) * 100,
      remark: item.remark,
      item_id: item.item_id,
      detail: {
        ...item.item,
        base_unit: { ...item.base_unit },
        sales_unit: { ...item.sales_unit },
      },
    };
    itemsList.push(formatedItem);
  });

  return itemsList;
}
export function formatSalesOrderHeaderDataForEdit(order: any) {
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
  initOrderHeaderData.sales_order_no = order.sales_order_no;
  //@ts-ignore
  initOrderHeaderData.sales_order_date = order.sales_order_date
    ? dayjs(order.sales_order_date).toDate()
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

export function formatSalesOrderDetailDataForEdit(salesItems: any) {
  
  const tempSalesItems: IItemListDatas[] = [];
  const initSalesItem = {
    id: '',
    base_unit_id: undefined,
    sales_unit_id: undefined,
    exchange_rate: '',
    is_partial_received: false,
    is_promotional_item: false,
    item: null,
    label: '',
    price_base: 0,
    price_sales: '',
    promotional_source_items: undefined,
    promotional_allocated_cost_sales: 0,
    promotional_allocated_count: 0,
    promotional_allocated_cost_amount: 0,
    promotional_relationship_value_percentages: 0,
    promotional_allocat_sum_value: 0,
    promotional_allocat_sum_cost: 0,
    tax_rate: '',
    qty_sales: '',
    received_qty: '',
    qty_base: 0,
    remark: '',
    value: '',
    search: '',
    total: {},
    discount_rate: '',
    discount_amount: 0,
    cost_base: 0,
    cost_sales: 0,
    subtotal: 0,
    tax_amount: 0,
    row_uuid: '',
    barcode: '',
    item_id: '',
    sale_price_base_snapshot: '',
    sort_index: 0,
  };
  salesItems?.map((salesItem: any) => {
    let tempSalesItem = { ...initSalesItem };

    tempSalesItem.id = salesItem.id;
    tempSalesItem.item_id = salesItem.item_id;
    tempSalesItem.base_unit_id = {
      ...salesItem.base_unit,
      value: salesItem.base_unit.id,
      label: salesItem.base_unit.unit_slug,
      name: salesItem.base_unit.name,
    };
    tempSalesItem.sales_unit_id = {
      ...salesItem.sales_unit,
      value: salesItem.sales_unit.id,
      label: salesItem.sales_unit.unit_slug,
      name: salesItem.sales_unit.name,
    };
    tempSalesItem.barcode = salesItem.barcode;
    tempSalesItem.exchange_rate = salesItem.exchange_rate;
    tempSalesItem.is_partial_received = salesItem.is_partial_received;
    tempSalesItem.is_promotional_item = salesItem.is_promotional_item;
    tempSalesItem.item = {
      ...salesItem.item,
      value: salesItem.item.id,
      label: convertItemsLabel(salesItem.item),
    };
    tempSalesItem.label = convertItemsLabel(salesItem.item);
    tempSalesItem.price_base = parseFloat(salesItem.price_base);
    tempSalesItem.price_sales = salesItem.price_sales;
    //@ts-ignore
    tempSalesItem.promotional_source_items = [
      ...salesItem.promotional_source_items,
    ];

    tempSalesItem.promotional_allocated_cost_sales = parseFloat(
      salesItem.price_base,
    );
    tempSalesItem.promotional_allocated_count = parseFloat(
      salesItem.price_base,
    );
    tempSalesItem.promotional_allocated_cost_amount = parseFloat(
      salesItem.promotional_allocated_cost_amount,
    );
    tempSalesItem.promotional_relationship_value_percentages = parseFloat(
      salesItem.promotional_relationship_value_percentages,
    );

    tempSalesItem.tax_rate = (parseFloat(salesItem.tax_rate) * 100).toFixed(2);
    tempSalesItem.qty_sales = salesItem.qty_sales;
    tempSalesItem.received_qty = salesItem.received_qty;
    tempSalesItem.qty_base = parseFloat(salesItem.qty_base);
    tempSalesItem.remark = salesItem.remark;
    tempSalesItem.value = salesItem.item_id;
    tempSalesItem.search = salesItem.item.search;
    tempSalesItem.total = { ...salesItem.total };
    tempSalesItem.discount_rate = salesItem.discount_rate;
    tempSalesItem.discount_amount = parseFloat(salesItem.discount_amount);
    tempSalesItem.cost_base = parseFloat(salesItem.cost_base);
    tempSalesItem.cost_sales = parseFloat(salesItem.cost_sales);
    tempSalesItem.subtotal = parseFloat(salesItem.subtotal);
    tempSalesItem.tax_amount = parseFloat(salesItem.tax_amount);
    tempSalesItem.row_uuid = salesItem.row_uuid;
    tempSalesItem.sort_index = salesItem.sort_index;
    tempSalesItem.sale_price_base_snapshot = salesItem.sale_price_base_snapshot;

    //@ts-ignore
    tempSalesItems.push(tempSalesItem);
  });

  return tempSalesItems;
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

export function convertSalesOrderSeqNo(orderSeqNo: string) {
  return `S${String(orderSeqNo).padStart(5, '0')}`;
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
      seqNo: convertSalesOrderSeqNo(order.seq_order_no),
      orderDate: order.sales_order_date,
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

  order.salesOrderItems.map((item: any) => {
    let itemTemp = {
      sku: item.sku,
      name: `${parseFloat(item.qty_pur) < 0 ? '[Return]====' : ''}${
        item.name_localizations.en
      }`,
      spec: item.spec,
      remarks: item.remark,
      unit: item.sales_unit.name,
      taxR: parseFloat(item.tax_rate) * 100,
      taxAmount: parseFloat(item.tax_amount).toFixed(2),
      qty: parseFloat(item.qty_sales).toFixed(2),
      price: parseFloat(item.price_sales).toFixed(2),
      total: parseFloat(item.total.total).toFixed(2),
    };
    itemsTemp.push(itemTemp);
  });

  pdfParams.items = [...itemsTemp];
  return pdfParams;
}
