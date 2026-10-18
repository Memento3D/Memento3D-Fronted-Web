import { apiClient } from '../../../services/apiClient';
import type {
  ProductCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/product.types';

export const categoryApi = {
  list: async (activeOnly = true): Promise<ProductCategory[]> => {
    const res = await apiClient.get<ProductCategory[]>('/product-categories', {
      params: { activeOnly },
    });
    return res.data;
  },

  getById: async (id: string): Promise<ProductCategory> => {
    const res = await apiClient.get<ProductCategory>(`/product-categories/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string): Promise<ProductCategory> => {
    const res = await apiClient.get<ProductCategory>(`/product-categories/slug/${slug}`);
    return res.data;
  },

  create: async (payload: CreateCategoryRequest): Promise<ProductCategory> => {
    const res = await apiClient.post<ProductCategory>('/product-categories', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateCategoryRequest): Promise<ProductCategory> => {
    const res = await apiClient.put<ProductCategory>(`/product-categories/${id}`, payload);
    return res.data;
  },

  updateStatus: async (id: string, active: boolean): Promise<ProductCategory> => {
    const res = await apiClient.patch<ProductCategory>(`/product-categories/${id}/status`, { active });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/product-categories/${id}`);
  },
};
