import type { OrderStatus } from '../types/order.types';

export const canCustomerCancel = (status: OrderStatus): boolean => {
  return status === 'PENDING_PAYMENT';
};

export const getNextAllowedStatuses = (currentStatus: OrderStatus, isStaff: boolean): OrderStatus[] => {
  if (!isStaff) return [];

  switch (currentStatus) {
    case 'PENDING_PAYMENT':
      return ['CONFIRMED', 'CANCELLED'];
    case 'CONFIRMED':
      return ['PRINTING', 'CANCELLED'];
    case 'PRINTING':
      return ['SHIPPED', 'CANCELLED'];
    case 'SHIPPED':
      return ['DELIVERED'];
    case 'DELIVERED':
      return ['REFUNDED'];
    case 'CANCELLED':
    case 'REFUNDED':
    default:
      return [];
  }
};

export const getStatusStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PRINTING':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    case 'CANCELLED':
    case 'REFUNDED':
      return -1;
    default:
      return 0;
  }
};
