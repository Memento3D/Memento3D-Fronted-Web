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
    // Never auto-retry a payment creation: avoids duplicate transactions
    retry: false,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
    },
  });
};

export const useConfirmCash = () => {
  const queryClient = useQueryClient();

  return useMutation<PaymentStatusResponse, Error, string>({
    mutationFn: (paymentId: string) => paymentApi.confirmCash(paymentId),
    retry: false,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

const PAYMENT_POLL_INTERVAL_MS = 4000;
const PAYMENT_POLL_MAX_DURATION_MS = 3 * 60 * 1000;

/**
 * Tracks the backend-confirmed payment status. Polls only while PENDING and
 * for a bounded time; stops on SUCCESS / FAILED / CANCELLED (or any non-PENDING).
 * Order/payment queries are invalidated once the status actually leaves PENDING.
 */
export const usePaymentStatus = (paymentId?: string) => {
  const queryClient = useQueryClient();

  return useQuery<PaymentStatusResponse, Error>({
    queryKey: ['payment-status', paymentId],
    queryFn: async ({ signal }) => {
      if (!paymentId) throw new Error('Payment ID is required');
      const result = await paymentApi.getStatus(paymentId);
      if (signal.aborted) throw new Error('Aborted');
      if (result.status !== 'PENDING') {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['order', result.orderId] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
      return result;
    },
    enabled: Boolean(paymentId),
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status !== 'PENDING') return false;
      const elapsed = Date.now() - (query.state.dataUpdatedAt || Date.now());
      const polledFor = query.state.dataUpdateCount * PAYMENT_POLL_INTERVAL_MS;
      if (elapsed > PAYMENT_POLL_MAX_DURATION_MS || polledFor > PAYMENT_POLL_MAX_DURATION_MS) {
        return false;
      }
      return PAYMENT_POLL_INTERVAL_MS;
    },
  });
};

export const usePaymentsList = () => {
  return useQuery<PaymentStatusResponse[], Error>({
    queryKey: ['payments'],
    queryFn: () => paymentApi.list(),
  });
};

export const useOrderPayments = (orderId?: string) => {
  return useQuery<PaymentResponse[], Error>({
    queryKey: ['order-payments', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      return paymentApi.getOrderPayments(orderId);
    },
    enabled: Boolean(orderId),
  });
};

