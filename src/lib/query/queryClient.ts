import { QueryClient } from '@tanstack/react-query';

/**
 * Standardized QueryClient for Memento3D TanStack Ecosystem.
 * Configured with resilient caching, smart error rejection, and strict session isolation.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry on authorization, authentication, or missing resources
        const status = error?.response?.status || error?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 60 * 1000, // 1 minute default stale time to eliminate redundant refetches
      gcTime: 5 * 60 * 1000, // Keep inactive cache for 5 minutes
    },
    mutations: {
      retry: 0, // Never retry mutations automatically (avoids duplicate submissions/payments)
    },
  },
});

/**
 * Clear all private cache data and cancel in-flight queries upon logout or session expiry.
 * Strictly prevents cross-account data leakage between Admin, Manager, Provider, Driver, and Customer.
 */
export const clearAuthCache = async (): Promise<void> => {
  try {
    await queryClient.cancelQueries();
  } catch (err) {
    console.warn('[QueryClient] Error cancelling active queries during logout:', err);
  } finally {
    queryClient.clear();
  }
};
