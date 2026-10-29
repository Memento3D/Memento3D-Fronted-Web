import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App } from 'antd';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, vi } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';

export function setupDom() {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({
    matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  }) });
  Object.assign(globalThis, { ResizeObserver: class { observe() {} unobserve() {} disconnect() {} } });
  window.scrollTo = () => {};
  const originalStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => originalStyle(element));
}

export async function until(check: () => void) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 100; attempt++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
    try { check(); return; } catch (error) { lastError = error; }
  }
  throw lastError;
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

export async function mountPage(page: ReactNode, routePath = '/test/:id') {
  const client = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
    mutations: { retry: false },
  } });
  const host = document.createElement('div');
  document.body.append(host);
  const root: Root = createRoot(host);
  const render = async (node: ReactNode = page) => {
    await act(async () => { root.render(
      <ThemeProvider><ConfigProvider theme={{ token: { motion: false } }}><App>
        <QueryClientProvider client={client}><MemoryRouter initialEntries={['/test/order-1']}>
          <Routes><Route path={routePath} element={node} /></Routes>
        </MemoryRouter></QueryClientProvider>
      </App></ConfigProvider></ThemeProvider>,
    ); });
  };
  await render();
  return { host, client, render, async close() {
    await act(async () => { root.unmount(); client.clear(); });
    host.remove();
  } };
}

export async function clickRetry(host: HTMLElement) {
  const button = host.querySelector<HTMLButtonElement>('.error-state-container button')
    || [...host.querySelectorAll('button')].find((element) => element.textContent?.includes('Thử lại'));
  expect(button, 'visible retry action').toBeTruthy();
  await act(async () => { button!.click(); });
}
