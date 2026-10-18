export type PrintJobStatus =
  | 'CREATED'
  | 'RESERVED'
  | 'ISSUED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface PrintJob {
  id: string;
  jobNumber: string;
  orderId?: string;
  printerId?: string;
  printerName?: string;
  printerModel?: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  materialColor: string;
  status: PrintJobStatus;
  estimatedGram: number;
  estimatedDurationSeconds?: number;
  startedAt?: string;
  endedAt?: string;
  failureReason?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreatePrintJobPayload {
  orderId?: string;
  printerId?: string;
  materialId: string;
  estimatedGram: number;
  estimatedDurationSeconds?: number;
}

export interface StockReservation {
  id: string;
  printJobId: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  reservedGram: number;
  status: string;
  createdAt: string;
}

export interface ReserveStockPayload {
  warehouseId: string;
  reservedGram: number;
}

export interface MaterialIssuePayload {
  warehouseId: string;
  issuedGram: number;
  note?: string;
}

export interface ConsumptionReconciliationPayload {
  usedGram: number;
  wasteGram: number;
  returnedGram: number;
  note?: string;
}

export interface PrintJobConsumption {
  id: string;
  printJobId: string;
  warehouseId: string;
  materialId: string;
  issuedGram: number;
  usedGram: number;
  wasteGram: number;
  returnedGram: number;
  status: string;
  note?: string;
  createdAt: string;
}

export interface PrintJobListParams {
  status?: PrintJobStatus;
  printerId?: string;
  materialId?: string;
  page?: number;
  limit?: number;
}
