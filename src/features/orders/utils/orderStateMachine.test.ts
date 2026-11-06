import { describe, expect, it } from 'vitest';
import { getNextAllowedStatuses } from './orderStateMachine';

describe('getNextAllowedStatuses', () => {
  it('returns only the backend-supported immediate transitions', () => {
    expect(getNextAllowedStatuses('CONFIRMED', true)).toEqual(['PROCESSING', 'CANCELLED']);
    expect(getNextAllowedStatuses('PROCESSING', true)).toEqual(['PRINTING', 'CANCELLED']);
    expect(getNextAllowedStatuses('PRINTING', true)).toEqual(['READY', 'CANCELLED']);
  });

  it('keeps shipment as the preferred next step from READY', () => {
    expect(getNextAllowedStatuses('READY', true)).toEqual(['SHIPPED', 'COMPLETED', 'CANCELLED']);
  });

  it('does not expose manager transitions to customers', () => {
    expect(getNextAllowedStatuses('CONFIRMED', false)).toEqual([]);
  });

  it('does not expose transitions after a terminal order status', () => {
    expect(getNextAllowedStatuses('DELIVERED', true)).toEqual([]);
    expect(getNextAllowedStatuses('COMPLETED', true)).toEqual([]);
    expect(getNextAllowedStatuses('CANCELLED', true)).toEqual([]);
  });
});
