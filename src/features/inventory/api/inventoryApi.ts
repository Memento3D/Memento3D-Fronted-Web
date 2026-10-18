import { apiClient } from '../../../services/apiClient';
import type {
  InventoryBalance,
  StockReceipt,
  CreateStockReceiptPayload,
  StockIssue,
  CreateStockIssuePayload,
  InventoryTransaction,
  InventoryBalanceParams,
  InventoryTransactionParams,
} from '../types/inventory.types';
import type { PageResponse } from '../../material/api/materialApi';

export const inventoryApi = {
  listBalances: async (params?: InventoryBalanceParams): Promise<PageResponse<InventoryBalance>> => {
    const res = await apiClient.get<PageResponse<InventoryBalance>>('/inventory/balances', { params });
    return res.data;
  },

  createReceipt: async (payload: CreateStockReceiptPayload): Promise<StockReceipt> => {
    const res = await apiClient.post<StockReceipt>('/inventory/receipts', payload);
    return res.data;
  },

  listReceipts: async (params?: { warehouseId?: string; materialId?: string; page?: number; limit?: number }): Promise<PageResponse<StockReceipt>> => {
    const res = await apiClient.get<PageResponse<StockReceipt>>('/inventory/receipts', { params });
    return res.data;
  },

  createIssue: async (payload: CreateStockIssuePayload): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>('/inventory/issues', payload);
    return res.data;
  },

  listIssues: async (params?: { warehouseId?: string; materialId?: string; page?: number; limit?: number }): Promise<PageResponse<StockIssue>> => {
    const res = await apiClient.get<PageResponse<StockIssue>>('/inventory/issues', { params });
    return res.data;
  },

  listTransactions: async (params?: InventoryTransactionParams): Promise<PageResponse<InventoryTransaction>> => {
    const res = await apiClient.get<PageResponse<InventoryTransaction>>('/inventory/transactions', { params });
    return res.data;
  },
};
