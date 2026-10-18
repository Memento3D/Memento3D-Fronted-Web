import { apiClient } from './apiClient';
import type { 
  PrintJob, 
  CreatePrintJobPayload, 
  PrintJobStatus, 
  StockReservation, 
  ReserveStockPayload, 
  MaterialIssuePayload, 
  ConsumptionReconciliationPayload, 
  PrintJobConsumption 
} from '../types/printJob';
import type { PageResponse } from './materialService';

export const printJobService = {
  async list(params?: {
    status?: PrintJobStatus;
    printerId?: string;
    materialId?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<PrintJob>> {
    const res = await apiClient.get<PageResponse<PrintJob>>('/print-jobs', { params });
    return res.data;
  },

  async create(payload: CreatePrintJobPayload): Promise<PrintJob> {
    const res = await apiClient.post<PrintJob>('/print-jobs', payload);
    return res.data;
  },

  async getById(id: string): Promise<PrintJob> {
    const res = await apiClient.get<PrintJob>(`/print-jobs/${id}`);
    return res.data;
  },

  async start(id: string): Promise<PrintJob> {
    const res = await apiClient.post<PrintJob>(`/print-jobs/${id}/start`);
    return res.data;
  },

  async reserveStock(id: string, payload: ReserveStockPayload): Promise<StockReservation> {
    const res = await apiClient.post<StockReservation>(`/print-jobs/${id}/reservations`, payload);
    return res.data;
  },

  async getReservation(id: string): Promise<StockReservation> {
    const res = await apiClient.get<StockReservation>(`/print-jobs/${id}/reservations`);
    return res.data;
  },

  async releaseReservation(id: string): Promise<void> {
    await apiClient.delete(`/print-jobs/${id}/reservations`);
  },

  async issueMaterial(id: string, payload: MaterialIssuePayload): Promise<PrintJobConsumption> {
    const res = await apiClient.post<PrintJobConsumption>(`/print-jobs/${id}/material-issues`, payload);
    return res.data;
  },

  async reconcileConsumption(id: string, payload: ConsumptionReconciliationPayload): Promise<PrintJobConsumption> {
    const res = await apiClient.post<PrintJobConsumption>(`/print-jobs/${id}/consumption-reconciliations`, payload);
    return res.data;
  },

  async getConsumption(id: string): Promise<PrintJobConsumption> {
    const res = await apiClient.get<PrintJobConsumption>(`/print-jobs/${id}/material-consumption`);
    return res.data;
  },
};
