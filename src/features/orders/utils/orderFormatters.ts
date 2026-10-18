import dayjs from 'dayjs';
import type { OrderStatus, PaymentStatus } from '../types/order.types';

export const formatCurrency = (amount: number | string | undefined | null, currency = 'VND'): string => {
  if (amount === undefined || amount === null) return '0 ₫';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0 ₫';

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toLocaleString('vi-VN')} ${currency}`;
  }
};

export const formatOrderDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('DD/MM/YYYY HH:mm');
};

export const formatRelativeTime = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

export interface StatusMeta {
  label: string;
  color: string;
  textColor?: string;
  badgeStatus: 'default' | 'success' | 'processing' | 'error' | 'warning';
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusMeta> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    color: '#f59e0b',
    badgeStatus: 'warning',
    description: 'Đơn hàng đã khởi tạo, đang chờ khách hàng thanh toán qua MoMo hoặc ZaloPay.',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: '#06b6d4',
    badgeStatus: 'processing',
    description: 'Thanh toán thành công. Đơn hàng đang được xếp lịch chuẩn bị sản xuất in 3D.',
  },
  PRINTING: {
    label: 'Đang in 3D',
    color: '#8b5cf6',
    badgeStatus: 'processing',
    description: 'Xưởng in đang vận hành máy in 3D đùn sợi/resin để chế tác vật phẩm.',
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
};
