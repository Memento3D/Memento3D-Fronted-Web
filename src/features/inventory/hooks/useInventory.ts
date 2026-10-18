import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type {
  CreateStockReceiptPayload,
  CreateStockIssuePayload,
  InventoryBalanceParams,
  InventoryTransactionParams,
} from '../types/inventory.types';

export const useInventoryBalances = (params?: InventoryBalanceParams) => {
  return useQuery({
    queryKey: ['inventory-balances', params],
    queryFn: () => inventoryApi.listBalances(params),
  });
};

export const useStockReceipts = (params?: { warehouseId?: string; materialId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['stock-receipts', params],
    queryFn: () => inventoryApi.listReceipts(params),
  });
};

export const useStockIssues = (params?: { warehouseId?: string; materialId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['stock-issues', params],
    queryFn: () => inventoryApi.listIssues(params),
  });
};

export const useInventoryTransactions = (params?: InventoryTransactionParams) => {
  return useQuery({
    queryKey: ['inventory-transactions', params],
    queryFn: () => inventoryApi.listTransactions(params),
  });
};

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();

  const receiptMutation = useMutation({
    mutationFn: (payload: CreateStockReceiptPayload) => inventoryApi.createReceipt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
  });

  const issueMutation = useMutation({
    mutationFn: (payload: CreateStockIssuePayload) => inventoryApi.createIssue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
  });

  return { receiptMutation, issueMutation };
};
