import { describe, it, expect, beforeEach } from 'vitest';
import { queryClient, clearAuthCache } from '../queryClient';
import { queryKeys } from '../queryKeys';

describe('queryClient defaults', () => {
  const retry = queryClient.getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown,
  ) => boolean;

  it('never retries mutations (prevents duplicate payments/checkouts)', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });

  it.each([401, 403, 404])('does not retry queries on HTTP %i', (status) => {
    expect(retry(0, { response: { status } })).toBe(false);
    expect(retry(0, { status })).toBe(false);
  });

  it('retries transient errors at most twice', () => {
    expect(retry(0, { response: { status: 500 } })).toBe(true);
    expect(retry(1, new Error('Network Error'))).toBe(true);
    expect(retry(2, new Error('Network Error'))).toBe(false);
  });
});

describe('clearAuthCache (logout / account switch isolation)', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('removes all cached private data', async () => {
    queryClient.setQueryData(queryKeys.admin.users({ page: 0 }), { content: [{ id: 'admin-secret' }] });
    queryClient.setQueryData(queryKeys.orders.list({ page: 0 }), { content: [{ id: 'customer-order' }] });
    expect(queryClient.getQueryCache().getAll().length).toBe(2);

    await clearAuthCache();

    expect(queryClient.getQueryCache().getAll().length).toBe(0);
    expect(queryClient.getQueryData(queryKeys.admin.users({ page: 0 }))).toBeUndefined();
  });

  it('cancels in-flight requests so a stale response cannot repopulate the cache', async () => {
    let aborted = false;
    const pending = queryClient
      .fetchQuery({
        queryKey: queryKeys.admin.users({ page: 1 }),
        queryFn: ({ signal }) =>
          new Promise((resolve) => {
            signal.addEventListener('abort', () => {
              aborted = true;
            });
            setTimeout(() => resolve('late-response'), 200);
          }),
      })
      .catch(() => undefined);

    await new Promise((r) => setTimeout(r, 10));
    await clearAuthCache();
    await pending;

    expect(aborted).toBe(true);
    expect(queryClient.getQueryData(queryKeys.admin.users({ page: 1 }))).toBeUndefined();
  });
});

describe('queryKeys', () => {
  it('users list keys are children of the usersAll prefix (invalidation matches)', () => {
    const key = queryKeys.admin.users({ page: 0, size: 10 });
    expect(key.slice(0, queryKeys.admin.usersAll.length)).toEqual([...queryKeys.admin.usersAll]);
  });

  it('different filters produce different keys', () => {
    expect(queryKeys.admin.orders({ page: 0 })).not.toEqual(queryKeys.admin.orders({ page: 1 }));
  });
});
