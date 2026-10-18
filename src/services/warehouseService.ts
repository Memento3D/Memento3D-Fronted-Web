import { apiClient } from './apiClient';
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload, WarehouseStatus } from '../types/warehouse';
import type { PageResponse } from './materialService';

export const warehouseService = {
  async list(params?: {
    status?: WarehouseStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Warehouse>> {
    const res = await apiClient.get<PageResponse<Warehouse>>('/warehouses', { params });
    return res.data;
  },

  async getById(id: string): Promise<Warehouse> {
    const res = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return res.data;
  },

  async create(payload: CreateWarehousePayload): Promise<Warehouse> {
    const res = await apiClient.post<Warehouse>('/warehouses', payload);
    return res.data;
  },

  async update(id: string, payload: UpdateWarehousePayload): Promise<Warehouse> {
    const res = await apiClient.patch<Warehouse>(`/warehouses/${id}`, payload);
    return res.data;
  },

  async deactivate(id: string): Promise<Warehouse> {
    const res = await apiClient.delete<Warehouse>(`/warehouses/${id}`);
    return res.data;
  },
};
