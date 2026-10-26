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
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminPrintJob } from '../types/admin.types';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminPrintJobsPage: React.FC = () => {
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

  const printJobsFilters = {
    ...params,
    search: search.trim() || undefined,
    status: statusFilter,
  };

  const { data: jobsPage, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.printJobs(printJobsFilters),
    queryFn: ({ signal }) => adminApi.getPrintJobs(printJobsFilters, signal),
    placeholderData: keepPreviousData,
  });

  const getStatusTag = (status: string) => {
    if (status === 'COMPLETED') return <Tag color="success">Hoàn thành</Tag>;
    if (status === 'PRINTING' || status === 'IN_PROGRESS') return <Tag color="processing">Đang in</Tag>;
    if (status === 'QUEUED' || status === 'CREATED') return <Tag color="warning">Hàng đợi</Tag>;
    if (status === 'FAILED') return <Tag color="error">Lỗi in</Tag>;
    return <Tag>{status}</Tag>;
  };

  const legacyColumns: LegacyColumn<AdminPrintJob>[] = [
    {
      title: 'Lệnh in (Job ID)',
      key: 'createdAt',
      sorter: true,
      render: (_: any, r: AdminPrintJob) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {r.jobName || r.id.substring(0, 8)}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      key: 'order',
      render: (_: any, r: AdminPrintJob) => (
        <span style={{ color: 'var(--text-primary)' }}>{r.orderNumber || r.orderId || '—'}</span>
      ),
    },
    {
      title: 'Máy in gán',
      key: 'printer',
      render: (_: any, r: AdminPrintJob) => (
        <Tag color="cyan">{r.printerName || r.printerId || 'Chưa gán máy'}</Tag>
      ),
    },
    {
      title: 'Vật liệu in',
      key: 'material',
      render: (_: any, r: AdminPrintJob) => (
        <span style={{ color: 'var(--text-secondary)' }}>{r.materialName || 'Tiêu chuẩn'}</span>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      sorter: true,
      render: (_: any, r: AdminPrintJob) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={r.status === 'COMPLETED' ? 100 : r.progress || 0}
            size="small"
            status={r.status === 'FAILED' ? 'exception' : r.status === 'PRINTING' ? 'active' : 'normal'}
          />
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (st: string) => getStatusTag(st),
    },
  ];

  const { table } = useServerTable<AdminPrintJob>({
    data: jobsPage?.content ?? [],
    columns: toServerColumns(legacyColumns),
    rowCount: jobsPage?.totalElements ?? 0,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
    getRowId: (j) => j.id,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-print-jobs-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Giám sát Lệnh in Sản xuất Xưởng (Print Jobs)
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Theo dõi phân công máy in, tiến độ đùn nhựa và tiêu hao vật tư
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ColumnVisibilityMenu table={table} />
          <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </div>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchBox
            placeholder="Tìm theo mã lệnh in hoặc đơn hàng..."
            value={search}
            onChange={handleSearchChange}
            debounceMs={350}
            width="100%"
            style={{ minWidth: 280, flex: 1 }}
          />

          <Select
            placeholder="Trạng thái lệnh in"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 170 }}
          >
            <Select.Option value="CREATED">Đã tạo (CREATED)</Select.Option>
            <Select.Option value="PRINTING">Đang in (PRINTING)</Select.Option>
            <Select.Option value="COMPLETED">Hoàn thành (COMPLETED)</Select.Option>
            <Select.Option value="FAILED">Lỗi (FAILED)</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<AdminPrintJob>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
        />
      </Card>
    </div>
  );
};

export default AdminPrintJobsPage;
