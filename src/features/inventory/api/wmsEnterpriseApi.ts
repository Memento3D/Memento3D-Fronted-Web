import { apiClient } from '../../../services/apiClient';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Goods Receipts
export type GoodsReceiptStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface GoodsReceiptItem {
  id?: string;
  materialId: string;
  materialSku?: string;
  materialName?: string;
  quantity: number;
  unitCost?: number;
  batchNumber?: string;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptCode: string;
  warehouseId: string;
  warehouseName?: string;
  supplierName?: string;
  referenceNumber?: string;
  status: GoodsReceiptStatus;
  notes?: string;
  submittedBy?: string;
  approvedBy?: string;
  completedAt?: string;
  createdAt: string;
  items: GoodsReceiptItem[];
}

export interface CreateGoodsReceiptPayload {
  warehouseId: string;
  supplierName?: string;
  referenceNumber?: string;
  notes?: string;
  items: Array<{
    materialId: string;
    quantity: number;
    unitCost?: number;
    batchNumber?: string;
    notes?: string;
  }>;
}

// Stock Issues
export type StockIssueStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface StockIssueItem {
  id?: string;
  materialId: string;
  materialSku?: string;
  materialName?: string;
  requestedQuantity: number;
  issuedQuantity: number;
  notes?: string;
}

export interface StockIssue {
  id: string;
  issueCode: string;
  warehouseId: string;
  warehouseName?: string;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  status: StockIssueStatus;
  submittedBy?: string;
  approvedBy?: string;
  completedAt?: string;
  createdAt: string;
  items: StockIssueItem[];
}

export interface CreateStockIssuePayload {
  warehouseId: string;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  items: Array<{
    materialId: string;
    requestedQuantity: number;
    notes?: string;
  }>;
}

// Warehouse Transfers
export type WarehouseTransferStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface WarehouseTransferItem {
  id?: string;
  materialId: string;
  materialSku?: string;
  materialName?: string;
  quantity: number;
  notes?: string;
}

export interface WarehouseTransfer {
  id: string;
  transferCode: string;
  sourceWarehouseId: string;
  sourceWarehouseName?: string;
  destinationWarehouseId: string;
  destinationWarehouseName?: string;
  status: WarehouseTransferStatus;
  notes?: string;
  submittedBy?: string;
  approvedBy?: string;
  shippedAt?: string;
  receivedAt?: string;
  createdAt: string;
  items: WarehouseTransferItem[];
}

export interface CreateWarehouseTransferPayload {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  notes?: string;
  items: Array<{
    materialId: string;
    quantity: number;
    notes?: string;
  }>;
}

// Stock Adjustments
export type StockAdjustmentStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELLED';

export interface StockAdjustment {
  id: string;
  adjustmentCode: string;
  warehouseId: string;
  warehouseName?: string;
  materialId: string;
  materialSku?: string;
  materialName?: string;
  currentQuantity: number;
  actualQuantity: number;
  difference: number;
  reason: string;
  evidence?: string;
  status: StockAdjustmentStatus;
  submittedBy?: string;
  approvedBy?: string;
  appliedAt?: string;
  createdAt: string;
}

export interface CreateStockAdjustmentPayload {
  warehouseId: string;
  materialId: string;
  actualQuantity: number;
  reason: string;
  evidence?: string;
}

// Stock Counts
export type StockCountStatus = 'DRAFT' | 'COUNTING' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface StockCountItem {
  id?: string;
  materialId: string;
  materialSku?: string;
  materialName?: string;
  systemQuantity: number;
  countedQuantity?: number;
  variance?: number;
  notes?: string;
}

export interface StockCount {
  id: string;
  countCode: string;
  warehouseId: string;
  warehouseName?: string;
  status: StockCountStatus;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  items: StockCountItem[];
}

export interface CreateStockCountPayload {
  warehouseId: string;
  notes?: string;
  materialIds?: string[];
}

// Manager Dashboard Metrics
export interface ManagerDashboardData {
  totalWarehouses: number;
  totalMaterials: number;
  totalInventoryItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingGoodsReceipts: number;
  pendingStockIssues: number;
  pendingAdjustments: number;
  pendingTransfers: number;
  recentStockMovements: Array<{
    id: string;
    warehouseName: string;
    materialSku: string;
    materialName: string;
    movementType: string;
    quantity: number;
    quantityBefore: number;
    quantityAfter: number;
    createdAt: string;
    reason?: string;
  }>;
}

// Admin Dashboard & Audit Logs
export interface AdminDashboardData {
  totalUsers: number;
  totalManagers: number;
  totalWarehouseStaff: number;
  totalWarehouses: number;
  totalMaterials: number;
  pendingApprovals: number;
  lowStockCount: number;
  recentMovementsCount: number;
  recentAuditLogs: Array<{
    id: string;
    actorEmail: string;
    action: string;
    entityType: string;
    entityId?: string;
    createdAt: string;
  }>;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  assignedWarehouseIds?: string[];
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeData?: string;
  afterData?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const wmsEnterpriseApi = {
  // --- GOODS RECEIPTS ---
  getGoodsReceipts: async (params?: { warehouseId?: string; status?: string; page?: number; size?: number }): Promise<PageResponse<GoodsReceipt>> => {
    const res = await apiClient.get<PageResponse<GoodsReceipt>>('/goods-receipts', { params });
    return res.data;
  },
  getGoodsReceiptById: async (id: string): Promise<GoodsReceipt> => {
    const res = await apiClient.get<GoodsReceipt>(`/goods-receipts/${id}`);
    return res.data;
  },
  createGoodsReceipt: async (payload: CreateGoodsReceiptPayload): Promise<GoodsReceipt> => {
    const res = await apiClient.post<GoodsReceipt>('/goods-receipts', payload);
    return res.data;
  },
  submitGoodsReceipt: async (id: string): Promise<GoodsReceipt> => {
    const res = await apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/submit`);
    return res.data;
  },
  approveGoodsReceipt: async (id: string): Promise<GoodsReceipt> => {
    const res = await apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/approve`);
    return res.data;
  },
  completeGoodsReceipt: async (id: string): Promise<GoodsReceipt> => {
    const res = await apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/complete`);
    return res.data;
  },
  cancelGoodsReceipt: async (id: string): Promise<GoodsReceipt> => {
    const res = await apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/cancel`);
    return res.data;
  },

  // --- STOCK ISSUES ---
  getStockIssues: async (params?: { warehouseId?: string; status?: string; page?: number; size?: number }): Promise<PageResponse<StockIssue>> => {
    const res = await apiClient.get<PageResponse<StockIssue>>('/stock-issues', { params });
    return res.data;
  },
  getStockIssueById: async (id: string): Promise<StockIssue> => {
    const res = await apiClient.get<StockIssue>(`/stock-issues/${id}`);
    return res.data;
  },
  createStockIssue: async (payload: CreateStockIssuePayload): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>('/stock-issues', payload);
    return res.data;
  },
  submitStockIssue: async (id: string): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>(`/stock-issues/${id}/submit`);
    return res.data;
  },
  approveStockIssue: async (id: string): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>(`/stock-issues/${id}/approve`);
    return res.data;
  },
  completeStockIssue: async (id: string): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>(`/stock-issues/${id}/complete`);
    return res.data;
  },
  cancelStockIssue: async (id: string): Promise<StockIssue> => {
    const res = await apiClient.post<StockIssue>(`/stock-issues/${id}/cancel`);
    return res.data;
  },

  // --- WAREHOUSE TRANSFERS ---
  getTransfers: async (params?: { warehouseId?: string; status?: string; page?: number; size?: number }): Promise<PageResponse<WarehouseTransfer>> => {
    const res = await apiClient.get<PageResponse<WarehouseTransfer>>('/warehouse-transfers', { params });
    return res.data;
  },
  getTransferById: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.get<WarehouseTransfer>(`/warehouse-transfers/${id}`);
    return res.data;
  },
  createTransfer: async (payload: CreateWarehouseTransferPayload): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>('/warehouse-transfers', payload);
    return res.data;
  },
  submitTransfer: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>(`/warehouse-transfers/${id}/submit`);
    return res.data;
  },
  approveTransfer: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>(`/warehouse-transfers/${id}/approve`);
    return res.data;
  },
  shipTransfer: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>(`/warehouse-transfers/${id}/ship`);
    return res.data;
  },
  receiveTransfer: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>(`/warehouse-transfers/${id}/receive`);
    return res.data;
  },
  cancelTransfer: async (id: string): Promise<WarehouseTransfer> => {
    const res = await apiClient.post<WarehouseTransfer>(`/warehouse-transfers/${id}/cancel`);
    return res.data;
  },

  // --- STOCK ADJUSTMENTS ---
  getAdjustments: async (params?: { warehouseId?: string; status?: string; page?: number; size?: number }): Promise<PageResponse<StockAdjustment>> => {
    const res = await apiClient.get<PageResponse<StockAdjustment>>('/stock-adjustments', { params });
    return res.data;
  },
  createAdjustment: async (payload: CreateStockAdjustmentPayload): Promise<StockAdjustment> => {
    const res = await apiClient.post<StockAdjustment>('/stock-adjustments', payload);
    return res.data;
  },
  submitAdjustment: async (id: string): Promise<StockAdjustment> => {
    const res = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/submit`);
    return res.data;
  },
  approveAdjustment: async (id: string): Promise<StockAdjustment> => {
    const res = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/approve`);
    return res.data;
  },
  rejectAdjustment: async (id: string, reason?: string): Promise<StockAdjustment> => {
    const res = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/reject`, null, { params: { reason } });
    return res.data;
  },
  applyAdjustment: async (id: string): Promise<StockAdjustment> => {
    const res = await apiClient.post<StockAdjustment>(`/stock-adjustments/${id}/apply`);
    return res.data;
  },

  // --- STOCK COUNTS ---
  getStockCounts: async (params?: { warehouseId?: string; status?: string; page?: number; size?: number }): Promise<PageResponse<StockCount>> => {
    const res = await apiClient.get<PageResponse<StockCount>>('/stock-counts', { params });
    return res.data;
  },
  getStockCountById: async (id: string): Promise<StockCount> => {
    const res = await apiClient.get<StockCount>(`/stock-counts/${id}`);
    return res.data;
  },
  createStockCount: async (payload: CreateStockCountPayload): Promise<StockCount> => {
    const res = await apiClient.post<StockCount>('/stock-counts', payload);
    return res.data;
  },
  startStockCount: async (id: string): Promise<StockCount> => {
    const res = await apiClient.post<StockCount>(`/stock-counts/${id}/start`);
    return res.data;
  },
  updateCountItems: async (id: string, items: Array<{ materialId: string; countedQuantity: number; notes?: string }>): Promise<StockCount> => {
    const res = await apiClient.put<StockCount>(`/stock-counts/${id}/items`, items);
    return res.data;
  },
  completeStockCount: async (id: string): Promise<StockCount> => {
    const res = await apiClient.post<StockCount>(`/stock-counts/${id}/complete`);
    return res.data;
  },

  // --- MANAGER DASHBOARD ---
  getManagerDashboard: async (warehouseId?: string): Promise<ManagerDashboardData> => {
    const res = await apiClient.get<ManagerDashboardData>('/manager/dashboard', { params: { warehouseId } });
    return res.data;
  },

  // --- ADMIN OPERATIONS ---
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const res = await apiClient.get<AdminDashboardData>('/admin/dashboard');
    return res.data;
  },
  getUsers: async (params?: { search?: string; role?: string; page?: number; size?: number }): Promise<PageResponse<UserSummary>> => {
    const res = await apiClient.get<PageResponse<UserSummary>>('/admin/users', { params });
    return res.data;
  },
  updateUserRole: async (userId: string, role: string): Promise<UserSummary> => {
    const res = await apiClient.patch<UserSummary>(`/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },
  updateUserStatus: async (userId: string, active: boolean): Promise<UserSummary> => {
    const res = await apiClient.patch<UserSummary>(`/admin/users/${userId}/status`, null, { params: { active } });
    return res.data;
  },
  assignWarehouses: async (userId: string, warehouseIds: string[]): Promise<UserSummary> => {
    const res = await apiClient.put<UserSummary>(`/admin/users/${userId}/warehouse-assignments`, warehouseIds);
    return res.data;
  },
  getAuditLogs: async (params?: { page?: number; size?: number }): Promise<PageResponse<AuditLogItem>> => {
    const res = await apiClient.get<PageResponse<AuditLogItem>>('/admin/audit-logs', { params });
    return res.data;
  },
};
