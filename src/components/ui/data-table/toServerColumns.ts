import type { ReactNode } from 'react';
import type { ServerColumnDef } from './useServerTable';

/** Minimal subset of an Ant Design column used by existing pages. */
export interface LegacyColumn<T> {
  title: string;
  key: string;
  dataIndex?: string;
  sorter?: boolean;
  /** Set false to keep a column (e.g. actions) always visible. */
  hideable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, record: T, index: number) => ReactNode;
}

/**
 * Lets a page keep its existing, design-system-approved cell renderers while
 * TanStack Table owns sorting/visibility/selection/pagination state.
 */
export function toServerColumns<T extends object>(columns: LegacyColumn<T>[]): ServerColumnDef<T>[] {
  return columns.map((col) => {
    const field = col.dataIndex;
    return {
      id: col.key,
      header: col.title,
      accessorFn: (row: T) => (field ? (row as Record<string, unknown>)[field] : row),
      enableSorting: Boolean(col.sorter),
      enableHiding: col.hideable !== false,
      cell: ({ row }: { row: { original: T; index: number } }) => {
        const value = field ? (row.original as Record<string, unknown>)[field] : undefined;
        return col.render ? col.render(value, row.original, row.index) : (value as ReactNode);
      },
    } as ServerColumnDef<T>;
  });
}
