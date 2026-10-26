import React, { useCallback, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Button,
  Tag,
  Card,
  Select,
} from 'antd';
import {
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminPaymentTransaction } from '../types/admin.types';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminPaymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [methodFilter, setMethodFilter] = useState<string | undefined>(undefined);

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

  const paymentsFilters = {
    ...params,
    search: search.trim() || undefined,
    transactionReference: search.trim() || undefined,
    status: statusFilter,
    paymentMethod: methodFilter,
  };

  const { data: paymentsPage, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.payments(paymentsFilters),
    queryFn: ({ signal }) => adminApi.getPayments(paymentsFilters, signal),
    placeholderData: keepPreviousData,
  });

  const getStatusTag = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return <Tag color="success">Thành công</Tag>;
    if (status === 'PENDING') return <Tag color="warning">Chờ xử lý</Tag>;
    if (status === 'FAILED') return <Tag color="error">Thất bại</Tag>;
    return <Tag>{status}</Tag>;
  };

  const legacyColumns: LegacyColumn<AdminPaymentTransaction>[] = [
    {
      title: 'Mã giao dịch (Txn ID)',
      key: 'createdAt',
      sorter: true,
      render: (_: any, r: AdminPaymentTransaction) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {r.gatewayTransactionId || r.id.substring(0, 8)}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Đơn: #{r.orderNumber || r.orderId || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, r: AdminPaymentTransaction) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.userName || 'Khách hàng'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.userEmail || ''}</div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: '#10b981' }}>
          {(val || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      sorter: true,
      render: (val: string) => <Tag color="purple">{val || 'CASH'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (st: string) => getStatusTag(st),
    },
    {
      title: 'Thời gian thanh toán',
      key: 'paidAt',
      sorter: true,
      render: (_: any, r: AdminPaymentTransaction) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {r.paidAt
            ? dayjs(r.paidAt).format('DD/MM/YYYY HH:mm:ss')
            : dayjs(r.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      ),
    },
  ];

  const { table } = useServerTable<AdminPaymentTransaction>({
    data: paymentsPage?.content ?? [],
    columns: toServerColumns(legacyColumns),
    rowCount: paymentsPage?.totalElements ?? 0,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
    getRowId: (p) => p.id,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-payments-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Sổ cái Giao dịch & Đối soát Tài chính (Payments Ledger)
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Giám sát bất biến dòng tiền MoMo, ZaloPay, VietQR và trạng thái cổng thanh toán
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
            placeholder="Tìm theo mã giao dịch, mã đơn hoặc email khách hàng..."
            value={search}
            onChange={handleSearchChange}
            debounceMs={350}
            width="100%"
            style={{ minWidth: 280, flex: 1 }}
          />

          <Select
            placeholder="Trạng thái giao dịch"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 170 }}
          >
            <Select.Option value="SUCCESS">Thành công (SUCCESS)</Select.Option>
            <Select.Option value="PENDING">Chờ xử lý (PENDING)</Select.Option>
            <Select.Option value="FAILED">Thất bại (FAILED)</Select.Option>
          </Select>

          <Select
            placeholder="Cổng thanh toán"
            allowClear
            value={methodFilter}
            onChange={(v) => {
              setMethodFilter(v);
              resetPage();
            }}
            style={{ width: 170 }}
          >
            <Select.Option value="MOMO">Ví MoMo</Select.Option>
            <Select.Option value="ZALOPAY">ZaloPay</Select.Option>
            <Select.Option value="BANK_TRANSFER">VietQR / Chuyển khoản</Select.Option>
            <Select.Option value="CASH">Tiền mặt (COD)</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<AdminPaymentTransaction>
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

export default AdminPaymentsPage;
