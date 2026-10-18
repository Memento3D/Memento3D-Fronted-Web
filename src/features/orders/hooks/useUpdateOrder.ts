import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import type { OrderResponse, UpdateOrderRequest } from '../types/order.types';

export const useUpdateOrder = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, UpdateOrderRequest>({
    mutationFn: (payload: UpdateOrderRequest) => orderApi.update(orderId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData(['order', orderId], data);
    },
  });
};
