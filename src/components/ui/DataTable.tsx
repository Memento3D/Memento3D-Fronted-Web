import { Table } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Skeleton } from './Skeleton';

export interface DataTableProps<T> extends Omit<TableProps<T>, 'loading'> {
  columns: ColumnsType<T>;
  dataSource?: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
}

export function DataTable<T extends object>({
  columns,
  dataSource = [],
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = 'Không tìm thấy dữ liệu',
  emptyDescription = 'Không có bản ghi nào khớp với điều kiện lọc hiện tại.',
  emptyActionText,
  onEmptyAction,
  pagination = false,
  scroll = { x: 'max-content' },
  className = '',
  ...rest
}: DataTableProps<T>) {
  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return <Skeleton type="table" rows={6} />;
  }

  return (
    <div className={`table-responsive-container ${className}`}>
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={pagination}
        scroll={scroll}
        locale={{
          emptyText: (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionText={emptyActionText}
              onAction={onEmptyAction}
            />
          ),
        }}
        {...rest}
      />
    </div>
  );
}
