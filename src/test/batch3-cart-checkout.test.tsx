// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '../features/cart/context/CartContext';
import { CartPage } from '../features/cart/pages/CartPage';
import { CheckoutPage } from '../features/orders/pages/CheckoutPage';
import { clickRetry, deferred, mountPage, setupDom, until } from './domHarness';

const api = vi.hoisted(() => ({ getCart: vi.fn(), post: vi.fn() }));
vi.mock('../features/cart/api/cartApi', () => ({ cartApi: { getCart: api.getCart } }));
vi.mock('../services/apiClient', () => ({ apiClient: { post: api.post }, BASE_URL: 'https://test.invalid' }));
vi.mock('../features/auth/hooks/useAuth', () => ({ useAuth: () => ({
  user: { id: 'customer-1', role: 'ROLE_USER', fullName: 'Customer Test' }, isAuthenticated: true,
}) }));
vi.mock('../features/home/components/Navbar', () => ({ Navbar: () => null }));
vi.mock('../features/home/components/Footer', () => ({ Footer: () => null }));
vi.mock('../features/orders/components/OrderPaymentModal', () => ({ OrderPaymentModal: () => null }));

const emptyCart = { id: 'cart-1', userId: 'customer-1', items: [], totalItems: 0,
  subtotal: 0, discount: 0, shippingFee: 0, total: 0 };
const filledCart = { ...emptyCart, items: [{ id: 'i1', productId: 'p1', productName: 'Cart regression product',
  productSlug: 'regression-product', quantity: 1, unitPrice: 100000, subtotal: 100000, available: true }],
totalItems: 1, subtotal: 100000, total: 100000 };
let mounted: Awaited<ReturnType<typeof mountPage>> | undefined;
beforeEach(() => { vi.resetAllMocks(); setupDom(); });
afterEach(async () => { await mounted?.close(); mounted = undefined; vi.restoreAllMocks(); });

describe.each([
  ['cart', <CartPage key="cart" />], ['checkout', <CheckoutPage key="checkout" />],
])('%s with real CartProvider', (_name, component) => {
  it('pending read shows loading rather than false empty', async () => {
    api.getCart.mockReturnValue(new Promise(() => {}));
    mounted = await mountPage(<CartProvider>{component}</CartProvider>);
    expect(mounted.host.querySelector('.ant-spin')).toBeTruthy();
    expect(mounted.host.querySelector('.ant-empty, .error-state-container')).toBeNull();
  });
  it('successful empty cart is visibly distinct from a failed read', async () => {
    api.getCart.mockResolvedValue(emptyCart);
    mounted = await mountPage(<CartProvider>{component}</CartProvider>);
    await until(() => expect(mounted!.host.querySelector('.ant-empty')).toBeTruthy());
    expect(mounted.host.querySelector('.error-state-container')).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('successful records preserve product content', async () => {
    api.getCart.mockResolvedValue(filledCart);
    mounted = await mountPage(<CartProvider>{component}</CartProvider>);
    await until(() => expect(mounted!.host.textContent).toContain('Cart regression product'));
    expect(mounted.host.querySelector('.error-state-container, .ant-empty')).toBeNull();
  });
  it('failed read shows error; a real retry click loads once and clears the old error', async () => {
    api.getCart.mockRejectedValue(new Error('private server stack'));
    mounted = await mountPage(<CartProvider>{component}</CartProvider>);
    await until(() => expect(mounted!.host.querySelector('.error-state-container')).toBeTruthy());
    expect(mounted.host.querySelector('.ant-empty')).toBeNull();
    expect(mounted.host.textContent).not.toContain('private server stack');
    const retry = deferred<typeof filledCart>();
    api.getCart.mockReturnValue(retry.promise);
    await clickRetry(mounted.host);
    expect(api.getCart).toHaveBeenCalledTimes(2);
    expect(mounted.host.querySelector('.ant-spin')).toBeTruthy();
    expect(mounted.host.querySelector('.error-state-container, .ant-empty')).toBeNull();
    await act(async () => { retry.resolve(filledCart); });
    await until(() => expect(mounted!.host.textContent).toContain('Cart regression product'));
    expect(api.post).not.toHaveBeenCalled();
  });
});

it('checkout retains real Ant Design required-address and phone validation after cart loads', async () => {
  api.getCart.mockResolvedValue(filledCart);
  mounted = await mountPage(<CartProvider><CheckoutPage /></CartProvider>);
  await until(() => expect(mounted!.host.querySelector('form')).toBeTruthy());
  await act(async () => { mounted!.host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click(); });
  await until(() => {
    expect(mounted!.host.textContent).toContain('Vui lòng nhập số điện thoại');
    expect(mounted!.host.textContent).toContain('Vui lòng nhập địa chỉ nhận hàng');
  });
  expect(api.post).not.toHaveBeenCalled();
});
