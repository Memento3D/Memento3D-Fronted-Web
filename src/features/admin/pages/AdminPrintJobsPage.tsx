import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Card,
  Input,
  Select,
  Progress,
} from 'antd';
import {
  Search,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminPrintJob } from '../types/admin.types';
import dayjs from 'dayjs';

export const AdminPrintJobsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: jobsPage, isLoading, refetch } = useQuery({
    queryKey: ['admin-print-jobs', page, pageSize, search, statusFilter],
    queryFn: () =>
      adminApi.getPrintJobs({
        page,
        size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter,
      }),
  });

  const getStatusTag = (status: string) => {
    if (status === 'COMPLETED') return <Tag color="success">Hoàn thành</Tag>;
    if (status === 'PRINTING' || status === 'IN_PROGRESS') return <Tag color="processing">Đang in</Tag>;
    if (status === 'QUEUED' || status === 'CREATED') return <Tag color="warning">Hàng đợi</Tag>;
    if (status === 'FAILED') return <Tag color="error">Lỗi in</Tag>;
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Lệnh in (Job ID)',
      key: 'job',
      render: (_: any, r: AdminPrintJob) => (
        <div>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>
            {r.jobName || r.id.substring(0, 8)}
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn hàng',
      key: 'order',
      render: (_: any, r: AdminPrintJob) => (
        <span style={{ color: '#cbd5e1' }}>{r.orderNumber || r.orderId || '—'}</span>
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
        <span style={{ color: '#94a3b8' }}>{r.materialName || 'Tiêu chuẩn'}</span>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
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
      render: (st: string) => getStatusTag(st),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-print-jobs-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Giám sát Lệnh in Sản xuất Xưởng (Print Jobs)
          </h2>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Theo dõi phân công máy in, tiến độ đùn nhựa và tiêu hao vật tư
          </div>
        </div>
        <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo mã lệnh in hoặc đơn hàng..."
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
            placeholder="Trạng thái lệnh in"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(0);
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

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table
          columns={columns}
          dataSource={jobsPage?.content || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize,
            total: jobsPage?.totalElements || 0,
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

export default AdminPrintJobsPage;
