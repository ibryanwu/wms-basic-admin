import { Label } from '@mui/icons-material';
import { orderTypeOptions as inboundOrderType } from './inbound';
import { orderTypeOptions as outboundOrderType } from './outbound';

export const allOrderTypeOptions = [...inboundOrderType, ...outboundOrderType];

// 获取所有 zones 的 options
export function getZonesOptions(locationData: any) {
  return locationData.map((zone: any) => ({
    value: zone.id,
    label: zone.name,
  }));
}

// 获取特定 zone 下的 shelves
export function getShelvesByZone(zoneId: number, locationData: any) {
  const zone = locationData.find((z: any) => z.id === zoneId);
  return zone
    ? zone.shelves.map((shelf: any) => ({
        value: shelf.id,
        label: shelf.name,
        ...shelf,
      }))
    : [];
}

// 获取特定 shelf 下的 bins
export function getBinsByShelf(shelfId: number, locationData: any) {
  for (const zone of locationData) {
    const shelf = zone.shelves.find((s: any) => s.id === shelfId);
    if (shelf) {
      return shelf.bins.map((bin: any) => ({
        value: bin.id,
        label: bin.name,
        ...bin,
      }));
    }
  }
  return [];
}

// 根据 zoneId 查找 Zone 数据
export function findZoneByName(
  locationData: any,
  zoneName: string,
  warehouseId: number,
) {
  const zone = locationData?.find(
    (zone: any) => zone.name === zoneName && zone.warehouse_id === warehouseId,
  );
  if (zone) {
    return { value: zone.id, label: zone.name };
  }
  return null; // 如果找不到返回 null
}

// 根据 shelfId 查找 Shelf 数据
export function findShelfByName(
  locationData: any,
  shelfName: string,
  zoneId: number,
) {
  for (const zone of locationData) {
    const shelf = zone.shelves.find(
      (shelf: any) => shelf.name === shelfName && shelf.zone_id === zoneId,
    );
    if (shelf) {
      return { value: shelf.id, label: shelf.name };
    }
  }
  return null; // 如果找不到返回 null
}

// 根据 binId 查找 Bin 数据
export function findBinByName(
  locationData: any,
  binName: string,
  shelfId: number,
) {
  for (const zone of locationData) {
    for (const shelf of zone.shelves) {
      const bin = shelf.bins.find(
        (bin: any) => bin.name === binName && bin.shelf_id === shelfId,
      );
      if (bin) {
        return { value: bin.id, label: bin.name };
      }
    }
  }
  return null; // 如果找不到返回 null
}

//输入一个location code自动拆分后，查找对应的区架位并生成option
export function parseLocationCode(
  locationCode: string,
  locationData: any,
  storeInfo: {
    zoneCodeLength?: number;
    shelfCodeLength?: number;
    binCodeLength?: number;
  },
  warehouseId: number,
) {
  const locationOptions: any = { zone: null, shelf: null, bin: null };

  // 确保 zoneCodeLength, shelfCodeLength, binCodeLength 为数字
  const zoneCodeLength =
    typeof storeInfo.zoneCodeLength === 'number' ? storeInfo.zoneCodeLength : 0;
  const shelfCodeLength =
    typeof storeInfo.shelfCodeLength === 'number'
      ? storeInfo.shelfCodeLength
      : 0;
  const binCodeLength =
    typeof storeInfo.binCodeLength === 'number' ? storeInfo.binCodeLength : 0;

  // 验证 locationCode 是否为空
  if (locationCode?.trim().length < zoneCodeLength) {
    return null;
  }
  // 计算总长度
  const totalLength = zoneCodeLength + shelfCodeLength + binCodeLength;

  // // 验证 locationCode 长度是否匹配
  // if (locationCode.length !== totalLength) {
  //   throw new Error(
  //     `Invalid location code length. Expected ${totalLength} characters but got ${locationCode.length}.`,
  //   );
  // }

  // 拆分字符串
  const zone = locationCode.slice(0, zoneCodeLength);
  const shelf =
    shelfCodeLength > 0
      ? locationCode.slice(zoneCodeLength, zoneCodeLength + shelfCodeLength)
      : null;
  const bin =
    binCodeLength > 0
      ? locationCode.slice(zoneCodeLength + shelfCodeLength, totalLength)
      : null;

  //找到对应的option
  if (zone) {
    locationOptions.zone = findZoneByName(locationData, zone, warehouseId);
    locationOptions.checkLocation = locationOptions.zone?.label || '';
  }
  if (shelf && locationOptions.zone) {
    locationOptions.shelf = findShelfByName(
      locationData,
      shelf,
      locationOptions.zone.value,
    );
    locationOptions.checkLocation += locationOptions.shelf?.label || '';
  }
  if (bin && locationOptions.shelf) {
    locationOptions.bin = findBinByName(
      locationData,
      bin,
      locationOptions.shelf.value,
    );
    locationOptions.checkLocation += locationOptions.bin?.label;
  }

  // 返回结果
  return locationOptions;
}
