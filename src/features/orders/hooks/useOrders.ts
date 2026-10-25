import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import type { OrderListParams, OrderListResponse } from '../types/order.types';

export const useOrders = (params?: OrderListParams) => {
  return useQuery<OrderListResponse, Error>({
    queryKey: ['orders', params?.page, params?.limit, params?.status, params?.search, params?.query],
    queryFn: () => orderApi.list(params),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
  });
};

export const useOrderStatusCounts = () => {
  return useQuery<Record<string, number>, Error>({
    queryKey: ['order-status-counts'],
    queryFn: () => orderApi.getStatusCounts(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

export const useManagerOrderStatusCounts = () => {
  return useQuery<Record<string, number>, Error>({
    queryKey: ['manager-order-status-counts'],
    queryFn: () => orderApi.getManagerStatusCounts(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};
