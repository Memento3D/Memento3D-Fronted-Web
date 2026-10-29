import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { CartProvider, useCart } from '../CartContext';
import { cartApi } from '../../api/cartApi';
import type { User } from '../../../auth/types/auth.types';

const state = vi.hoisted(() => ({ user: null as User | null, navigate: vi.fn() }));
vi.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: state.user, isAuthenticated: !!state.user }),
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => state.navigate,
}));
vi.mock('../../api/cartApi', () => ({ cartApi: {
  getCart: vi.fn(), addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(),
} }));
vi.mock('antd', () => ({ message: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

let cart: ReturnType<typeof useCart>;
const Probe = () => {
  // oxlint-disable-next-line react/globals -- Capture the context for server-rendered handler tests.
  cart = useCart();
  return null;
};
function render() {
  renderToStaticMarkup(<MemoryRouter initialEntries={['/products/my-product']}>
    <CartProvider><Probe /></CartProvider>
  </MemoryRouter>);
}
beforeEach(() => { vi.clearAllMocks(); state.user = null; });

it('never calls cart reads or mutations for guests; returns to the originating product', async () => {
  render();
  expect(await cart.addToCart({ productId: 'p1', quantity: 1 })).toBe(false);
  await cart.updateQuantity('item', 2);
  await cart.removeItem('item');
  await cart.clearCart();
  await cart.refreshCart();
  for (const method of Object.values(cartApi)) expect(method).not.toHaveBeenCalled();
  expect(state.navigate).toHaveBeenCalledWith('/login?redirect=%2Fproducts%2Fmy-product');
  expect(cart.cart).toBeNull();
  expect(cart.cartCount).toBe(0);
});

it('uses the product supplied by a showcase quick-add as the login return path', async () => {
  render();
  await cart.addToCart({ productId: 'p1', quantity: 1 }, '/products/featured-product');
  expect(state.navigate).toHaveBeenCalledExactlyOnceWith('/login?redirect=%2Fproducts%2Ffeatured-product');
  expect(cartApi.addItem).not.toHaveBeenCalled();
});

it('blocks staff from all cart API operations', async () => {
  state.user = { id: 'manager', role: 'ROLE_MANAGER' } as User;
  render();
  await cart.refreshCart();
  await cart.addToCart({ productId: 'p1', quantity: 1 });
  await cart.updateQuantity('item', 2);
  await cart.removeItem('item');
  await cart.clearCart();
  for (const method of Object.values(cartApi)) expect(method).not.toHaveBeenCalled();
  expect(state.navigate).toHaveBeenCalledWith('/manager/home');
});

it('preserves customer cart mutations without replaying an add', async () => {
  state.user = { id: 'customer', role: 'ROLE_USER' } as User;
  render();
  const payload = { productId: 'p1', quantity: 2, customization: { material: 'resin' } };
  expect(await cart.addToCart(payload)).toBe(true);
  expect(cartApi.addItem).toHaveBeenCalledExactlyOnceWith(payload);
  await cart.updateQuantity('item', 3);
  await cart.removeItem('item');
  await cart.clearCart();
  expect(cartApi.updateQuantity).toHaveBeenCalledExactlyOnceWith('item', { quantity: 3 });
  expect(cartApi.removeItem).toHaveBeenCalledExactlyOnceWith('item');
  expect(cartApi.clearCart).toHaveBeenCalledOnce();
  expect(state.navigate).not.toHaveBeenCalled();
});
