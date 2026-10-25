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

export type PaymentMethod = 'MOMO' | 'ZALOPAY' | 'CASH' | 'VNPAY';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'PROCESSING';

export interface VnpayPaymentResponse {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionRef: string;
  paymentUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface VnpayReturnResponse {
  orderId: string;
  transactionRef: string;
  status: PaymentStatus;
  message: string;
  amount: number;
  bankCode?: string;
  gatewayTransactionNo?: string;
  responseCode?: string;
  paymentDate?: string;
}

export interface OrderItemResponse {
  id: string;
  productId?: string;
  productName?: string;
  productNameSnapshot: string;
  thumbnailUrl?: string;
  thumbnailSnapshot?: string;
  sku?: string;
  categoryName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  material?: string;
  technology?: string;
  dimensions?: string;
  color?: string;
  finish?: string;
  base?: string;
  accessories?: string;
  personalization?: string;
  actualMaterial?: string;
  productionStatus?: string;
  customization?: Record<string, any>;
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
  customizationFee?: number;
  productionSurcharge?: number;
  totalAmount?: number;
  totalPrice: number;
  paidAmount?: number;
  remainingAmount?: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  recipientName: string;
  shippingAddress: string;
  phone: string;
  note?: string;
  shippingCarrier?: string;
  trackingCode?: string;
  shippingStatus?: string;
  itemCount?: number;
  representativeProductName?: string;
  representativeThumbnailUrl?: string;
  isOutsourced?: boolean;
  internalPartnerName?: string;
  internalCost?: number;
  internalQcNotes?: string;
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
  status?: OrderStatus | 'ALL';
  search?: string;
  query?: string;
}

export type OrderStatusCounts = Record<string, number>;

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
