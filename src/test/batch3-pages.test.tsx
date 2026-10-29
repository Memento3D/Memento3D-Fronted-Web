// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clickRetry, deferred, mountPage, setupDom, until } from './domHarness';
import { CustomerOrdersPage } from '../features/customer/pages/CustomerOrdersPage';
import { CustomerOrderDetailPage } from '../features/orders/pages/CustomerOrderDetailPage';
import { ManagerOrdersPage } from '../features/orders/pages/ManagerOrdersPage';
import { ManagerOrderDetailPage } from '../features/orders/pages/ManagerOrderDetailPage';
import { MaterialManagementPage } from '../features/material/pages/MaterialManagementPage';
import { AdminUserDetailPage } from '../features/admin/pages/AdminUserDetailPage';
import { GoodsReceiptsManagementPage } from '../features/inventory/pages/GoodsReceiptsManagementPage';
import { OperatorHomePage } from '../features/operator/pages/OperatorHomePage';
import { MyModelsPage } from '../features/reconstruction/pages/MyModelsPage';
import { AdminSystemHealthPage } from '../features/admin/pages/AdminSystemHealthPage';

const api = vi.hoisted(() => ({
  orders: vi.fn(), order: vi.fn(), materials: vi.fn(), user: vi.fn(), receipts: vi.fn(),
  jobs: vi.fn(), printers: vi.fn(), models: vi.fn(), health: vi.fn(),
}));
vi.mock('../features/orders/api/orderApi', () => ({ orderApi: {
  list: api.orders, getById: api.order,
  getStatusCounts: async () => ({}), getManagerStatusCounts: async () => ({}),
} }));
vi.mock('../features/orders/api/paymentApi', () => ({ paymentApi: {
  list: async () => [], getOrderPayments: async () => [],
} }));
vi.mock('../features/printjob/api/printJobApi', () => ({ printJobApi: { list: async () => ({ content: [] }) } }));
vi.mock('../features/material/api/materialApi', () => ({ materialApi: { list: api.materials } }));
vi.mock('../features/admin/api/adminApi', () => ({ adminApi: {
  getUserById: api.user, getAuditLogs: async () => ({ content: [] }),
  getSystemHealth: api.health,
} }));
vi.mock('../features/inventory/api/wmsEnterpriseApi', () => ({ wmsEnterpriseApi: { getGoodsReceipts: api.receipts } }));
vi.mock('../services/dashboardApi', () => ({ dashboardApi: { getPrintJobs: api.jobs, getPrinters: api.printers } }));
vi.mock('../services/scanReconstructionService', () => ({ scanReconstructionService: { getMyJobs: api.models } }));
vi.mock('../services/materialService', () => ({ materialService: { list: async () => ({ content: [] }) } }));
vi.mock('../services/warehouseService', () => ({ warehouseService: { list: async () => ({ content: [] }) } }));
vi.mock('../features/auth/hooks/useAuth', () => ({ useAuth: () => ({
  user: { id: 'customer-1', role: 'ROLE_USER', fullName: 'Regression User' }, isAuthenticated: true,
}) }));
vi.mock('../features/warehouse/context/WarehouseContext', () => ({
  useWarehouseContext: () => ({ activeWarehouse: { id: 'wh-1' } }),
}));
vi.mock('../shared/realtime', () => ({ useEventSubscription() {} }));
vi.mock('../features/home/components/Navbar', () => ({ Navbar: () => <nav>Navigation</nav> }));
vi.mock('../features/home/components/Footer', () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock('../features/orders/components/OrderPaymentModal', () => ({ OrderPaymentModal: () => null }));
vi.mock('../features/orders/components/OrderPrintJobLinkModal', () => ({ OrderPrintJobLinkModal: () => null }));
vi.mock('../features/material/components/MaterialFormModal', () => ({ MaterialFormModal: () => null }));
vi.mock('../features/material/components/MaterialDetailDrawer', () => ({ MaterialDetailDrawer: () => null }));

const order = {
  id: 'order-1', orderCode: 'REGRESSION-ORDER', userId: 'customer-1', status: 'COMPLETED',
  totalPrice: 120000, totalAmount: 120000, subtotal: 120000, currency: 'VND',
  paymentStatus: 'PAID', paymentMethod: 'CASH', recipientName: 'Regression Buyer',
  phone: '0912345678', shippingAddress: 'Regression Street', createdAt: '2026-01-01T00:00:00Z',
  items: [{ id: 'item-1', productNameSnapshot: 'Regression sculpture', productName: 'Regression sculpture',
    quantity: 1, unitPrice: 120000, subtotal: 120000 }],
};
const page = (content: unknown[]) => ({ content, totalElements: content.length, number: 0, size: 10 });
const cases = [
  { name: 'customer orders', component: <CustomerOrdersPage />, read: api.orders,
    data: { orders: [order], total: 1 }, empty: { orders: [], total: 0 }, marker: 'REGRESSION-ORDER' },
  { name: 'customer order detail', component: <CustomerOrderDetailPage />, read: api.order,
    data: order, empty: null, marker: 'REGRESSION-ORDER' },
  { name: 'manager orders', component: <ManagerOrdersPage />, read: api.orders,
    data: { orders: [order], total: 1 }, empty: { orders: [], total: 0 }, marker: 'REGRESSION-ORDER' },
  { name: 'manager order detail', component: <ManagerOrderDetailPage />, read: api.order,
    data: order, empty: null, marker: 'REGRESSION-ORDER' },
  { name: 'materials via ServerDataTable', component: <MaterialManagementPage />, read: api.materials,
    data: page([{ id: 'm1', name: 'Regression Resin', sku: 'RESIN-TEST', materialType: 'RESIN', color: 'White',
      unitCost: 1000, status: 'ACTIVE', version: 1 }]), empty: page([]), marker: 'Regression Resin' },
  { name: 'admin user detail', component: <AdminUserDetailPage />, read: api.user,
    data: { id: 'user-1', fullName: 'Regression Account', email: 'test@example.com', role: 'ROLE_USER',
      provider: 'LOCAL', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' }, empty: null, marker: 'Regression Account' },
  { name: 'warehouse receipt list', component: <GoodsReceiptsManagementPage />, read: api.receipts,
    data: page([{ id: 'receipt-1', receiptCode: 'RECEIPT-TEST', code: 'RECEIPT-TEST', status: 'DRAFT', items: [] }]),
    empty: page([]), marker: 'RECEIPT-TEST' },
  { name: 'operator summary', component: <OperatorHomePage />, read: api.jobs,
    data: [{ id: 'job-1', status: 'PRINTING' }], empty: [], marker: 'Regression User', summary: true },
  { name: 'model list presentation', component: <MyModelsPage />, read: api.models,
    data: { jobs: [{ jobId: 'job-1', status: 'done', createdAt: '2026-01-01T00:00:00Z' }], total: 1 },
    empty: { jobs: [], total: 0 }, marker: 'JOB-1' },
  { name: 'system health', component: <AdminSystemHealthPage />, read: api.health,
    data: { status: 'HEALTHY', services: { database: { status: 'HEALTHY', latencyMs: 346 } } },
    empty: null, marker: '346 ms' },
];

let mounted: Awaited<ReturnType<typeof mountPage>> | undefined;
let consoleErrors: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.resetAllMocks();
  setupDom();
  consoleErrors = vi.spyOn(console, 'error').mockImplementation(() => {});
  api.orders.mockResolvedValue({ orders: [], total: 0 }); api.order.mockResolvedValue(order);
  api.materials.mockResolvedValue(page([])); api.receipts.mockResolvedValue(page([]));
  api.jobs.mockResolvedValue([]); api.printers.mockResolvedValue([]);
});
afterEach(async () => {
  await mounted?.close(); mounted = undefined;
  const errors = consoleErrors.mock.calls.map((args: unknown[]) => args.join(' ')).join('\n');
  expect(errors).not.toMatch(/change in the order of Hooks|Rendered (more|fewer) hooks|Invalid hook call/i);
  vi.restoreAllMocks();
});

describe.each(cases)('$name', ({ component, read, data, empty, marker, summary }) => {
  it('renders pending without empty or error', async () => {
    read.mockReturnValue(new Promise(() => {}));
    mounted = await mountPage(component);
    expect(mounted.host.querySelector('.ant-spin, .ant-skeleton')).toBeTruthy();
    expect(mounted.host.querySelector('.error-state-container, .ant-empty, .empty-state-container')).toBeNull();
  });
  it('renders records through the real query hook and service boundary', async () => {
    read.mockResolvedValue(data);
    mounted = await mountPage(component);
    await until(() => expect(mounted!.host.textContent).toContain(marker));
    expect(mounted.host.querySelector('.error-state-container')).toBeNull();
  });
  it('handles successful absence intentionally, without read error', async () => {
    read.mockResolvedValue(empty);
    mounted = await mountPage(component);
    await until(() => expect(mounted!.host.querySelector('.ant-spin-spinning, .ant-skeleton')).toBeNull());
    expect(mounted.host.querySelector('.error-state-container')).toBeNull();
    if (summary) {
      // An empty jobs list is valid zero-valued dashboard data, not an absent dashboard response.
      expect(mounted.host.textContent).toContain('0');
    } else {
      expect(mounted.host.querySelector('.ant-empty, .empty-state-container')
        || /Không tìm thấy|Chưa có dữ liệu/.test(mounted.host.textContent || '')).toBeTruthy();
    }
  });
  it('never presents failure as empty; retry calls the existing read and recovers', async () => {
    read.mockRejectedValue(new Error('private backend details'));
    mounted = await mountPage(component);
    await until(() => expect(mounted!.host.textContent).toContain('Thử lại'));
    expect(mounted.host.querySelector('.ant-empty, .empty-state-container')).toBeNull();
    expect(mounted.host.textContent).not.toMatch(/Chưa có dữ liệu|Không tìm thấy đơn hàng|Hiện chưa có thông tin/);
    expect(mounted.host.textContent).not.toContain('private backend details');
    const calls = read.mock.calls.length;
    read.mockResolvedValue(data);
    await clickRetry(mounted.host);
    await until(() => expect(mounted!.host.textContent).toContain(marker));
    expect(read).toHaveBeenCalledTimes(calls + 1);
    expect(mounted.host.querySelector('.error-state-container')).toBeNull();
  });
});

it.each([
  ['customer', <CustomerOrderDetailPage key="customer" />], ['manager', <ManagerOrderDetailPage key="manager" />],
])('%s order detail preserves hook order across loading, success, failed refetch, missing data, and recovery', async (_name, component) => {
  const pending = deferred<unknown>();
  api.order.mockReturnValue(pending.promise);
  mounted = await mountPage(component);
  await act(async () => { pending.resolve(order); });
  await until(() => expect(mounted!.host.textContent).toContain('REGRESSION-ORDER'));
  api.order.mockRejectedValue(new Error('failed refetch'));
  await act(async () => { await mounted!.client.refetchQueries({ queryKey: ['order', 'order-1'] }); });
  await until(() => expect(mounted!.host.querySelector('.error-state-container')).toBeTruthy());
  api.order.mockResolvedValue(null);
  await clickRetry(mounted.host);
  await until(() => expect(mounted!.host.textContent).toContain('Không tìm thấy đơn hàng.'));
  api.order.mockResolvedValue(order);
  await act(async () => { await mounted!.client.refetchQueries({ queryKey: ['order', 'order-1'] }); });
  await until(() => expect(mounted!.host.textContent).toContain('REGRESSION-ORDER'));
  await mounted.render(component);
});
