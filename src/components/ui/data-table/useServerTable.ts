import { useCallback, useMemo, useState } from 'react';
import {
  tableFeatures,
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  useTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  ColumnVisibilityState,
} from '@tanstack/react-table';

/** Feature set shared by every server-side admin/management table. */
export const serverTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
});

export type ServerTableFeatures = typeof serverTableFeatures;
export type ServerColumnDef<T extends object> = ColumnDef<ServerTableFeatures, T>;

interface QueryStateOptions {
  /** Default sort. Newest-first (createdAt DESC) unless a list says otherwise. */
  defaultSort?: SortingState;
  pageSize?: number;
}

/**
 * Client-side UI state that drives server-side queries (page, size, sort).
 * `params` is memoised so it can be placed directly in a query key.
 * Backend still validates the allowed sort fields.
 */
export function useServerTableState(options: QueryStateOptions = {}) {
  const { defaultSort = [{ id: 'createdAt', desc: true }], pageSize = 10 } = options;

  const [sorting, setSorting] = useState<SortingState>(defaultSort);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });

  const handleSortingChange = useCallback((updater: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting((old) => (typeof updater === 'function' ? updater(old) : updater));
    // A new sort order must restart from the first page
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  const resetPage = useCallback(
    () => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })),
    [],
  );

  const params = useMemo(() => {
    const first = sorting[0];
    return {
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: first ? `${first.id},${first.desc ? 'desc' : 'asc'}` : undefined,
    };
  }, [sorting, pagination]);

  return {
    sorting,
    pagination,
    setSorting: handleSortingChange,
    setPagination,
    resetPage,
    params,
  };
}

interface ServerTableOptions<T extends object> {
  data: readonly T[];
  columns: ServerColumnDef<T>[];
  /** Total records on the server (drives page count; no fake client pagination). */
  rowCount: number;
  sorting: SortingState;
  onSortingChange: (u: SortingState | ((old: SortingState) => SortingState)) => void;
  pagination: PaginationState;
  onPaginationChange: (u: PaginationState | ((old: PaginationState) => PaginationState)) => void;
  getRowId: (row: T) => string;
  initialColumnVisibility?: ColumnVisibilityState;
  enableRowSelection?: boolean;
}

/** TanStack Table (v9) configured for fully manual (server-side) sort/paging. */
export function useServerTable<T extends object>(opts: ServerTableOptions<T>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    opts.initialColumnVisibility ?? {},
  );

  const table = useTable({
    features: serverTableFeatures,
    data: opts.data,
    columns: opts.columns,
    getRowId: opts.getRowId,
    manualPagination: true,
    manualSorting: true,
    rowCount: opts.rowCount,
    enableRowSelection: opts.enableRowSelection ?? false,
    state: {
      sorting: opts.sorting,
      pagination: opts.pagination,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: opts.onSortingChange as never,
    onPaginationChange: opts.onPaginationChange as never,
    onRowSelectionChange: setRowSelection as never,
    onColumnVisibilityChange: setColumnVisibility as never,
  });

  const clearSelection = useCallback(() => setRowSelection({}), []);

  return { table, rowSelection, columnVisibility, clearSelection };
}
