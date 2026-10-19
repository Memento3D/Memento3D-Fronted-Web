import { apiClient } from '../../../services/apiClient';
import type { User } from '../../auth/types/auth.types';
import type {
  UserAddress,
  CreateAddressPayload,
  UpdateAddressPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/profile.types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const res = await apiClient.patch<User>('/users/me', payload);
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteAvatar: async (): Promise<User> => {
    const res = await apiClient.delete<User>('/users/me/avatar');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/users/me/change-password', payload);
    return res.data;
  },

  getAddresses: async (): Promise<UserAddress[]> => {
    const res = await apiClient.get<UserAddress[]>('/users/me/addresses');
    return res.data;
  },

  createAddress: async (payload: CreateAddressPayload): Promise<UserAddress> => {
    const res = await apiClient.post<UserAddress>('/users/me/addresses', payload);
    return res.data;
  },

  updateAddress: async (id: string, payload: UpdateAddressPayload): Promise<UserAddress> => {
    const res = await apiClient.patch<UserAddress>(`/users/me/addresses/${id}`, payload);
    return res.data;
  },

  deleteAddress: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/users/me/addresses/${id}`);
    return res.data;
  },

  setDefaultAddress: async (id: string): Promise<UserAddress> => {
    const res = await apiClient.patch<UserAddress>(`/users/me/addresses/${id}/default`);
    return res.data;
  },
};
