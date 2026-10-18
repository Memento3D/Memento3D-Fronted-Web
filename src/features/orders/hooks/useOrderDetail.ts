import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import type { OrderResponse } from '../types/order.types';

export const useOrderDetail = (orderId?: string) => {
  return useQuery<OrderResponse, Error>({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      return orderApi.getById(orderId);
    },
    enabled: Boolean(orderId),
    refetchOnWindowFocus: true,
    // Poll every 8 seconds if order is in transient state (PENDING_PAYMENT, CONFIRMED, or PRINTING)
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PENDING_PAYMENT' || status === 'CONFIRMED' || status === 'PRINTING') {
        return 8000;
      }
      return false;
    },
  });
};
