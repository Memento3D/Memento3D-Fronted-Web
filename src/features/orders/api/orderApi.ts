import { apiClient } from '../../../services/apiClient';
import type {
  OrderResponse,
  OrderListResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderListParams,
} from '../types/order.types';

export const orderApi = {
  /**
   * Retrieves orders. Regular users receive only their own orders;
   * Admins, Managers and Operators receive all orders across the system.
   */
  list: async (params?: OrderListParams): Promise<OrderListResponse> => {
    const queryParams: Record<string, any> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.status && params.status !== 'ALL') {
      queryParams.status = params.status;
    }
    if (params?.search && params.search.trim()) {
      queryParams.query = params.search.trim();
    } else if (params?.query && params.query.trim()) {
      queryParams.query = params.query.trim();
    }

    const res = await apiClient.get<OrderListResponse>('/orders', {
      params: queryParams,
    });
    return res.data;
  },

  /**
   * Retrieves count of orders grouped by status for filter tabs
   */
  getStatusCounts: async (): Promise<Record<string, number>> => {
    try {
      const res = await apiClient.get<Record<string, number>>('/orders/me/counts');
      return res.data;
    } catch {
      return {};
    }
  },

  /**
   * Retrieves count of orders grouped by status for managers
   */
  getManagerStatusCounts: async (): Promise<Record<string, number>> => {
    try {
      const res = await apiClient.get<Record<string, number>>('/manager/orders/counts');
      return res.data;
    } catch {
      return {};
    }
  },

  /**
   * Retrieves order detail by UUID. Enforces ownership check on Backend.
   */
  getById: async (orderId: string): Promise<OrderResponse> => {
    const res = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    return res.data;
  },

  /**
   * Creates a new 3D print order in PENDING_PAYMENT status.
   */
  create: async (payload: CreateOrderRequest): Promise<OrderResponse> => {
    const res = await apiClient.post<OrderResponse>('/orders', payload);
    return res.data;
  },

  /**
   * Updates shipping info or order status (status update restricted to staff).
   */
  update: async (orderId: string, payload: UpdateOrderRequest): Promise<OrderResponse> => {
    const res = await apiClient.patch<OrderResponse>(`/orders/${orderId}`, payload);
    return res.data;
  },

  /**
   * Cancels an order. Regular users can only cancel when PENDING_PAYMENT.
   */
  cancel: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`);
  },
};
