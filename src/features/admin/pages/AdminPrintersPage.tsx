import React, { useCallback, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Button,
  Tag,
  Card,
  Select,
  Progress,
} from 'antd';
import {
  RefreshCw,
  Thermometer,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminPrinter } from '../types/admin.types';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminPrintersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { sorting, pagination, setSorting, setPagination, resetPage, params } = useServerTableState();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch((prev) => {
        if (prev !== value) resetPage();
        return value;
      });
    },
    [resetPage],
  );

  const printersFilters = {
    ...params,
    search: search.trim() || undefined,
    status: statusFilter,
  };

  const {
    data: printersPage,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.printers(printersFilters),
    queryFn: ({ signal }) => adminApi.getPrinters(printersFilters, signal),
    placeholderData: keepPreviousData,
  });

  const legacyColumns: LegacyColumn<AdminPrinter>[] = [
    {
      title: 'Tên máy in',
      key: 'name',
      sorter: true,
      render: (_: any, r: AdminPrinter) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: r.online ? '#10b981' : '#ef4444',
              boxShadow: r.online ? '0 0 8px #10b981' : 'none',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {r.model || 'FDM CoreXY'} • IP: {r.ipAddress || '192.168.1.x'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      sorter: true,
      render: (_: any, r: AdminPrinter) => {
        let color = 'default';
        if (r.status === 'PRINTING') color = 'processing';
        else if (r.status === 'IDLE' || r.status === 'READY') color = 'success';
        else if (r.status === 'ERROR') color = 'error';
        return <Tag color={color}>{r.status || (r.online ? 'READY' : 'OFFLINE')}</Tag>;
      },
    },
    {
      title: 'Nhiệt độ (Nozzle / Bed)',
      key: 'temp',
      render: (_: any, r: AdminPrinter) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
          <Thermometer size={14} color="#f59e0b" />
          <span>
            {r.hotendTemp ?? 210}°C / {r.bedTemp ?? 60}°C
          </span>
        </div>
      ),
    },
    {
      title: 'Tác vụ hiện tại',
      key: 'currentJob',
      render: (_: any, r: AdminPrinter) => (
        <div>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            {r.currentJobName || r.currentJobId || '—'}
          </span>
          {r.progressPercentage !== undefined && r.progressPercentage > 0 && (
            <div style={{ width: 100, marginTop: 4 }}>
              <Progress percent={r.progressPercentage} size="small" />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Lần cuối nhìn thấy',
      dataIndex: 'lastSeenAt',
      key: 'lastSeenAt',
      sorter: true,
      render: (d: string) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {d ? dayjs(d).format('DD/MM/YYYY HH:mm:ss') : 'Vừa xong'}
        </span>
      ),
    },
  ];

  const tanstackColumns = React.useMemo(() => toServerColumns(legacyColumns), []);

  const { table } = useServerTable<AdminPrinter>({
    data: printersPage?.content || [],
    columns: tanstackColumns,
    rowCount: printersPage?.totalElements ?? 0,
    pagination,
    sorting,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getRowId: (p) => p.id,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-printers-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Đội Máy in & Telemetry Phần cứng (Printer Farm)
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Giám sát thời gian thực nhiệt độ đầu đùn, bàn nhiệt và kết nối OctoPrint / Klipper
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ColumnVisibilityMenu table={table} />
          <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </div>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280, flex: 1 }}>
            <SearchBox
              placeholder="Tìm theo tên máy in hoặc địa chỉ IP..."
              defaultValue={search}
              onChange={handleSearchChange}
              debounceMs={350}
            />
          </div>

          <Select
            placeholder="Trạng thái máy in"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 180 }}
          >
            <Select.Option value="IDLE">Rảnh rỗi (IDLE)</Select.Option>
            <Select.Option value="PRINTING">Đang in (PRINTING)</Select.Option>
            <Select.Option value="ERROR">Lỗi phần cứng (ERROR)</Select.Option>
            <Select.Option value="OFFLINE">Mất kết nối (OFFLINE)</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<AdminPrinter>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={refetch}
        />
      </Card>
    </div>
  );
};

export default AdminPrintersPage;
