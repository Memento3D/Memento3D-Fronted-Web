import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboardApi';
import type { DashboardData, DashboardTimeRange } from '../types/dashboard';
import { useRealTime } from '../shared/realtime/RealTimeContext';
import { useEventSubscription } from '../shared/realtime/useEventSubscription';

export interface UseDashboardOptions {
  timeRange?: DashboardTimeRange;
  warehouseId?: string;
  autoRefreshIntervalMs?: number;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const { timeRange = '30d', warehouseId, autoRefreshIntervalMs = 20000 } = options;
  const queryClient = useQueryClient();
  const { connectionStatus } = useRealTime();

  const queryKey = ['production-dashboard', timeRange, warehouseId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<DashboardData>({
    queryKey,
    queryFn: () => dashboardApi.getDashboardData(timeRange, warehouseId),
    refetchInterval: autoRefreshIntervalMs,
    staleTime: 10000,
  });

  const handleRealTimeInvalidation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['production-dashboard'] });
  }, [queryClient]);

  // Hook into live SSE/WebSocket events
  useEventSubscription('PRINT_JOB_UPDATED', handleRealTimeInvalidation);
  useEventSubscription('PRINTER_STATUS_CHANGED', handleRealTimeInvalidation);
  useEventSubscription('ORDER_STATUS_CHANGED', handleRealTimeInvalidation);
  useEventSubscription('RECONSTRUCTION_PROGRESS', handleRealTimeInvalidation);
  useEventSubscription('RECONSTRUCTION_UPDATED', handleRealTimeInvalidation);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isRealTimeConnected: connectionStatus === 'CONNECTED',
  };
};
