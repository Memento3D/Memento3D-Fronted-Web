/**
 * Centralized Query Key Factory for Memento3D TanStack Ecosystem.
 * Guarantees query key consistency, granular invalidation, and strict typing.
 */

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, any>) => ['products', 'list', filters ?? {}] as const,
    detail: (productId: string | number) => ['products', 'detail', String(productId)] as const,
    featured: ['products', 'featured'] as const,
    popular: ['products', 'popular'] as const,
    newArrivals: ['products', 'newArrivals'] as const,
    categories: ['products', 'categories'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => ['categories', 'list'] as const,
    detail: (id: string | number) => ['categories', 'detail', String(id)] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, any>) => ['orders', 'list', filters ?? {}] as const,
    detail: (orderId: string) => ['orders', 'detail', orderId] as const,
    payments: (orderId: string) => ['orders', 'payments', orderId] as const,
    timeline: (orderId: string) => ['orders', 'timeline', orderId] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (filters?: Record<string, any>) => ['payments', 'list', filters ?? {}] as const,
    status: (paymentId: string) => ['payments', 'status', paymentId] as const,
    verifyReturn: (paramsKey: string) => ['payments', 'verify-return', paramsKey] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'list', warehouseId ?? 'all', filters ?? {}] as const,
    alerts: (warehouseId?: string) => ['inventory', 'alerts', warehouseId ?? 'all'] as const,
    receipts: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'receipts', warehouseId ?? 'all', filters ?? {}] as const,
    issues: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'issues', warehouseId ?? 'all', filters ?? {}] as const,
    transfers: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'transfers', warehouseId ?? 'all', filters ?? {}] as const,
    counts: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'counts', warehouseId ?? 'all', filters ?? {}] as const,
    adjustments: (warehouseId?: string, filters?: Record<string, any>) =>
      ['inventory', 'adjustments', warehouseId ?? 'all', filters ?? {}] as const,
  },
  materials: {
    all: ['materials'] as const,
    list: (filters?: Record<string, any>) => ['materials', 'list', filters ?? {}] as const,
    detail: (id: string) => ['materials', 'detail', id] as const,
  },
  printJobs: {
    all: ['printJobs'] as const,
    list: (filters?: Record<string, any>) => ['printJobs', 'list', filters ?? {}] as const,
    detail: (jobId: string) => ['printJobs', 'detail', jobId] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: Record<string, any>) => ['bookings', 'list', filters ?? {}] as const,
    detail: (bookingId: string) => ['bookings', 'detail', bookingId] as const,
  },
  drivers: {
    all: ['drivers'] as const,
    list: (filters?: Record<string, any>) => ['drivers', 'list', filters ?? {}] as const,
    detail: (driverId: string) => ['drivers', 'detail', driverId] as const,
    deliveries: (driverId?: string, filters?: Record<string, any>) =>
      ['drivers', 'deliveries', driverId ?? 'me', filters ?? {}] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
    list: () => ['warehouses', 'list'] as const,
    detail: (id: string) => ['warehouses', 'detail', id] as const,
    members: (warehouseId: string) => ['warehouses', 'members', warehouseId] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    statistics: (role: string, params?: Record<string, any>) =>
      ['dashboard', 'statistics', role, params ?? {}] as const,
    summary: (role: string, dateRange?: string) =>
      ['dashboard', 'summary', role, dateRange ?? 'today'] as const,
  },
  admin: {
    all: ['admin'] as const,
    usersAll: ['admin', 'users'] as const,
    users: (filters?: Record<string, any>) => ['admin', 'users', filters ?? {}] as const,
    userDetail: (id: string) => ['admin', 'users', 'detail', id] as const,
    orders: (filters?: Record<string, any>) => ['admin', 'orders', filters ?? {}] as const,
    products: (filters?: Record<string, any>) => ['admin', 'products', filters ?? {}] as const,
    payments: (filters?: Record<string, any>) => ['admin', 'payments', filters ?? {}] as const,
    printers: (filters?: Record<string, any>) => ['admin', 'printers', filters ?? {}] as const,
    printJobs: (filters?: Record<string, any>) => ['admin', 'printJobs', filters ?? {}] as const,
    auditLogs: (filters?: Record<string, any>) => ['admin', 'auditLogs', filters ?? {}] as const,
    reconstruction: (filters?: Record<string, any>) => ['admin', 'reconstruction', filters ?? {}] as const,
    systemHealth: ['admin', 'systemHealth'] as const,
    dashboard: (dateRange?: string) => ['admin', 'dashboard', dateRange ?? 'all'] as const,
  },
} as const;
