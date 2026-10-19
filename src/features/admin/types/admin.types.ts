export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminUserStats {
  total: number;
  active: number;
  inactive: number;
  locked: number;
  newToday: number;
  newThisMonth: number;
}

export interface AdminOrderStats {
  total: number;
  ordersToday: number;
  pending: number;
  processing: number;
  printing: number;
  completed: number;
  cancelled: number;
}

export interface AdminRevenueStats {
  today: number;
  thisMonth: number;
  total: number;
  averageOrderValue: number;
}

export interface AdminCatalogStats {
  totalProducts: number;
  totalCategories: number;
}

export interface AdminReconstructionStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  previewJobs: number;
  premiumJobs: number;
}

export interface AdminPrinterStats {
  total: number;
  printersOnline: number;
  printersOffline: number;
}

export interface AdminDashboardSummary {
  users: AdminUserStats;
  orders: AdminOrderStats;
  revenue: AdminRevenueStats;
  catalog: AdminCatalogStats;
  reconstruction: AdminReconstructionStats;
  printers: AdminPrinterStats;
  systemHealth: Record<string, string>;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface AdminRevenueTrend {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  dataPoints: RevenueDataPoint[];
}

export interface UserGrowthDataPoint {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface AdminUserGrowth {
  period: string;
  newUsersCount: number;
  dataPoints: UserGrowthDataPoint[];
}

export interface CategoryPerformanceItem {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  revenue: number;
}

export interface AdminCategoryPerformance {
  categories: CategoryPerformanceItem[];
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
  authProvider: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  assignedWarehouseIds?: string[];
  totalOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalSpent?: number;
  totalReconstructionJobs?: number;
  totalPrintJobs?: number;
}

export interface AdminCreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  status: string;
}

export interface AdminUpdateUserRequest {
  fullName?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface AdminSystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  services: Record<
    string,
    {
      status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
      message: string;
      latencyMs?: number;
      details?: Record<string, any>;
    }
  >;
}

export interface AdminPaymentTransaction {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  status: string;
  gatewayTransactionId?: string;
  paymentProvider?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AdminAuditLog {
  id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  basePrice?: number;
  sku?: string;
  status?: string;
  isActive?: boolean;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  active?: boolean;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
}

export interface AdminReconstructionJob {
  id: string;
  userId?: string;
  userEmail?: string;
  status: 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  tier?: 'PREVIEW' | 'HIGH_QUALITY' | string;
  progress?: number;
  qualityTier?: string;
  resultMeshUrl?: string;
  pointCloudUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  retryCount?: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AdminPrinter {
  id: string;
  name: string;
  model?: string;
  ipAddress?: string;
  online: boolean;
  status: string;
  currentJobId?: string;
  currentJobName?: string;
  hotendTemp?: number;
  targetHotendTemp?: number;
  bedTemp?: number;
  targetBedTemp?: number;
  progressPercentage?: number;
  lastSeenAt?: string;
}

export interface AdminPrintJob {
  id: string;
  orderId?: string;
  orderNumber?: string;
  jobName?: string;
  printerId?: string;
  printerName?: string;
  materialId?: string;
  materialName?: string;
  materialColor?: string;
  status: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
