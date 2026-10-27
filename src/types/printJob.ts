export type PrintJobStatus = 
  | 'CREATED'
  | 'RESERVED'
  | 'ISSUED'
  | 'PENDING_MODEL_PREPARATION'
  | 'AWAITING_SLICING'
  | 'READY_FOR_PRINTING'
  | 'PRINTING'
  | 'POST_PROCESSING'
  | 'SURFACE_FINISHING'
  | 'QC_INSPECTION'
  | 'READY_FOR_DELIVERY'
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
  warehouseCode: string;
  materialId: string;
  materialSku: string;
  materialName: string;
  issuedGram: number;
  usedGram: number;
  wasteGram: number;
  returnedGram: number;
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  note?: string;
  createdAt: string;
}

export type ResinHandoffMethod = 'USB_MANUAL' | 'CHITU_MANAGER_LAN_MANUAL';

export interface ResinProductionJobResponse {
  printJobId: string;
  orderId: string;
  orderNumber?: string;
  orderItemId: string;
  jobStatus: PrintJobStatus;
  targetMachineModel: string;
  sourceGlbAssetUrl?: string;
  productionStlAssetUrl?: string;
  sliceFileArtifactUrl?: string;
  sliceFileFormat?: string;
  targetDimX?: number;
  targetDimY?: number;
  targetDimZ?: number;
  isWatertight?: boolean;
  isHollowed?: boolean;
  hasDrainHoles?: boolean;
  chituboxVersion?: string;
  machineProfile?: string;
  resinType?: string;
  resinColor?: string;
  isCustomPainted?: boolean;
  estimatedResinMl?: number;
  estimatedPrintTimeSeconds?: number;
  handoffMethod?: ResinHandoffMethod;
  handoffAt?: string;
  handoffNotes?: string;
  isWashed?: boolean;
  isSupportsRemoved?: boolean;
  isUvCured?: boolean;
  qcPassed?: boolean;
  qcNotes?: string;
  failureReason?: string;
  failurePhotoUrl?: string;
  reprintOfJobId?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrepareResinProductionPayload {
  targetDimX: number;
  targetDimY: number;
  targetDimZ: number;
  isWatertight?: boolean;
  isHollowed?: boolean;
  hasDrainHoles?: boolean;
  notes?: string;
}

export interface RecordSlicingPayload {
  chituboxVersion: string;
  machineProfile: string;
  resinType: string;
  resinColor: string;
  isCustomPainted?: boolean;
  sliceFileFormat: 'goo' | 'ctb';
  sliceFileArtifactUrl: string;
  slicePreviewImageUrl?: string;
  estimatedResinMl: number;
  estimatedPrintTimeSeconds: number;
  notes?: string;
}

export interface ConfirmHandoffPayload {
  handoffMethod: ResinHandoffMethod;
  notes?: string;
}

export interface PostProcessingChecklistPayload {
  washed: boolean;
  supportsRemoved: boolean;
  uvCured: boolean;
  customPainted?: boolean;
  notes?: string;
  targetStatus?: PrintJobStatus;
}

export interface RecordQcResultPayload {
  passed: boolean;
  notes?: string;
  failureReason?: string;
  failurePhotoUrl?: string;
}
