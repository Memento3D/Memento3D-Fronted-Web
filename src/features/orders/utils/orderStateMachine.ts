import type { OrderStatus } from '../types/order.types';

export const canCustomerCancel = (status: OrderStatus): boolean => {
  return status === 'PENDING' || status === 'PENDING_PAYMENT';
};

export const getNextAllowedStatuses = (currentStatus: OrderStatus, isStaff: boolean): OrderStatus[] => {
  if (!isStaff) return [];

  switch (currentStatus) {
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return ['CONFIRMED', 'CANCELLED'];
    case 'CONFIRMED':
      return ['PROCESSING', 'PRINTING', 'CANCELLED'];
    case 'PROCESSING':
      return ['PRINTING', 'READY', 'CANCELLED'];
    case 'PRINTING':
      return ['READY', 'SHIPPED', 'CANCELLED'];
    case 'READY':
      return ['COMPLETED', 'SHIPPED'];
    case 'SHIPPED':
      return ['DELIVERED', 'COMPLETED'];
    case 'DELIVERED':
    case 'COMPLETED':
      return ['REFUNDED'];
    case 'CANCELLED':
    case 'REFUNDED':
    default:
      return [];
  }
};

export const getStatusStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING':
    case 'PENDING_PAYMENT':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PROCESSING':
    case 'PRINTING':
      return 2;
    case 'READY':
    case 'SHIPPED':
      return 3;
    case 'COMPLETED':
    case 'DELIVERED':
      return 4;
    case 'CANCELLED':
    case 'REFUNDED':
      return -1;
    default:
      return 0;
  }
};
