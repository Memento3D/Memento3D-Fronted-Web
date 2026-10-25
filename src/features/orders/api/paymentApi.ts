import { apiClient } from '../../../services/apiClient';
import type {
  CreatePaymentRequest,
  PaymentMethod,
  PaymentResponse,
  PaymentStatusResponse,
  VnpayPaymentResponse,
  VnpayReturnResponse,
} from '../types/order.types';

export const paymentApi = {
  /**
   * Initiates a new payment transaction with MoMo, ZaloPay, or CASH for an order.
   */
  create: async (payload: CreatePaymentRequest): Promise<PaymentResponse> => {
    const res = await apiClient.post<PaymentResponse>('/payments', payload);
    return res.data;
  },

  /**
   * Directly initiates payment via Order endpoint /orders/{orderId}/payments
   */
  payOrder: async (orderId: string, paymentMethod: PaymentMethod): Promise<PaymentResponse> => {
    const res = await apiClient.post<PaymentResponse>(`/orders/${orderId}/payments`, {
      paymentMethod,
    });
    return res.data;
  },

  /**
   * Manager / Admin confirms CASH payment
   */
  confirmCash: async (paymentId: string): Promise<PaymentStatusResponse> => {
    const res = await apiClient.patch<PaymentStatusResponse>(`/payments/${paymentId}/confirm-cash`);
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
   * Initiates a VNPAY payment session for an order, returning signed VNPAY Sandbox checkout URL.
   */
  createVnpayPayment: async (orderId: string, returnUrl?: string): Promise<VnpayPaymentResponse> => {
    const res = await apiClient.post<VnpayPaymentResponse>('/payments/vnpay/create', {
      orderId,
      returnUrl,
    });
    return res.data;
  },

  /**
   * Verifies the customer redirect callback from VNPAY.
   */
  verifyVnpayReturn: async (params: Record<string, string>): Promise<VnpayReturnResponse> => {
    const queryString = new URLSearchParams(params).toString();
    const res = await apiClient.get<VnpayReturnResponse>(`/payments/vnpay/return?${queryString}`);
    return res.data;
  },

  /**
   * Retrieves all payment attempts for a specific order.
   */
  getOrderPayments: async (orderId: string): Promise<PaymentStatusResponse[]> => {
    const res = await apiClient.get<PaymentStatusResponse[]>(`/orders/${orderId}/payments`);
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
