// 导出入库单
export const exportOutboundListToCSV = (orderListData: any) => {
  
  const poListHeader =
    'Outbound Number / 出库单号,Vendor / 客户,Number of items,Outbound Date / 日期,SubTotal	,Tax,Shipping Fee,Total';

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

export const exportInvTransactionsToCSV = (data: any) => {
  const reportHeader =
    'Order Date, Order No, InvoiceNo,Warehouse,Vendor,BatchNumber,Item,expiryDate,Location,TransactionType,StockInOut,SKU,UPC,BaseUnit,CaseUnit,InitQuantity, QuantityChange,UpdatedQuantity, Remarks ';

  // 移除逗号并将换行符替换为空格的函数
  const cleanField = (field: string | number) => {
    if (typeof field === 'string') {
      return field.replace(/,/g, '').replace(/\r?\n|\r/g, ' '); // 移除逗号并替换换行符为空格
    }
    return field;
  };
  if (data?.data) {
    const csv = `${reportHeader}\n${data.data
      .map((row: any) => {
        const field: any[] = [];
        field.push(cleanField(row.order_date));
        field.push(cleanField(row.inventory.inboundOrderHeader.order_no));
        field.push(cleanField(row.invoice_no));
        field.push(cleanField(row.warehouse.name));
        field.push(cleanField(row.vendor.name));
        field.push(cleanField(row.batchNumber));
        field.push(cleanField(row.transactionType));
        field.push(cleanField(row.stockInOut));
        field.push(cleanField(row.item.name_localizations.en));
        field.push(cleanField(row.expiryDate));
        field.push(
          cleanField(
            `${row.zone ? row.zone.name : ''}${
              row.shelf ? row.shelf.name : ''
            }${row.bin ? row.bin.name : ''}`,
          ),
        );
        field.push(cleanField(row.item.sku));
        field.push(cleanField(row.item.upc));
        field.push(cleanField(row.base_unit.name));
        field.push(cleanField(row.case_unit && row.item.case_unit.name));
        field.push(cleanField(row.initQuantity));
        field.push(cleanField(row.quantityChange));
        field.push(cleanField(row.updatedQuantity));
        field.push(cleanField(row.remarks));

        return field;
      })
      .join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // 获取当前日期并格式化为 YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `inv-transactions-${currentDate}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export const exportInventoryDetailToCSV = (data: any) => {
  const reportHeader =
    'warehouse, vendor, batchNumber,Item,Location,sku,upc,expiryDate,base_unit,base_quantity,balance_quantity,locked_quantity,case_unit,unitCost,totalCost ';

  // 移除逗号并将换行符替换为空格的函数
  const cleanField = (field: string | number) => {
    if (typeof field === 'string') {
      return field.replace(/,/g, '').replace(/\r?\n|\r/g, ' '); // 移除逗号并替换换行符为空格
    }
    return field;
  };
  if (data) {
    const csv = `${reportHeader}\n${data
      .map((row: any) => {
        const field: any[] = [];
        field.push(cleanField(row.warehouse.name));
        field.push(cleanField(row.vendor.name));
        field.push(cleanField(row.batchNumber));
        field.push(cleanField(row.item.name_localizations.en));
        field.push(
          cleanField(
            `${row.zone ? row.zone.name : ''}${
              row.shelf ? row.shelf.name : ''
            }${row.bin ? row.bin.name : ''}`,
          ),
        );
        field.push(cleanField(row.item.sku));
        field.push(cleanField(row.item.upc));
        field.push(cleanField(row.expiryDate));
        field.push(cleanField(row.base_unit.name));
        field.push(cleanField(row.base_quantity));
        field.push(cleanField(row.balance_quantity));
        field.push(cleanField(row.locked_quantity));
        field.push(cleanField(row.case_unit && row.item.case_unit.name));
        field.push(cleanField(row.unitCost));
        field.push(cleanField(row.totalCost));

        return field;
      })
      .join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // 获取当前日期并格式化为 YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `inv-detail-${currentDate}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export const exportInventoryByWarehouseToCSV = (data: any) => {
  const reportHeader = 'warehouse, Item,Location,total_cost ';

  // 移除逗号并将换行符替换为空格的函数
  const cleanField = (field: string | number) => {
    if (typeof field === 'string') {
      return field.replace(/,/g, '').replace(/\r?\n|\r/g, ' '); // 移除逗号并替换换行符为空格
    }
    return field;
  };
  if (data) {
    const csv = `${reportHeader}\n${data
      .map((row: any) => {
        const field: any[] = [];
        field.push(cleanField(row.warehouse_name));
        field.push(cleanField(row.item_name));
        field.push(cleanField(row.total_balance));
        field.push(cleanField(Number(row.total_cost).toFixed(2)));

        return field;
      })
      .join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // 获取当前日期并格式化为 YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `inventory-by-warehouse-${currentDate}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
