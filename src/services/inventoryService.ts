import { apiClient } from './apiClient';
import type { 
  InventoryBalance, 
  StockReceipt, 
  CreateStockReceiptPayload, 
  StockIssue, 
  CreateStockIssuePayload, 
  InventoryTransaction,
  InventoryTransactionType
} from '../types/inventory';
import type { PageResponse } from './materialService';

export const inventoryService = {
  async listBalances(params?: {
    warehouseId?: string;
    materialId?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<InventoryBalance>> {
    const res = await apiClient.get<PageResponse<InventoryBalance>>('/inventory/balances', { params });
    return res.data;
  },

  async createReceipt(payload: CreateStockReceiptPayload): Promise<StockReceipt> {
    const res = await apiClient.post<StockReceipt>('/inventory/receipts', payload);
    return res.data;
  },

  async listReceipts(params?: {
    warehouseId?: string;
    materialId?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<StockReceipt>> {
    const res = await apiClient.get<PageResponse<StockReceipt>>('/inventory/receipts', { params });
    return res.data;
  },

  async createIssue(payload: CreateStockIssuePayload): Promise<StockIssue> {
    const res = await apiClient.post<StockIssue>('/inventory/issues', payload);
    return res.data;
  },

  async listIssues(params?: {
    warehouseId?: string;
    materialId?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<StockIssue>> {
    const res = await apiClient.get<PageResponse<StockIssue>>('/inventory/issues', { params });
    return res.data;
  },

  async listTransactions(params?: {
    warehouseId?: string;
    materialId?: string;
    type?: InventoryTransactionType;
    printJobId?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<InventoryTransaction>> {
    const res = await apiClient.get<PageResponse<InventoryTransaction>>('/inventory/transactions', { params });
    return res.data;
  },
};
