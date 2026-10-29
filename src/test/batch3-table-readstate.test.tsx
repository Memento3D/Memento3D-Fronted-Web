// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ServerDataTable } from '../components/ui/data-table/ServerDataTable';
import { useServerTable } from '../components/ui/data-table/useServerTable';
import { ReadState } from '../components/ui/ReadState';
import { clickRetry, mountPage, setupDom, until } from './domHarness';

const pagination = vi.fn();
const retry = vi.fn();
function TableHarness({ rows = [{ id: 'row-1', name: 'Server row' }], loading = false, error = false, fetching = false }) {
  const { table } = useServerTable({ data: rows, columns: [{ accessorKey: 'name', header: 'Name' }],
    rowCount: rows.length ? 25 : 0, sorting: [], onSortingChange: vi.fn(),
    pagination: { pageIndex: 1, pageSize: 10 }, onPaginationChange: pagination, getRowId: (row) => row.id });
  return <ServerDataTable table={table} isLoading={loading} isError={error} isFetching={fetching} onRetry={retry} />;
}
let mounted: Awaited<ReturnType<typeof mountPage>> | undefined;
beforeEach(() => { vi.clearAllMocks(); setupDom(); });
afterEach(async () => { await mounted?.close(); mounted = undefined; vi.restoreAllMocks(); });

it('shared table supports loading, data, empty, error, and retry on the same mounted caller', async () => {
  mounted = await mountPage(<TableHarness loading />);
  expect(mounted.host.textContent).toContain('Đang tải');
  expect(mounted.host.querySelector('.ant-empty, .empty-state-container')).toBeNull();
  await mounted.render(<TableHarness />);
  expect(mounted.host.textContent).toContain('Server row');
  await mounted.render(<TableHarness rows={[]} />);
  expect(mounted.host.textContent).toContain('Không tìm thấy dữ liệu');
  await mounted.render(<TableHarness rows={[]} error />);
  expect(mounted.host.querySelector('.empty-state-container')).toBeNull();
  expect(mounted.host.textContent).not.toContain('Không tìm thấy dữ liệu');
  await clickRetry(mounted.host);
  expect(retry).toHaveBeenCalledOnce();
  await mounted.render(<TableHarness rows={[]} error fetching />);
  expect(mounted.host.textContent).toContain('Đang tải');
  expect(mounted.host.querySelector('.error-state-container')).toBeNull();
});

it('shared table preserves server pagination and row rendering', async () => {
  mounted = await mountPage(<TableHarness />);
  expect(mounted.host.querySelector('.ant-pagination-item-active')?.textContent).toBe('2');
  expect(mounted.host.textContent).toContain('Server row');
  await act(async () => { mounted!.host.querySelector<HTMLElement>('.ant-pagination-item-3')!.click(); });
  expect(pagination).toHaveBeenCalledOnce();
  const update = pagination.mock.calls[0]![0];
  const next = typeof update === 'function' ? update({ pageIndex: 1, pageSize: 10 }) : update;
  expect(next).toEqual({ pageIndex: 2, pageSize: 10 });
});

it('ReadState retry is clickable; rerender clears failure and preserves explicitly cached content', async () => {
  const render = (props = {}) => <ReadState isLoading={false} isError={false} onRetry={retry} {...props}>
    <span>Useful content</span>
  </ReadState>;
  mounted = await mountPage(render({ isError: true, isEmpty: true }));
  expect(mounted.host.querySelector('.empty-state-container')).toBeNull();
  await clickRetry(mounted.host);
  expect(retry).toHaveBeenCalledOnce();
  await mounted.render(render({ isError: true, isFetching: true }));
  expect(mounted.host.textContent).toContain('Đang tải');
  await mounted.render(render({ isEmpty: true }));
  expect(mounted.host.textContent).toContain('Chưa có dữ liệu.');
  await mounted.render(render());
  await until(() => expect(mounted!.host.textContent).toContain('Useful content'));
  await mounted.render(render({ hasData: true, isError: true }));
  expect(mounted.host.textContent).toContain('Useful content');
  expect(mounted.host.textContent).toContain('Đang hiển thị dữ liệu đã tải trước đó.');
});
