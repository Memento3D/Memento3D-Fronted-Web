import { apiClient } from '../../../services/apiClient';
import type {
  Warehouse,
  CreateWarehousePayload,
  UpdateWarehousePayload,
  WarehouseListParams,
  WarehouseMember,
  AssignMemberPayload,
} from '../types/warehouse.types';
import type { PageResponse } from '../../material/api/materialApi';

export const warehouseApi = {
  list: async (params?: WarehouseListParams): Promise<PageResponse<Warehouse>> => {
    const res = await apiClient.get<PageResponse<Warehouse>>('/warehouses', { params });
    return res.data;
  },

  getMyWarehouses: async (): Promise<Warehouse[]> => {
    const res = await apiClient.get<Warehouse[]>('/warehouses/my-warehouses');
    return res.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const res = await apiClient.get<Warehouse>(`/warehouses/${id}`);
    return res.data;
  },

  create: async (payload: CreateWarehousePayload): Promise<Warehouse> => {
    const res = await apiClient.post<Warehouse>('/warehouses', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateWarehousePayload): Promise<Warehouse> => {
    const res = await apiClient.patch<Warehouse>(`/warehouses/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: string): Promise<Warehouse> => {
    const res = await apiClient.delete<Warehouse>(`/warehouses/${id}`);
    return res.data;
  },

  // F01: Membership & Staff Scoping
  getMembers: async (warehouseId: string): Promise<WarehouseMember[]> => {
    const res = await apiClient.get<WarehouseMember[]>(`/warehouses/${warehouseId}/members`);
    return res.data;
  },

  assignMember: async (warehouseId: string, payload: AssignMemberPayload): Promise<WarehouseMember> => {
    const res = await apiClient.post<WarehouseMember>(`/warehouses/${warehouseId}/members`, payload);
    return res.data;
  },

  revokeMember: async (warehouseId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${warehouseId}/members/${userId}`);
  },
};
