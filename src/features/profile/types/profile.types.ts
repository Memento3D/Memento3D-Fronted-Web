export type AddressLabel = 'HOME' | 'OFFICE' | 'OTHER';

export interface UserAddress {
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  district?: string;
  ward: string;
  streetAddress: string;
  label: AddressLabel;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  province: string;
  district?: string;
  ward: string;
  streetAddress: string;
  label: AddressLabel;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  recipientName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  label?: AddressLabel;
  isDefault?: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}
