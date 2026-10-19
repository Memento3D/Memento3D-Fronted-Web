export type RealTimeEventType =
  | 'RECONSTRUCTION_PROGRESS'
  | 'RECONSTRUCTION_UPDATED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'ORDER_STATUS_CHANGED'
  | 'MODEL_APPROVAL_REQUIRED'
  | 'MODEL_APPROVED'
  | 'MODEL_REVISION_COMPLETED'
  | 'PRINT_JOB_UPDATED'
  | 'PRINTER_STATUS_CHANGED'
  | 'QC_STATUS_CHANGED'
  | 'NOTIFICATION_CREATED'
  | string;

export interface RealTimeEvent<T = Record<string, any>> {
  eventId: string;
  type: RealTimeEventType;
  resourceType: string;
  resourceId: string;
  targetUserId?: string | null;
  occurredAt: string;
  data: T;
}

export interface ReconstructionProgressData {
  jobId: string;
  stage?: string;
  progress: number;
  scanId?: string;
  status?: string;
  previewUrl?: string;
}

export interface PaymentStatusData {
  paymentId: string;
  orderId: string;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  amount?: number;
  currency?: string;
  failureReason?: string;
}

export interface OrderStatusData {
  orderId: string;
  status: string;
  oldStatus?: string;
  trackingNumber?: string;
  assignedWarehouseId?: string;
  reason?: string;
}

export interface ModelReviewData {
  jobId: string;
  orderItemId?: string;
  orderId?: string;
  userId?: string;
  modelUrl?: string;
  previewUrl?: string;
  sha256?: string;
  action?: 'APPROVED' | 'REVISION_REQUESTED';
  feedback?: string;
}

export interface PrintJobData {
  jobId: string;
  jobNumber: string;
  orderId?: string;
  status: string;
  progress?: number;
  printerId?: string;
  printerName?: string;
}

export interface NotificationData {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string | null;
  referenceType?: string | null;
  createdAt: string;
}

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';
