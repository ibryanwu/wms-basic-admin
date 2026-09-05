export interface IZone {
  id?: string;
  warehouseId: string;
  name: string;
  description?: string;
  capacity?: string | number;
  storageType: string;
  location?: string;
  isActive?: boolean;
}
export interface IShelf {
  id?: string;
  zoneId: string;
  name: string;
  description?: string;
  capacity?: string | number;
  storageType: string;
  location?: string;
  isActive?: boolean;
}
export interface IBin {
  id?: string;
  shelfId: string;
  name: string;
  description?: string;
  capacity?: string | number;
  storageType: string;
  location?: string;
  isActive?: boolean;
}
