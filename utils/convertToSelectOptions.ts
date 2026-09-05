import { ICategory } from '@/types/category';
import { IBin, IShelf, IZone } from '@/types/location';

export function convertUnitOptions(
  unitData: {
    id: string;
    isAvailable: boolean;
    name: string;
    unit_slug: number;
  }[],
): any[] {
  const options: any[] = [];
  unitData?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
      name: item.name,
    }),
  );

  return options;
}
export function convertCategoryOptions(data: any): any[] {
  const options: any[] = [];
  data?.map((item: any) =>
    options.push({
      value: item.id,
      label: item.name,
      ...data,
    }),
  );

  return options;
}
export function convertZoneOptions(data: IZone[]): any[] {
  const options: any[] = [];
  data?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
      ...item,
    }),
  );
  return options;
}
export function convertShelfOptions(data: IShelf[]): any[] {
  const options: any[] = [];
  data?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
      ...item,
    }),
  );
  return options;
}
export function convertBinOptions(data: IBin[]): any[] {
  const options: any[] = [];
  data?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
      ...item,
    }),
  );
  return options;
}

export function convertPaymentStatusOptions(
  data: {
    id: string;
    name: string;
  }[],
): any[] {
  const options: any[] = [];
  data?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
    }),
  );

  return options;
}
export function convertPaymentMethodOptions(
  data: {
    id: string;
    name: string;
  }[],
): any[] {
  const options: any[] = [];
  data?.map((item) =>
    options.push({
      value: item.id,
      label: item.name,
    }),
  );

  return options;
}

export function convertItemsLabel(item: any) {
  let name = item.name_localizations?.zh ? item.name_localizations.zh : '';
  name += item.name_localizations?.en ? item.name_localizations.en : '';
  name += item.spec ? ` - ${item.spec} ` : '';
  name += item.total_balance > 0 ? ` - Bal: ${item.total_balance} ` : '';
  name +=
    item.total_locked_balance > 0
      ? ` - Picking: ${item.total_locked_balance} `
      : '';

  return name;
}

export function convertTransferItemsLabel(item: any) {
  console.log('🚀 ~ convertTransferItemsLabel234 ~ item:', item);
  let name = item.item.barcode ? `  [${item.item.barcode}] ` : '';

  name += item.item.name_localizations?.zh
    ? item.item.name_localizations.zh
    : '';
  name += item.item.name_localizations?.en
    ? item.item.name_localizations.en
    : '';
  name += item.item.spec ? ` - ${item.item.spec} ` : '';

  name += item.locationCode ? ` Location: ${item.locationCode} ` : '';
  name += item.batchNumber ? ` Batch#: ${item.batchNumber} ` : '';
  name += item.expiryDate ? ` Expiry: ${item.expiryDate} ` : '';
  name += ` - Bal: ${item.balance_quantity} `;

  name +=
    item.total_locked_balance > 0
      ? ` - Picking: ${item.item.total_locked_balance} `
      : '';

  return name;
}

export function convertItemsOptions(data: any): any[] {
  const options: any[] = [];
  data?.map((item: any) => {
    let name = convertItemsLabel(item);
    options.push({
      value: item.id,
      label: name,
      ...item,
    });
  });

  return options;
}

export function convertTransferItemsOptions(data: any): any[] {
  const options: any[] = [];
  data?.map((item: any) => {
    let name = convertTransferItemsLabel(item);
    options.push({
      value: item.id,
      label: name,
      ...item,
    });
  });

  return options;
}
