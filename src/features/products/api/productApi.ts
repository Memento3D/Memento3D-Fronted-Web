import { apiClient } from '../../../services/apiClient';
import type {
  Product,
  ProductListResponse,
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/product.types';

export const productApi = {
  list: async (params?: ProductFilterParams, signal?: AbortSignal): Promise<ProductListResponse> => {
    const res = await apiClient.get<ProductListResponse>('/products', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        keyword: params?.keyword,
        categoryId: params?.categoryId,
        categorySlug: params?.categorySlug,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        sort: params?.sort || 'newest',
        featured: params?.featured,
      },
      signal,
    });
    return res.data;
  },

  getFeatured: async (): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>('/products/featured');
    return res.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/slug/${slug}`);
    return res.data;
  },

  create: async (payload: CreateProductRequest): Promise<Product> => {
    const res = await apiClient.post<Product>('/products', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateProductRequest): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}`, payload);
    return res.data;
  },

  updateStatus: async (id: string, active: boolean): Promise<Product> => {
    const res = await apiClient.patch<Product>(`/products/${id}/status`, { active });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
