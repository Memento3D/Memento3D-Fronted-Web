import type { OrderResponse } from '../types/order.types';

export const isWorkshopOrder = (order: OrderResponse): boolean =>
  Boolean(order.scanId || order.reviewedAt || order.customerAcceptedAt ||
    order.items?.some(item => item.customization?.kind === 'CUSTOM_PRINT_V1' || item.customizationSnapshot?.kind === 'CUSTOM_PRINT_V1') ||
    ['FEASIBLE', 'ACCEPTED', 'REVISION_REQUESTED', 'REJECTED'].includes(order.feasibilityStatus ?? ''));

export const hasPendingQuotation = (order: OrderResponse): boolean =>
  isWorkshopOrder(order) && order.feasibilityStatus === 'FEASIBLE' && !order.customerAcceptedAt &&
  !['CANCELLED', 'COMPLETED', 'REFUNDED', 'DELIVERED'].includes(order.status) &&
  !['PAID', 'SUCCESS'].includes(order.paymentStatus ?? '');

export const hasAcceptedQuotation = (order: OrderResponse): boolean =>
  order.feasibilityStatus === 'ACCEPTED' || Boolean(order.customerAcceptedAt);
