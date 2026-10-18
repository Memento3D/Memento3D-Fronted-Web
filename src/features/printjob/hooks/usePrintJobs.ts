import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printJobApi } from '../api/printJobApi';
import type {
  CreatePrintJobPayload,
  ReserveStockPayload,
  MaterialIssuePayload,
  ConsumptionReconciliationPayload,
  PrintJobListParams,
} from '../types/printJob.types';

export const usePrintJobs = (params?: PrintJobListParams) => {
  return useQuery({
    queryKey: ['print-jobs', params],
    queryFn: () => printJobApi.list(params),
  });
};

export const usePrintJobDetails = (id?: string) => {
  return useQuery({
    queryKey: ['print-job', id],
    queryFn: () => (id ? printJobApi.getById(id) : null),
    enabled: !!id,
  });
};

export const usePrintJobReservation = (id?: string) => {
  return useQuery({
    queryKey: ['print-job-reservation', id],
    queryFn: () => (id ? printJobApi.getReservation(id) : null),
    enabled: !!id,
    retry: false,
  });
};

export const usePrintJobConsumption = (id?: string) => {
  return useQuery({
    queryKey: ['print-job-consumption', id],
    queryFn: () => (id ? printJobApi.getConsumption(id) : null),
    enabled: !!id,
    retry: false,
  });
};

export const usePrintJobMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreatePrintJobPayload) => printJobApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => printJobApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReserveStockPayload }) =>
      printJobApi.reserveStock(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (id: string) => printJobApi.releaseReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
    },
  });

  const issueMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MaterialIssuePayload }) =>
      printJobApi.issueMaterial(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConsumptionReconciliationPayload }) =>
      printJobApi.reconcileConsumption(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
    },
  });

  return {
    createMutation,
    startMutation,
    reserveMutation,
    releaseMutation,
    issueMutation,
    reconcileMutation,
  };
};
