import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Button,
  Tag,
  Space,
  Card,
  Select,
  Modal,
  Descriptions,
  Popconfirm,
  message,
  Progress,
} from 'antd';
import {
  RefreshCw,
  RotateCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminReconstructionJob } from '../types/admin.types';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminReconstructionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<AdminReconstructionJob | null>(null);

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

  const reconstructionFilters = {
    ...params,
    search: search.trim() || undefined,
    status: statusFilter,
    tier: tierFilter,
  };

  const {
    data: jobsPage,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.reconstruction(reconstructionFilters),
    queryFn: ({ signal }) => adminApi.getReconstructionJobs(reconstructionFilters, signal),
    placeholderData: keepPreviousData,
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.retryReconstructionJob(id),
    onSuccess: () => {
      message.success('Đã gửi yêu cầu thử lại tác vụ tái tạo 3D');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reconstruction'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
    onError: (err: any) => message.error(err.message || 'Không thể thử lại tác vụ này'),
  });

  const getStatusTag = (status: string) => {
    if (status === 'COMPLETED') return <Tag color="success">Hoàn thành</Tag>;
    if (status === 'RUNNING') return <Tag color="processing">Đang chạy</Tag>;
    if (status === 'QUEUED' || status === 'PENDING') return <Tag color="warning">Hàng đợi</Tag>;
    if (status === 'FAILED') return <Tag color="error">Thất bại</Tag>;
    return <Tag>{status}</Tag>;
  };

  const legacyColumns: LegacyColumn<AdminReconstructionJob>[] = [
    {
      title: 'Mã tác vụ (Job ID)',
      key: 'jobId',
      sorter: true,
      render: (_: any, r: AdminReconstructionJob) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {r.id.substring(0, 8)}...
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Người dùng',
      dataIndex: 'userEmail',
      key: 'userEmail',
      sorter: true,
      render: (val: string) => <span style={{ color: 'var(--text-primary)' }}>{val || 'Hệ thống'}</span>,
    },
    {
      title: 'Phân hạng (Tier)',
      key: 'tier',
      render: (_: any, r: AdminReconstructionJob) => {
        const tier = r.tier || r.qualityTier || 'PREVIEW';
        return <Tag color={tier.includes('HIGH') ? 'gold' : 'blue'}>{tier}</Tag>;
      },
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_: any, r: AdminReconstructionJob) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={r.status === 'COMPLETED' ? 100 : r.progress || 0}
            size="small"
            status={r.status === 'FAILED' ? 'exception' : r.status === 'RUNNING' ? 'active' : 'normal'}
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
    {
      title: 'Số lần thử lại',
      dataIndex: 'retryCount',
      key: 'retryCount',
      render: (val: number) => <span>{val || 0} lần</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: AdminReconstructionJob) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setSelectedJob(r)}>
            Chi tiết
          </Button>

          {r.status === 'FAILED' && (
            <Popconfirm
              title="Thử lại tác vụ tái tạo 3D"
              description="Hệ thống sẽ tái kích hoạt tác vụ vào hàng đợi AI worker với cơ chế idempotent an toàn."
              onConfirm={() => retryMutation.mutate(r.id)}
              okText="Thử lại"
              cancelText="Hủy"
            >
              <Button
                size="small"
                type="primary"
                icon={<RotateCw size={13} />}
                loading={retryMutation.isPending}
                style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
              >
                Thử lại
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tanstackColumns = React.useMemo(() => toServerColumns(legacyColumns), []);

  const { table } = useServerTable<AdminReconstructionJob>({
    data: jobsPage?.content || [],
    columns: tanstackColumns,
    rowCount: jobsPage?.totalElements ?? 0,
    pagination,
    sorting,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getRowId: (r) => r.id,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-reconstruction-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Giám sát Pipeline Tái tạo Mô hình 3D AI
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Theo dõi tiến trình Photogrammetry & Gaussian Splatting từ ảnh chụp điện thoại
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
              placeholder="Tìm theo ID tác vụ hoặc email người dùng..."
              defaultValue={search}
              onChange={handleSearchChange}
              debounceMs={350}
            />
          </div>

          <Select
            placeholder="Trạng thái"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 160 }}
          >
            <Select.Option value="QUEUED">Hàng đợi (QUEUED)</Select.Option>
            <Select.Option value="RUNNING">Đang xử lý (RUNNING)</Select.Option>
            <Select.Option value="COMPLETED">Hoàn tất (COMPLETED)</Select.Option>
            <Select.Option value="FAILED">Thất bại (FAILED)</Select.Option>
          </Select>

          <Select
            placeholder="Phân hạng (Tier)"
            allowClear
            value={tierFilter}
            onChange={(v) => {
              setTierFilter(v);
              resetPage();
            }}
            style={{ width: 160 }}
          >
            <Select.Option value="PREVIEW">PREVIEW (Nhanh)</Select.Option>
            <Select.Option value="HIGH_QUALITY">HIGH_QUALITY (Chuẩn)</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<AdminReconstructionJob>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={refetch}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết tác vụ Tái tạo 3D: #${selectedJob?.id}`}
        open={!!selectedJob}
        onCancel={() => setSelectedJob(null)}
        footer={null}
        width={600}
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã tác vụ">
                <span style={{ fontFamily: 'monospace' }}>{selectedJob.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">{selectedJob.userEmail || 'Hệ thống'}</Descriptions.Item>
              <Descriptions.Item label="Phân hạng">{selectedJob.tier || selectedJob.qualityTier}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedJob.status)}</Descriptions.Item>
              <Descriptions.Item label="Tiến độ thực tế">{selectedJob.progress || 0}%</Descriptions.Item>
              <Descriptions.Item label="Số lần thử lại">{selectedJob.retryCount || 0}</Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {dayjs(selectedJob.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Bắt đầu chạy">
                {selectedJob.startedAt ? dayjs(selectedJob.startedAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Hoàn tất">
                {selectedJob.completedAt ? dayjs(selectedJob.completedAt).format('DD/MM/YYYY HH:mm:ss') : '—'}
              </Descriptions.Item>
            </Descriptions>

            {selectedJob.errorMessage && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} /> Thông báo lỗi từ AI Worker Pipeline:
                </div>
                <code>{selectedJob.errorMessage}</code>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReconstructionPage;
