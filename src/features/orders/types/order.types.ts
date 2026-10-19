export type OrderStatus =
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'MODEL_APPROVAL_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PRINTING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'MOMO' | 'ZALOPAY' | 'CASH';

export type PaymentStatus = 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItemResponse {
  id: string;
  productId?: string;
  productNameSnapshot: string;
  thumbnailSnapshot?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customizationSnapshot?: Record<string, any>;
}

export interface OrderResponse {
  id: string;
  orderCode?: string;
  userId: string;
  scanId?: string | null;
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  recipientName: string;
  shippingAddress: string;
  phone: string;
  note?: string;
  items?: OrderItemResponse[];
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
  totalPrice?: number;
  currency?: string;
  recipientName: string;
  shippingAddress: string;
  phone: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  items?: Array<{
    productId: string;
    quantity: number;
    customization?: Record<string, any>;
  }>;
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
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
}
