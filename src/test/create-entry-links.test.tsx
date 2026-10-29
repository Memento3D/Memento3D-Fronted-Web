// @vitest-environment jsdom
import { act } from 'react';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroSection } from '../features/home/components/HeroSection';
import { Footer } from '../features/home/components/Footer';
import { Navbar } from '../features/home/components/Navbar';
import { mountPage, setupDom, until } from './domHarness';

const auth = vi.hoisted(() => ({ role: null as string | null }));
vi.mock('../features/auth/hooks/useAuth', () => ({ useAuth: () => ({
  user: auth.role ? { role: auth.role, fullName: 'Customer', email: 'test@example.com' } : null,
  isAuthenticated: !!auth.role, logout: vi.fn(),
}) }));
vi.mock('../features/cart/context/CartContext', () => ({ useCart: () => ({ cartCount: 0 }) }));
vi.mock('../components/notifications/NotificationCenter', () => ({ NotificationCenter: () => null }));

let mounted: Awaited<ReturnType<typeof mountPage>> | undefined;
function Destination() { return <output>{useLocation().pathname}</output>; }
beforeEach(() => { setupDom(); });
afterEach(async () => { await mounted?.close(); mounted = undefined; vi.restoreAllMocks(); });

describe.each([
  ['customer', 'ROLE_USER', '/create-keepsake'], ['guest', null, '/reconstruction/demo'],
])('%s public-page create links', (_label, role, destination) => {
  beforeEach(() => { auth.role = role; });
  it('Hero uses the real entry for customers and preserves guest demo behavior', async () => {
    mounted = await mountPage(<><HeroSection /><Destination /></>, '*');
    const button = [...mounted.host.querySelectorAll('button')].find((element) => element.textContent?.includes('Tạo mô hình 3D'))!;
    await act(async () => { button.click(); });
    await until(() => expect(mounted!.host.querySelector('output')?.textContent).toBe(destination));
  });
  it('Footer uses the real entry for customers and preserves guest demo behavior', async () => {
    mounted = await mountPage(<><Footer /><Destination /></>, '*');
    const link = [...mounted.host.querySelectorAll('span')].find((element) => element.textContent === 'Tạo mô hình 3D từ ảnh')!;
    await act(async () => { link.click(); });
    await until(() => expect(mounted!.host.querySelector('output')?.textContent).toBe(destination));
  });
  it('mobile Navbar uses the real entry for customers and preserves guest demo behavior', async () => {
    mounted = await mountPage(<><Navbar /><Destination /></>, '*');
    await act(async () => { mounted!.host.querySelector<HTMLButtonElement>('[aria-label="Mở menu"]')!.click(); });
    await until(() => expect(document.querySelector('.mobile-highlight-item')).toBeTruthy());
    await act(async () => { document.querySelector<HTMLElement>('.mobile-highlight-item')!.click(); });
    await until(() => expect(mounted!.host.querySelector('output')?.textContent).toBe(destination));
  });
});
