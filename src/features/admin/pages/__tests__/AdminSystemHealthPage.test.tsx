import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { AdminSystemHealthPage } from '../AdminSystemHealthPage';

const state = vi.hoisted(() => ({
  data: undefined as unknown, isLoading: false, isError: false, isFetching: false, refetch: vi.fn(),
}));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => state }));

it.each([null, undefined, 0, 346])('renders latency %s safely without changing status rules', (latencyMs) => {
  state.data = { status: 'HEALTHY', services: { database: { status: 'HEALTHY', latencyMs } } };
  state.isLoading = false; state.isError = false;
  const html = renderToStaticMarkup(<AdminSystemHealthPage />);
  expect(html).toContain(typeof latencyMs === 'number' ? `${latencyMs} ms` : 'N/A');
  expect(html).toContain('HEALTHY');
});

it('never assumes HEALTHY while loading or after a failed request', () => {
  state.data = undefined;
  state.isLoading = true;
  let html = renderToStaticMarkup(<AdminSystemHealthPage />);
  expect(html).toContain('Đang tải');
  expect(html).not.toContain('HEALTHY');
  state.isLoading = false; state.isError = true;
  html = renderToStaticMarkup(<AdminSystemHealthPage />);
  expect(html).toContain('Không thể tải dữ liệu.');
  expect(html).not.toContain('HEALTHY');
});

it('renders successful missing health data as empty rather than failed or healthy', () => {
  state.data = null; state.isLoading = false; state.isError = false;
  const html = renderToStaticMarkup(<AdminSystemHealthPage />);
  expect(html).toContain('Chưa có dữ liệu.');
  expect(html).not.toContain('HEALTHY');
  expect(html).not.toContain('Không thể tải dữ liệu.');
});
