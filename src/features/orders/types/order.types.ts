export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PRINTING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'MOMO' | 'ZALOPAY';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface OrderResponse {
  id: string;
  userId: string;
  scanId?: string | null;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  recipientName: string;
  shippingAddress: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateOrderRequest {
  scanId?: string;
  totalPrice: number;
  currency?: string;
  recipientName: string;
  shippingAddress: string;
  phone: string;
}

export interface UpdateOrderRequest {
  recipientName?: string;
  shippingAddress?: string;
  phone?: string;
  status?: OrderStatus;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  redirectUrl?: string;
  orderInfo?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
  merchantTransactionId: string;
  createdAt: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  merchantTransactionId: string;
  providerTransactionId?: string;
  failureCode?: string;
  failureMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
