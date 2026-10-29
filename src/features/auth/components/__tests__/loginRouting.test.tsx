import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../LoginForm';
import { RoleGuard } from '../RoleGuard';
import { CustomerRoute } from '../CustomerRoute';
import { ACTOR_PORTAL_CONFIGS } from '../../utils/resolveActorRoute';
import type { LoginPayload, User } from '../../types/auth.types';

const state = vi.hoisted(() => ({
  login: vi.fn(), navigate: vi.fn(), clearIntendedUrl: vi.fn(),
  error: vi.fn(), success: vi.fn(),
  submit: undefined as undefined | ((values: LoginPayload) => Promise<void>),
  user: null as User | null,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ login: state.login, user: state.user, isAuthenticated: !!state.user, isLoading: false }),
}));
vi.mock('../../utils/tokenStorage', () => ({
  tokenStorage: { clearIntendedUrl: state.clearIntendedUrl },
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => state.navigate,
  Navigate: ({ to }: { to: string }) => <span data-redirect={to} />,
}));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  const Form = Object.assign(
    ({ onFinish, children }: { onFinish: typeof state.submit; children: React.ReactNode }) => {
      state.submit = onFinish;
      return <div>{children}</div>;
    },
    { useForm: () => [{}], Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
  );
  return { ...actual, Form, App: { useApp: () => ({ message: { error: state.error, success: state.success } }) } };
});

const homes = [
  ['ROLE_ADMIN', '/admin/home'], ['ROLE_MANAGER', '/manager/home'],
  ['ROLE_WAREHOUSE', '/warehouse/home'], ['ROLE_OPERATOR', '/operator/home'],
  ['ROLE_PROVIDER', '/provider/home'], ['ROLE_DRIVER', '/driver/home'],
  ['ROLE_USER', '/customer/home'],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  state.user = null;
});

describe.each(Object.values(ACTOR_PORTAL_CONFIGS))('login through $path', (portalConfig) => {
  it.each(homes)('routes authenticated %s to %s regardless of portal and redirect query', async (role, home) => {
    state.login.mockResolvedValue({ role, email: 'user@example.com', fullName: 'User' });
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[`${portalConfig.path}?redirect=https://example.com`]}>
        <LoginForm portalConfig={portalConfig} />
      </MemoryRouter>,
    );
    await state.submit!({ email: ' User@Example.com ', password: 'password' });
    expect(state.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password' });
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith(home, { replace: true });
    expect(state.clearIntendedUrl).toHaveBeenCalledOnce();
  });
});

it('keeps invalid credentials on login and displays a friendly error', async () => {
  state.login.mockRejectedValue({ response: { status: 401, data: { message: 'private server details' } } });
  renderToStaticMarkup(<MemoryRouter initialEntries={['/login?redirect=/cart']}><LoginForm portalConfig={ACTOR_PORTAL_CONFIGS.customer} /></MemoryRouter>);
  await state.submit!({ email: 'user@example.com', password: 'wrong' });
  expect(state.navigate).not.toHaveBeenCalled();
  expect(state.error).toHaveBeenCalledWith(expect.stringContaining('Email'));
  expect(state.error).not.toHaveBeenCalledWith(expect.stringContaining('private server details'));
});

it.each(['/cart', '/checkout', '/products/some-slug'])('returns a customer to %s after login', async (path) => {
  state.login.mockResolvedValue({ role: 'ROLE_USER', email: 'user@example.com' });
  renderToStaticMarkup(<MemoryRouter initialEntries={[`/login?redirect=${encodeURIComponent(path)}`]}>
    <LoginForm portalConfig={ACTOR_PORTAL_CONFIGS.customer} />
  </MemoryRouter>);
  await state.submit!({ email: 'user@example.com', password: 'password' });
  expect(state.navigate).toHaveBeenCalledExactlyOnceWith(path, { replace: true });
});

it('ignores cart continuation after manager authentication', async () => {
  state.login.mockResolvedValue({ role: 'ROLE_MANAGER', email: 'manager@example.com' });
  renderToStaticMarkup(<MemoryRouter initialEntries={['/login?redirect=/cart']}>
    <LoginForm portalConfig={ACTOR_PORTAL_CONFIGS.customer} />
  </MemoryRouter>);
  await state.submit!({ email: 'manager@example.com', password: 'password' });
  expect(state.navigate).toHaveBeenCalledExactlyOnceWith('/manager/home', { replace: true });
});

it.each(['/cart', '/checkout'])('protects %s before login and after logout or expiry', (path) => {
  const render = () => renderToStaticMarkup(<MemoryRouter initialEntries={[path]}>
    <CustomerRoute><span>customer content</span></CustomerRoute>
  </MemoryRouter>);
  expect(render()).toContain(`/login?redirect=${encodeURIComponent(path)}`);
  state.user = { role: 'ROLE_USER' } as User;
  expect(render()).toContain('customer content');
  state.user = null;
  expect(render()).not.toContain('customer content');
  state.user = { role: 'ROLE_MANAGER' } as User;
  expect(render()).toContain('/manager/home');
  expect(render()).not.toContain('customer content');
});

it('blocks a manager from admin and operator portals', () => {
  state.user = { role: 'ROLE_MANAGER' } as User;
  for (const actor of ['admin', 'operator'] as const) {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/${actor}/home`]}>
        <RoleGuard allowedRoles={ACTOR_PORTAL_CONFIGS[actor].allowedRoles}><span>private content</span></RoleGuard>
      </MemoryRouter>,
    );
    expect(html).toContain('/403?');
    expect(html).not.toContain('private content');
  }
});
