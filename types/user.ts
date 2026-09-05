export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  role: any;
  email: string;
  password: string;
  phone: string;
  vendorId: string;
  vendor: any;
  isActive?: boolean;
}
