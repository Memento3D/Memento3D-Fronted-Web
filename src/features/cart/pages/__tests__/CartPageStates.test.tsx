import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { CartPage } from '../CartPage';

const state = vi.hoisted(() => ({
  cart: null, isLoading: false, errorMessage: null as string | null,
  refreshCart: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(),
}));
vi.mock('../../context/CartContext', () => ({ useCart: () => state }));
vi.mock('../../../home/components/Navbar', () => ({ Navbar: () => null }));
vi.mock('../../../home/components/Footer', () => ({ Footer: () => null }));

it('shows cart read errors separately from successful empty carts and clears them on retry', () => {
  const render = () => renderToStaticMarkup(<MemoryRouter><CartPage /></MemoryRouter>);
  const emptyHtml = render();
  expect(emptyHtml).not.toContain('Không thể tải giỏ hàng.');
  state.errorMessage = 'Không thể tải giỏ hàng.';
  const failedHtml = render();
  expect(failedHtml).toContain('Không thể tải giỏ hàng.');
  expect(failedHtml).toContain('Thử lại');
  expect(failedHtml).not.toContain('ant-empty');
  state.isLoading = true;
  const loadingHtml = render();
  expect(loadingHtml).toContain('ant-spin');
  expect(loadingHtml).not.toContain('Không thể tải giỏ hàng.');
  expect(loadingHtml).not.toContain('ant-empty');
  state.isLoading = false; state.errorMessage = null;
  expect(render()).toContain('ant-empty');
});
