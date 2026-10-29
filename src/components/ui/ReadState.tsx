import type { ReactNode } from 'react';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

interface ReadStateProps {
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  hasData?: boolean;
  onRetry: () => void;
  errorMessage?: string;
  emptyTitle?: string;
  children: ReactNode;
}

/** Small presentation wrapper for reads; never retries or interprets business data. */
export function ReadState({ isLoading, isError, isFetching, isEmpty, hasData = false, onRetry,
  errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  emptyTitle = 'Chưa có dữ liệu.', children }: ReadStateProps) {
  if (isLoading || (isError && isFetching && !hasData)) return <LoadingState />;
  if (isError && !isFetching) return <>
    <ErrorState message={hasData ? `${errorMessage} Đang hiển thị dữ liệu đã tải trước đó.` : errorMessage}
      onRetry={onRetry} retryText="Thử lại" />
    {hasData && children}
  </>;
  if (isEmpty) return <EmptyState title={emptyTitle} />;
  return <>{children}</>;
}
