import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import { orderApi } from './orderApi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('orderApi.reviewFeasibility', () => {
  it('sends the required decision field for backend validation', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} } as never);

    await orderApi.reviewFeasibility('order-1', {
      decision: 'FEASIBLE',
      notes: 'Đủ điều kiện sản xuất.',
      finalPrice: 498500,
      estimatedDays: 3,
    });

    expect(post).toHaveBeenCalledWith(
      '/manager/orders/order-1/feasibility-review',
      {
        decision: 'FEASIBLE',
        notes: 'Đủ điều kiện sản xuất.',
        finalPrice: 498500,
        estimatedDays: 3,
      }
    );
  });
});
