export type InventoryTransactionType = 
  | 'RECEIPT'
  | 'ISSUE'
  | 'RESERVATION_HOLD'
  | 'RESERVATION_RELEASE'
  | 'PRINT_ISSUE'
  | 'PRINT_RETURN';

export interface InventoryBalance {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  materialColor: string;
  materialType: string;
  onHandGram: number;
  reservedGram: number;
  availableGram: number;
  updatedAt: string;
}

export interface StockReceipt {
  id: string;
  receiptNumber: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  quantityGram: number;
  unitCost: number;
  supplier?: string;
  batchNumber?: string;
  idempotencyKey: string;
  note?: string;
  receivedBy?: string;
  createdAt: string;
}

export interface CreateStockReceiptPayload {
  warehouseId: string;
  materialId: string;
  quantityGram: number;
  unitCost: number;
  supplier?: string;
  batchNumber?: string;
  idempotencyKey: string;
  note?: string;
}

export interface StockIssue {
  id: string;
  issueNumber: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  quantityGram: number;
  reason: string;
  idempotencyKey: string;
  note?: string;
  issuedBy?: string;
  createdAt: string;
}

export interface CreateStockIssuePayload {
  warehouseId: string;
  materialId: string;
  quantityGram: number;
  reason: string;
  idempotencyKey: string;
  note?: string;
}

export interface InventoryTransaction {
  id: string;
  transactionType: InventoryTransactionType;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  deltaOnHandGram: number;
  deltaReservedGram: number;
  beforeOnHandGram: number;
  afterOnHandGram: number;
  beforeReservedGram: number;
  afterReservedGram: number;
  printJobId?: string;
  referenceId?: string;
  idempotencyKey?: string;
  performedBy?: string;
  createdAt: string;
}
