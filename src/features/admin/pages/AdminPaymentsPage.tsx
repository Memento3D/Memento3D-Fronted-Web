import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Card,
  Input,
  Select,
} from 'antd';
import {
  Search,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminPaymentTransaction } from '../types/admin.types';
import dayjs from 'dayjs';

export const AdminPaymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [methodFilter, setMethodFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: paymentsPage, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments', page, pageSize, search, statusFilter, methodFilter],
    queryFn: () =>
      adminApi.getPayments({
        page,
        size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter,
        paymentMethod: methodFilter,
      }),
  });

  const getStatusTag = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return <Tag color="success">Thành công</Tag>;
    if (status === 'PENDING') return <Tag color="warning">Chờ xử lý</Tag>;
    if (status === 'FAILED') return <Tag color="error">Thất bại</Tag>;
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Mã giao dịch (Txn ID)',
      key: 'txn',
      render: (_: any, r: AdminPaymentTransaction) => (
        <div>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
            {r.gatewayTransactionId || r.id.substring(0, 8)}
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
          <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{r.userName || 'Khách hàng'}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.userEmail || ''}</div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0),
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
      render: (val: string) => <Tag color="purple">{val || 'CASH'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => getStatusTag(st),
    },
    {
      title: 'Thời gian thanh toán',
      key: 'paidAt',
      render: (_: any, r: AdminPaymentTransaction) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {r.paidAt
            ? dayjs(r.paidAt).format('DD/MM/YYYY HH:mm:ss')
            : dayjs(r.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-payments-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Sổ cái Giao dịch & Đối soát Tài chính (Payments Ledger)
          </h2>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Giám sát bất biến dòng tiền MoMo, ZaloPay, VietQR và trạng thái cổng thanh toán
          </div>
        </div>
        <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo mã giao dịch, mã đơn hoặc email khách hàng..."
            prefix={<Search size={14} color="#94a3b8" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: 280, flex: 1 }}
            allowClear
          />

          <Select
            placeholder="Trạng thái giao dịch"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(0);
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
              setPage(0);
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

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table
          columns={columns}
          dataSource={paymentsPage?.content || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize,
            total: paymentsPage?.totalElements || 0,
            onChange: (p, ps) => {
              setPage(p - 1);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default AdminPaymentsPage;
