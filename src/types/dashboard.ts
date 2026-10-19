export type DashboardTimeRange = 'today' | '7d' | '30d' | '3m' | 'custom';

export interface DashboardSummary {
  totalOrders: number;
  revenueVnd: number;
  activeCustomers: number;
  modelsGenerated: number;
  reconstructionJobs: number;
  activePrintJobs: number;
  completedPrints: number;
  failedJobs: number;
  onlinePrinters: number;
  totalPrinters: number;
  materialUsageGram: number;

  // Comparison deltas against previous period
  ordersDeltaPct: number;
  revenueDeltaPct: number;
  customersDeltaPct: number;
  modelsDeltaPct: number;
  reconstructionDeltaPct: number;
  activePrintJobsDeltaPct: number;
  completedPrintsDeltaPct: number;
  failedJobsDeltaPct: number;
  materialUsageDeltaPct: number;

  // Sparkline data (last 7 points)
  ordersSparkline: number[];
  revenueSparkline: number[];
  customersSparkline: number[];
  modelsSparkline: number[];
  printJobsSparkline: number[];
}

export interface RevenueChartDataPoint {
  date: number; // Unix timestamp in ms
  dateLabel: string;
  revenue: number;
  orders: number;
  aov: number; // Average Order Value
}

export interface OrderStatusDataPoint {
  status: string;
  statusLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ReconstructionTierDataPoint {
  status: string;
  statusLabel: string;
  preview: number;
  highQuality: number;
  total: number;
}

export interface MaterialUsageDataPoint {
  material: string;
  materialType: string;
  usageGram: number;
  percentage: number;
  costVnd: number;
  color: string;
}

export type PrinterOperationalStatus =
  | 'OFFLINE'
  | 'IDLE'
  | 'PREPARING'
  | 'PRINTING'
  | 'PAUSED'
  | 'ERROR'
  | 'MAINTENANCE';

export interface PrinterFleetItem {
  id: string;
  name: string;
  model: string;
  serialNumber?: string;
  status: PrinterOperationalStatus;
  online: boolean;
  utilizationRate: number; // 0 - 100
  successRate: number; // 0 - 100
  jobsToday: number;
  completedJobsTotal: number;
  currentJobNumber?: string;
  currentMaterial?: string;
  nozzleTemp?: number;
  bedTemp?: number;
  lastSeenAt?: string;
}

export interface FleetMetrics {
  overallUtilization: number;
  successRate: number;
  failureRate: number;
  avgPrintMinutes: number;
  totalGramsUsed: number;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 'print_job' | 'order' | 'reconstruction' | 'printer' | 'inventory';
  title: string;
  description: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  referenceId?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  revenueSeries: RevenueChartDataPoint[];
  orderStatusSeries: OrderStatusDataPoint[];
  reconstructionSeries: ReconstructionTierDataPoint[];
  materialUsageSeries: MaterialUsageDataPoint[];
  printerFleet: PrinterFleetItem[];
  fleetMetrics: FleetMetrics;
  recentActivities: ActivityTimelineItem[];
  meta: {
    timeRange: DashboardTimeRange;
    lastUpdated: string;
    isRealTime: boolean;
    warehouseName?: string;
  };
}
