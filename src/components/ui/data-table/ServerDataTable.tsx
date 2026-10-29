import { Button, Checkbox, Dropdown, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Columns3 } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { LoadingState } from '../LoadingState';
import type { ServerTableFeatures } from './useServerTable';
import type { ReactTable } from '@tanstack/react-table';

type AnyTable<T extends object> = ReactTable<ServerTableFeatures, T>;

interface ServerDataTableProps<T extends object> {
  table: AnyTable<T>;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Show checkboxes + selection state. Table must be created with enableRowSelection. */
  selectable?: boolean;
  pageSizeOptions?: string[];
  className?: string;
  scroll?: TableProps<T>['scroll'];
}

/**
 * Presentational layer: Ant Design Table (existing design system, tokens and
 * dark/light mode) driven entirely by a headless TanStack Table instance.
 */
export function ServerDataTable<T extends object>({
  table,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = 'Không tìm thấy dữ liệu',
  emptyDescription = 'Không có bản ghi nào khớp với điều kiện lọc hiện tại.',
  selectable = false,
  pageSizeOptions = ['10', '20', '50'],
  className = '',
  scroll = { x: 'max-content' },
}: ServerDataTableProps<T>) {
  if (isLoading || (isError && isFetching)) {
    return <LoadingState />;
  }
  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.options.rowCount ?? rows.length;

  const antColumns: ColumnsType<T> = table.getVisibleLeafColumns().map((column) => {
    const header = column.columnDef.header;
    const sorted = column.getIsSorted();
    return {
      key: column.id,
      title: typeof header === 'string' ? header : column.id,
      dataIndex: column.id,
      sorter: column.getCanSort(),
      sortOrder: sorted === 'asc' ? 'ascend' : sorted === 'desc' ? 'descend' : null,
      sortDirections: ['ascend', 'descend'],
      render: (_value: unknown, _record: T, index: number) => {
        const cell = rows[index]?.getAllCells().find((c) => c.column.id === column.id);
        return cell ? table.FlexRender({ cell } as never) : null;
      },
    };
  });

  return (
    <div className={`table-responsive-container ${className}`}>
      <Table<T>
        rowKey={(record) => table.options.getRowId?.(record, 0) as string}
        columns={antColumns}
        dataSource={rows.map((r) => r.original)}
        loading={isLoading || isFetching}
        scroll={scroll}
        rowSelection={
          selectable
            ? {
                selectedRowKeys: Object.keys(table.state.rowSelection ?? {}),
                onChange: (keys) =>
                  table.setRowSelection(Object.fromEntries(keys.map((k) => [String(k), true]))),
              }
            : undefined
        }
        pagination={{
          current: pageIndex + 1,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions,
        }}
        onChange={(pagination, _filters, sorter) => {
          const s = Array.isArray(sorter) ? sorter[0] : sorter;
          if (s?.columnKey && s.order) {
            table.setSorting([{ id: String(s.columnKey), desc: s.order === 'descend' }]);
          } else if (s && !s.order) {
            table.setSorting([]);
          }
          const nextIndex = (pagination.current ?? 1) - 1;
          const nextSize = pagination.pageSize ?? pageSize;
          if (nextIndex !== pageIndex || nextSize !== pageSize) {
            table.setPagination({
              pageIndex: nextSize !== pageSize ? 0 : nextIndex,
              pageSize: nextSize,
            });
          }
        }}
        locale={{
          emptyText: isFetching ? null : <EmptyState title={emptyTitle} description={emptyDescription} />,
        }}
      />
    </div>
  );
}

/** Column visibility picker (works with any ServerDataTable table instance). */
export function ColumnVisibilityMenu<T extends object>({ table }: { table: AnyTable<T> }) {
  const columns = table.getAllLeafColumns().filter((c) => c.getCanHide());

  return (
    <Dropdown
      trigger={['click']}
      popupRender={() => (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 180,
          }}
        >
          {columns.map((c) => (
            <Checkbox
              key={c.id}
              checked={c.getIsVisible()}
              onChange={(e) => c.toggleVisibility(e.target.checked)}
            >
              {typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id}
            </Checkbox>
          ))}
        </div>
      )}
    >
      <Button icon={<Columns3 size={16} />} aria-label="Chọn cột hiển thị">
        Cột
      </Button>
    </Dropdown>
  );
}
