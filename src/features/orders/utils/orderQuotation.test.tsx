import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import type { OrderResponse } from '../types/order.types';
import { hasPendingQuotation, isWorkshopOrder } from './orderQuotation';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const quoted = { id: 'order-1', status: 'PENDING', paymentStatus: 'PENDING', totalPrice: 400000,
  currency: 'VND', feasibilityStatus: 'FEASIBLE', feasibilityNotes: 'Đạt yêu cầu', estimatedProductionDays: 3,
  userId: 'user-1', recipientName: 'Khách', shippingAddress: 'Hồ Chí Minh', phone: '0901234567',
  updatedAt: '2026-11-06T00:00:00Z',
  createdAt: '2026-11-06T00:00:00Z', items: [{ id: 'item-1', productNameSnapshot: 'Kỷ vật',
    unitPrice: 400000, quantity: 1, subtotal: 400000, customization: { kind: 'CUSTOM_PRINT_V1' } }] } satisfies OrderResponse;

it('shows a clear quotation entry and blocks payment until the customer accepts, without requiring scanId', () => {
  expect(isWorkshopOrder(quoted)).toBe(true);
  expect(hasPendingQuotation(quoted)).toBe(true);
  const html = renderToStaticMarkup(<ThemeProvider><MemoryRouter><OrderSummaryCard order={quoted} onPay={() => {}} /></MemoryRouter></ThemeProvider>);
  expect(html).toContain('Xem &amp; duyệt báo giá');
  expect(html).toContain('Có báo giá mới');
  expect(html).not.toContain('Thanh toán ngay');
});

it('enables payment after acceptance and hides obsolete quotation actions on closed orders', () => {
  const accepted = { ...quoted, feasibilityStatus: 'ACCEPTED' as const };
  const html = renderToStaticMarkup(<ThemeProvider><MemoryRouter><OrderSummaryCard order={accepted} onPay={() => {}} /></MemoryRouter></ThemeProvider>);
  expect(html).toContain('Thanh toán ngay');
  expect(hasPendingQuotation({ ...quoted, status: 'CANCELLED' })).toBe(false);
  expect(isWorkshopOrder({ ...quoted, feasibilityStatus: 'PENDING_REVIEW', items: [] })).toBe(false);
});
