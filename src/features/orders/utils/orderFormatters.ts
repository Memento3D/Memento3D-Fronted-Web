import type { OrderStatus, PaymentStatus } from '../types/order.types';

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  }
};

export const formatOrderDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export interface StatusMeta {
  label: string;
  color: string;
  textColor?: string;
  badgeStatus: 'default' | 'success' | 'processing' | 'error' | 'warning';
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusMeta> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: '#f59e0b',
    badgeStatus: 'warning',
    description: 'Đơn hàng đã khởi tạo, đang chờ xử lý hoặc thanh toán.',
  },
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: '#f59e0b',
    badgeStatus: 'warning',
    description: 'Đơn hàng đã khởi tạo, đang chờ khách hàng thanh toán.',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: '#06b6d4',
    badgeStatus: 'processing',
    description: 'Đơn hàng đã xác nhận và xếp lịch chuẩn bị sản xuất in 3D.',
  },
  PROCESSING: {
    label: 'Đang xử lý kỹ thuật',
    color: '#3b82f6',
    badgeStatus: 'processing',
    description: 'Kỹ sư đang tiền xử lý file 3D mesh và cấu hình vật liệu in.',
  },
  PRINTING: {
    label: 'Đang in 3D',
    color: '#8b5cf6',
    badgeStatus: 'processing',
    description: 'Xưởng in đang vận hành máy in 3D đùn sợi/resin để chế tác vật phẩm.',
  },
  READY: {
    label: 'Hoàn thiện (Sẵn sàng)',
    color: '#10b981',
    badgeStatus: 'success',
    description: 'Sản phẩm đã in xong, hoàn thiện thủ công và sẵn sàng bàn giao.',
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    color: '#3b82f6',
    badgeStatus: 'processing',
    description: 'Sản phẩm đã qua khâu QC kiểm định và bàn giao cho đơn vị vận chuyển.',
  },
  DELIVERED: {
    label: 'Đã giao thành công',
    color: '#10b981',
    badgeStatus: 'success',
    description: 'Kiện hàng đã được giao tận tay khách hàng.',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: '#10b981',
    badgeStatus: 'success',
    description: 'Đơn hàng đã hoàn thành trọn vẹn.',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: '#ef4444',
    badgeStatus: 'error',
    description: 'Đơn hàng đã bị hủy bỏ.',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: '#64748b',
    badgeStatus: 'default',
    description: 'Giao dịch đã được hoàn trả lại cho người mua.',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; badgeStatus: 'default' | 'success' | 'error' | 'warning' }> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: '#f59e0b',
    badgeStatus: 'warning',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: '#10b981',
    badgeStatus: 'success',
  },
  SUCCESS: {
    label: 'Thành công',
    color: '#10b981',
    badgeStatus: 'success',
  },
  FAILED: {
    label: 'Thất bại',
    color: '#ef4444',
    badgeStatus: 'error',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: '#64748b',
    badgeStatus: 'default',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: '#64748b',
    badgeStatus: 'default',
  },
};
