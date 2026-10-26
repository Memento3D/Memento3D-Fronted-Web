import { describe, it, expect } from 'vitest';
import { toServerColumns, type LegacyColumn } from '../toServerColumns';

interface SampleItem {
  id: string;
  name: string;
  score: number;
}

describe('toServerColumns Adapter', () => {
  it('converts legacy columns to TanStack ServerColumnDef format', () => {
    const legacy: LegacyColumn<SampleItem>[] = [
      {
        title: 'ID',
        key: 'id',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        sorter: false,
      },
      {
        title: 'Actions',
        key: 'actions',
        hideable: false,
        render: (_val, record) => `Action for ${record.name}`,
      },
    ];

    const tanstackCols = toServerColumns(legacy);

    expect(tanstackCols).toHaveLength(3);
    expect(tanstackCols[0].id).toBe('id');
    expect(tanstackCols[0].header).toBe('ID');
    expect(tanstackCols[0].enableSorting).toBe(true);
    expect(tanstackCols[0].enableHiding).toBe(true);

    expect(tanstackCols[1].id).toBe('name');
    expect(tanstackCols[1].enableSorting).toBe(false);

    expect(tanstackCols[2].id).toBe('actions');
    expect(tanstackCols[2].enableHiding).toBe(false);

    // Test accessorFn
    const rowItem: SampleItem = { id: 'item-1', name: 'Desk Figurine', score: 98 };
    expect((tanstackCols[0] as any).accessorFn(rowItem)).toBe('item-1');
    expect((tanstackCols[1] as any).accessorFn(rowItem)).toBe('Desk Figurine');

    // Test cell rendering
    const cell0 = (tanstackCols[0] as any).cell({ row: { original: rowItem, index: 0 } });
    expect(cell0).toBe('item-1');

    const cell2 = (tanstackCols[2] as any).cell({ row: { original: rowItem, index: 0 } });
    expect(cell2).toBe('Action for Desk Figurine');
  });
});
