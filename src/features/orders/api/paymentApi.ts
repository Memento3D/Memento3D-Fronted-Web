import { apiClient } from '../../../services/apiClient';
import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
} from '../types/order.types';

export const paymentApi = {
  /**
   * Initiates a new payment transaction with MoMo or ZaloPay for an order.
   */
  create: async (payload: CreatePaymentRequest): Promise<PaymentResponse> => {
    const res = await apiClient.post<PaymentResponse>('/payments', payload);
    return res.data;
  },

  /**
   * Retrieves the status of a payment transaction.
   */
  getStatus: async (paymentId: string): Promise<PaymentStatusResponse> => {
    const res = await apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}`);
    return res.data;
  },

  /**
   * Lists all payments for current user (or all if staff).
   */
  list: async (): Promise<PaymentStatusResponse[]> => {
    const res = await apiClient.get<PaymentStatusResponse[]>('/payments');
    return res.data;
  },

  /**
   * Cancels a pending or processing payment transaction.
   */
  cancel: async (paymentId: string): Promise<PaymentStatusResponse> => {
    const res = await apiClient.delete<PaymentStatusResponse>(`/payments/${paymentId}`);
    return res.data;
  },
};
