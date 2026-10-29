// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { queryClient } from '../lib/query/queryClient';
import { getCustomerNavigationItem } from '../components/layout/navigationConfig';
import type { User } from '../features/auth/types/auth.types';
import { setupDom, until } from './domHarness';

const auth = vi.hoisted(() => ({ user: null as User | null, isLoading: false, updateUser: vi.fn() }));
vi.mock('../features/auth/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({ ...auth, isAuthenticated: !!auth.user, logout: vi.fn(), updateUser: auth.updateUser }),
}));
vi.mock('../shared/realtime', () => ({
  RealTimeProvider: ({ children }: { children: ReactNode }) => children,
  useEventSubscription() {},
}));
vi.mock('../features/warehouse/context/WarehouseContext', () => ({
  WarehouseProvider: ({ children }: { children: ReactNode }) => children,
  useWarehouseContext: () => ({ activeWarehouse: null, warehouses: [], isLoading: false }),
}));
vi.mock('../components/notifications/NotificationCenter', () => ({
  NotificationCenter: () => <button aria-label="Notifications">Notifications</button>,
}));
vi.mock('../features/warehouse/components/WarehouseSelector', () => ({ WarehouseSelector: () => null }));
vi.mock('@tanstack/react-query-devtools', () => ({ ReactQueryDevtools: () => null }));
vi.mock('../features/home/pages/HomePage', () => ({ HomePage: () => <div>Public home</div> }));
vi.mock('../features/home/components/Navbar', () => ({ Navbar: () => <nav data-testid="public-navbar">Public Navbar</nav> }));
vi.mock('../features/home/components/Footer', () => ({ Footer: () => <footer data-testid="public-footer">Public Footer</footer> }));
vi.mock('../features/auth/pages/LoginPage', () => ({ LoginPage: () => <div>Login</div> }));
vi.mock('../features/manager/pages/ManagerHomePage', () => ({ ManagerHomePage: () => <div>Manager home</div> }));
vi.mock('../features/products/api/productApi', () => ({ productApi: {
  list: async () => ({ content: [], totalElements: 0, totalPages: 0 }),
  getBySlug: async () => ({ id: 'p1', slug: 'sculpture', name: 'Shell test sculpture', price: 100000,
    images: [], availability: 'IN_STOCK', description: 'Product content retained' }),
} }));
vi.mock('../features/products/api/categoryApi', () => ({ categoryApi: { list: async () => [] } }));
vi.mock('../features/cart/api/cartApi', () => ({ cartApi: { getCart: async () => ({ items: [], totalItems: 0 }) } }));
vi.mock('../features/profile/api/profileApi', () => ({ profileApi: {
  getProfile: async () => auth.user, getAddresses: async () => [],
} }));
vi.mock('../features/orders/api/orderApi', () => ({ orderApi: {
  list: async () => ({ orders: [], total: 0 }), getStatusCounts: async () => ({}),
  getById: async () => ({ id: 'order-1', orderCode: 'SHELL-ORDER', status: 'COMPLETED',
    totalPrice: 100000, currency: 'VND', items: [], paymentStatus: 'PAID',
    recipientName: 'Shell Customer', createdAt: '2026-01-01T00:00:00Z' }),
} }));
vi.mock('../features/orders/api/paymentApi', () => ({ paymentApi: {
  list: async () => [], getOrderPayments: async () => [],
} }));
vi.mock('../services/scanReconstructionService', () => ({ scanReconstructionService: {
  getMyJobs: async () => ({ jobs: [], total: 0 }),
  getCapabilities: async () => ({ minImages: 1, maxImages: 50, supportedFormats: [] }),
} }));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  setupDom(); localStorage.clear(); queryClient.clear();
  auth.isLoading = false;
  auth.user = { id: 'customer-1', role: 'ROLE_USER', fullName: 'Shell Customer', email: 'customer@example.com', provider: 'LOCAL' };
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => { root.unmount(); queryClient.clear(); });
  host.remove(); vi.restoreAllMocks();
});
async function open(path: string) {
  window.history.replaceState({}, '', path);
  await act(async () => { root.render(<App />); });
}

describe.each(['/products', '/categories', '/products/sculpture'])('public catalog %s', (path) => {
  it('keeps guest public browsing outside the customer shell', async () => {
    auth.user = null;
    await open(path);
    await until(() => expect(host.querySelector('[data-testid="public-navbar"]')).toBeTruthy());
    expect(host.querySelector('#desktop-sidebar-root, #dashboard-layout-root')).toBeNull();
    await until(() => expect(host.querySelector('[data-testid="public-footer"]')).toBeTruthy());
  });
});

it.each([
  ['/customer/home', '/customer/home'], ['/products', '/products'], ['/products/sculpture', '/products'],
  ['/categories', '/categories'], ['/categories/keepsakes', '/categories'], ['/cart', '/cart'],
  ['/checkout', '/cart'], ['/profile', '/profile'], ['/profile/addresses', '/profile'],
  ['/profile/security', '/profile'], ['/orders', '/orders'], ['/customer/orders', '/orders'],
  ['/orders/order-1', '/orders'], ['/customer/orders/order-1', '/orders'],
  ['/create-keepsake', null], ['/my-models', null], ['/customer/models', null],
])('customer %s retains one dashboard shell and the correct active item', async (path, activePath) => {
  await open(path!);
  await until(() => expect(host.querySelector('#desktop-sidebar-root')).toBeTruthy());
  // Wait for lazy page content, not just the route suspense boundary.
  await until(() => expect(host.textContent).not.toContain('Đang tải không gian làm việc'));
  if (!['/customer/home', '/orders', '/customer/orders'].includes(path!)) {
    await until(() => expect(host.querySelector('.customer-page-content')).toBeTruthy());
  }
  expect(host.querySelectorAll('#dashboard-layout-root')).toHaveLength(1);
  expect(host.querySelector('[data-testid="public-navbar"], [data-testid="public-footer"]')).toBeNull();
  if (activePath) {
    const active = host.querySelectorAll('#desktop-sidebar-root .sidebar-nav-item.active');
    expect(active).toHaveLength(1);
    expect(active[0]?.getAttribute('href')).toBe(activePath);
    expect(active[0]?.getAttribute('aria-current')).toBe('page');
  }
  expect(host.querySelector('[aria-label="Notifications"]')).toBeTruthy();
  expect(host.textContent).toContain('Shell Customer');
});

it('keeps shell and active menu coherent through actual sidebar navigation', async () => {
  await open('/customer/home');
  await until(() => expect(host.querySelector('#desktop-sidebar-root')).toBeTruthy());
  for (const path of ['/products', '/categories', '/cart', '/profile', '/orders']) {
    const link = host.querySelector<HTMLAnchorElement>(`#desktop-sidebar-root a[href="${path}"]`)!;
    await act(async () => { link.click(); });
    await until(() => expect(window.location.pathname).toBe(path));
    await until(() => expect(host.querySelector('#desktop-sidebar-root a.active')?.getAttribute('href')).toBe(path));
    expect(host.querySelector('[data-testid="public-navbar"], [data-testid="public-footer"]')).toBeNull();
  }
});

it('does not infer a customer shell from the catalog URL for staff', async () => {
  auth.user!.role = 'ROLE_MANAGER';
  await open('/products');
  await until(() => expect(host.querySelector('[data-testid="public-navbar"]')).toBeTruthy());
  expect(host.querySelector('#desktop-sidebar-root')).toBeNull();
});

it('preserves the staff cart denial and role-home redirect', async () => {
  auth.user!.role = 'ROLE_MANAGER';
  await open('/cart');
  await until(() => expect(window.location.pathname).toBe('/manager/home'));
  expect(host.querySelector('.customer-page-content')).toBeNull();
});

it('keeps permitted staff profile access in the staff dashboard, not customer navigation', async () => {
  auth.user!.role = 'ROLE_MANAGER';
  await open('/profile');
  await until(() => expect(host.querySelector('.customer-page-content')).toBeTruthy());
  expect(host.querySelector('#desktop-sidebar-root a[href="/manager/home"]')).toBeTruthy();
  expect(host.querySelector('#desktop-sidebar-root a[href="/customer/home"]')).toBeNull();
  expect(host.querySelector('[data-testid="public-navbar"]')).toBeNull();
});

it('keeps guest cart access protected with its return destination', async () => {
  auth.user = null;
  await open('/cart');
  await until(() => expect(window.location.pathname).toBe('/login'));
  expect(new URLSearchParams(window.location.search).get('redirect')).toBe('/cart');
  expect(host.querySelector('#desktop-sidebar-root')).toBeNull();
});

it.each([
  ['/products/sculpture', '/products'], ['/checkout', '/cart'], ['/orders/order-1', '/orders'],
  ['/customer/orders/order-1', '/orders'], ['/profile/security', '/profile'], ['/products-other', undefined],
])('central menu matching maps %s without page-specific active state', (path, expected) => {
  expect(getCustomerNavigationItem(path)?.path).toBe(expected);
});
