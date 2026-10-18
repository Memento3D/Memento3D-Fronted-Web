import { apiClient } from './apiClient';
import type { Material, CreateMaterialPayload, UpdateMaterialPayload, MaterialStatus, MaterialType } from '../types/material';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const materialService = {
  async list(params?: {
    status?: MaterialStatus;
    type?: MaterialType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Material>> {
    const res = await apiClient.get<PageResponse<Material>>('/materials', { params });
    return res.data;
  },

  async getById(id: string): Promise<Material> {
    const res = await apiClient.get<Material>(`/materials/${id}`);
    return res.data;
  },

  async create(payload: CreateMaterialPayload): Promise<Material> {
    const res = await apiClient.post<Material>('/materials', payload);
    return res.data;
  },

  async update(id: string, payload: UpdateMaterialPayload): Promise<Material> {
    const res = await apiClient.patch<Material>(`/materials/${id}`, payload);
    return res.data;
  },

  async deactivate(id: string): Promise<Material> {
    const res = await apiClient.delete<Material>(`/materials/${id}`);
    return res.data;
  },
};
