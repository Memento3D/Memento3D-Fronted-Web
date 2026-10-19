import { apiClient } from '../../../services/apiClient';
import type {
  AdminDashboardSummary,
  AdminRevenueTrend,
  AdminUserGrowth,
  AdminCategoryPerformance,
  AdminUserDetail,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminSystemHealth,
  AdminPaymentTransaction,
  AdminAuditLog,
  AdminProduct,
  AdminCategory,
  AdminReconstructionJob,
  AdminPrinter,
  AdminPrintJob,
  PageResponse,
} from '../types/admin.types';

export const adminApi = {
  // 1. Dashboard Analytics
  getDashboardSummary: async (): Promise<AdminDashboardSummary> => {
    const res = await apiClient.get<AdminDashboardSummary>('/admin/dashboard/summary');
    return res.data;
  },

  getRevenueTrend: async (period = '30d'): Promise<AdminRevenueTrend> => {
    const res = await apiClient.get<AdminRevenueTrend>('/admin/dashboard/revenue', {
      params: { period },
    });
    return res.data;
  },

  getUserGrowth: async (period = '30d'): Promise<AdminUserGrowth> => {
    const res = await apiClient.get<AdminUserGrowth>('/admin/dashboard/user-growth', {
      params: { period },
    });
    return res.data;
  },

  getCategoryPerformance: async (): Promise<AdminCategoryPerformance> => {
    const res = await apiClient.get<AdminCategoryPerformance>(
      '/admin/dashboard/category-performance'
    );
    return res.data;
  },

  // 2. User Management
  getUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    provider?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<AdminUserDetail>> => {
    const res = await apiClient.get<PageResponse<AdminUserDetail>>('/admin/users', {
      params,
    });
    return res.data;
  },

  getUserById: async (id: string): Promise<AdminUserDetail> => {
    const res = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
    return res.data;
  },

  createUser: async (payload: AdminCreateUserRequest): Promise<AdminUserDetail> => {
    const res = await apiClient.post<AdminUserDetail>('/admin/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: AdminUpdateUserRequest): Promise<AdminUserDetail> => {
    const res = await apiClient.patch<AdminUserDetail>(`/admin/users/${id}`, payload);
    return res.data;
  },

  lockUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/lock`);
  },

  unlockUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/unlock`);
  },

  activateUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/activate`);
  },

  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/deactivate`);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  updateUserRole: async (id: string, role: string): Promise<AdminUserDetail> => {
    const res = await apiClient.put<AdminUserDetail>(`/admin/users/${id}/role`, null, {
      params: { role },
    });
    return res.data;
  },

  assignWarehouses: async (userId: string, warehouseIds: string[]): Promise<AdminUserDetail> => {
    const res = await apiClient.put<AdminUserDetail>(
      `/admin/users/${userId}/warehouse-assignments`,
      warehouseIds
    );
    return res.data;
  },

  // 3. Orders Management
  getOrders: async (params?: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<any>> => {
    const res = await apiClient.get<PageResponse<any>>('/admin/orders', {
      params,
    });
    return res.data;
  },

  getOrderById: async (id: string): Promise<any> => {
    const res = await apiClient.get<any>(`/admin/orders/${id}`);
    return res.data;
  },

  // 4. Products & Categories Management
  getProducts: async (params?: {
    search?: string;
    categoryId?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminProduct>> => {
    const res = await apiClient.get<PageResponse<AdminProduct>>('/admin/products', {
      params,
    });
    return res.data;
  },

  createProduct: async (payload: Partial<AdminProduct>): Promise<AdminProduct> => {
    const res = await apiClient.post<AdminProduct>('/admin/products', payload);
    return res.data;
  },

  updateProduct: async (id: string, payload: Partial<AdminProduct>): Promise<AdminProduct> => {
    const res = await apiClient.patch<AdminProduct>(`/admin/products/${id}`, payload);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  getCategories: async (): Promise<AdminCategory[]> => {
    const res = await apiClient.get<AdminCategory[]>('/admin/categories');
    return res.data;
  },

  createCategory: async (payload: Partial<AdminCategory>): Promise<AdminCategory> => {
    const res = await apiClient.post<AdminCategory>('/admin/categories', payload);
    return res.data;
  },

  updateCategory: async (id: string, payload: Partial<AdminCategory>): Promise<AdminCategory> => {
    const res = await apiClient.patch<AdminCategory>(`/admin/categories/${id}`, payload);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  // 5. 3D AI Reconstruction Monitoring
  getReconstructionJobs: async (params?: {
    status?: string;
    tier?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminReconstructionJob>> => {
    const res = await apiClient.get<PageResponse<AdminReconstructionJob>>(
      '/admin/reconstruction',
      { params }
    );
    return res.data;
  },

  getReconstructionJobById: async (id: string): Promise<AdminReconstructionJob> => {
    const res = await apiClient.get<AdminReconstructionJob>(`/admin/reconstruction/${id}`);
    return res.data;
  },

  retryReconstructionJob: async (id: string): Promise<AdminReconstructionJob> => {
    const res = await apiClient.post<AdminReconstructionJob>(
      `/admin/reconstruction/${id}/retry`
    );
    return res.data;
  },

  // 6. Hardware Printer & Print Jobs
  getPrinters: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminPrinter>> => {
    const res = await apiClient.get<PageResponse<AdminPrinter>>('/admin/printers', {
      params,
    });
    return res.data;
  },

  getPrintJobs: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminPrintJob>> => {
    const res = await apiClient.get<PageResponse<AdminPrintJob>>('/admin/print-jobs', {
      params,
    });
    return res.data;
  },

  // 7. Payments Ledger
  getPayments: async (params?: {
    status?: string;
    paymentMethod?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminPaymentTransaction>> => {
    const res = await apiClient.get<PageResponse<AdminPaymentTransaction>>('/admin/payments', {
      params,
    });
    return res.data;
  },

  // 8. System Audit Logs
  getAuditLogs: async (params?: {
    actorId?: string;
    action?: string;
    resourceType?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminAuditLog>> => {
    const res = await apiClient.get<PageResponse<AdminAuditLog>>('/admin/audit-logs', {
      params,
    });
    return res.data;
  },

  // 9. System Diagnostics Health
  getSystemHealth: async (): Promise<AdminSystemHealth> => {
    const res = await apiClient.get<AdminSystemHealth>('/admin/system/health');
    return res.data;
  },
};
