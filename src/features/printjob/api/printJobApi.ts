import { apiClient } from '../../../services/apiClient';
import type {
  PrintJob,
  CreatePrintJobPayload,
  StockReservation,
  ReserveStockPayload,
  MaterialIssuePayload,
  ConsumptionReconciliationPayload,
  PrintJobConsumption,
  PrintJobListParams,
} from '../types/printJob.types';
import type { PageResponse } from '../../material/api/materialApi';

export const printJobApi = {
  list: async (params?: PrintJobListParams): Promise<PageResponse<PrintJob>> => {
    const res = await apiClient.get<PageResponse<PrintJob>>('/print-jobs', { params });
    return res.data;
  },

  getById: async (id: string): Promise<PrintJob> => {
    const res = await apiClient.get<PrintJob>(`/print-jobs/${id}`);
    return res.data;
  },

  create: async (payload: CreatePrintJobPayload): Promise<PrintJob> => {
    const res = await apiClient.post<PrintJob>('/print-jobs', payload);
    return res.data;
  },

  start: async (id: string): Promise<PrintJob> => {
    const res = await apiClient.post<PrintJob>(`/print-jobs/${id}/start`);
    return res.data;
  },

  reserveStock: async (id: string, payload: ReserveStockPayload): Promise<StockReservation> => {
    const res = await apiClient.post<StockReservation>(`/print-jobs/${id}/reservations`, payload);
    return res.data;
  },

  getReservation: async (id: string): Promise<StockReservation> => {
    const res = await apiClient.get<StockReservation>(`/print-jobs/${id}/reservations`);
    return res.data;
  },

  releaseReservation: async (id: string): Promise<void> => {
    await apiClient.delete(`/print-jobs/${id}/reservations`);
  },

  issueMaterial: async (id: string, payload: MaterialIssuePayload): Promise<PrintJobConsumption> => {
    const res = await apiClient.post<PrintJobConsumption>(`/print-jobs/${id}/material-issues`, payload);
    return res.data;
  },

  reconcileConsumption: async (id: string, payload: ConsumptionReconciliationPayload): Promise<PrintJobConsumption> => {
    const res = await apiClient.post<PrintJobConsumption>(`/print-jobs/${id}/consumption-reconciliations`, payload);
    return res.data;
  },

  getConsumption: async (id: string): Promise<PrintJobConsumption> => {
    const res = await apiClient.get<PrintJobConsumption>(`/print-jobs/${id}/material-consumption`);
    return res.data;
  },
};
