import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import type { OrderListParams, OrderListResponse } from '../types/order.types';

export const useOrders = (params?: OrderListParams) => {
  return useQuery<OrderListResponse, Error>({
    queryKey: ['orders', params?.page, params?.limit],
    queryFn: () => orderApi.list(params),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
  });
};
