import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/paymentApi';
import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
} from '../types/order.types';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<PaymentResponse, Error, CreatePaymentRequest>({
    mutationFn: (payload: CreatePaymentRequest) => paymentApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
    },
  });
};

export const usePaymentStatus = (paymentId?: string) => {
  return useQuery<PaymentStatusResponse, Error>({
    queryKey: ['payment-status', paymentId],
    queryFn: () => {
      if (!paymentId) throw new Error('Payment ID is required');
      return paymentApi.getStatus(paymentId);
    },
    enabled: Boolean(paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PENDING') {
        return 4000;
      }
      return false;
    },
  });
};

export const usePaymentsList = () => {
  return useQuery<PaymentStatusResponse[], Error>({
    queryKey: ['payments'],
    queryFn: () => paymentApi.list(),
  });
};
