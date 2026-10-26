import { apiClient } from '../../../services/apiClient';
import type { Material, CreateMaterialPayload, UpdateMaterialPayload, MaterialListParams } from '../types/material.types';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const materialApi = {
  list: async (params?: MaterialListParams, signal?: AbortSignal): Promise<PageResponse<Material>> => {
    const res = await apiClient.get<PageResponse<Material>>('/materials', { params, signal });
    return res.data;
  },

  getById: async (id: string): Promise<Material> => {
    const res = await apiClient.get<Material>(`/materials/${id}`);
    return res.data;
  },

  create: async (payload: CreateMaterialPayload): Promise<Material> => {
    const res = await apiClient.post<Material>('/materials', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateMaterialPayload): Promise<Material> => {
    const res = await apiClient.patch<Material>(`/materials/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: string): Promise<Material> => {
    const res = await apiClient.delete<Material>(`/materials/${id}`);
    return res.data;
  },
};
