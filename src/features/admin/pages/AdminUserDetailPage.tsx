import { ErrorState } from '../../../components/ui/ErrorState';
import { ReadState } from '../../../components/ui/ReadState';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Spin,
  Table,
} from 'antd';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { getRoleLabel } from '../../../locales/i18n';
import dayjs from 'dayjs';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // User detail
  const { data: user, isLoading: loadingUser, isError: userError, isFetching: fetchingUser, refetch: refetchUser } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => adminApi.getUserById(id!),
    enabled: !!id,
  });

  // User's audit activities
  const { data: auditLogs, isLoading: loadingAudit, isError: auditError, isFetching: fetchingAudit, refetch: refetchAudit } = useQuery({
    queryKey: ['admin-user-audit', id],
    queryFn: () => adminApi.getAuditLogs({ actorId: id, size: 20 }),
    enabled: !!id,
  });

  if (loadingUser || (userError && fetchingUser)) {
    return (
      <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (userError) return <ErrorState onRetry={() => { void refetchUser(); }} />;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <h3>Không tìm thấy người dùng này</h3>
        <Button onClick={() => navigate('/admin/users')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const auditColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dayjs(val).format('DD/MM/YYYY HH:mm:ss')}</span>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (val: string) => <Tag color="cyan">{val || 'System'}</Tag>,
    },
    {
      title: 'Mã đối tượng',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (val: string) => <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{val || '—'}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} id="admin-user-detail-view">
      {/* Back button */}
      <div>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/admin/users')}>
          Quay lại danh sách người dùng
        </Button>
      </div>

      {/* User Profile Card */}
      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Avatar
            size={72}
            src={user.avatarUrl}
            icon={!user.avatarUrl ? <User size={36} /> : undefined}
            style={{ background: '#6366f1', border: '3px solid #818cf8' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                {user.fullName || 'Người dùng'}
              </h2>
              <Tag color="magenta" style={{ fontWeight: 700 }}>
                {getRoleLabel(user.role)}
              </Tag>
              <Tag color={user.status === 'ACTIVE' ? 'success' : user.status === 'LOCKED' ? 'error' : 'default'}>
                {user.status}
              </Tag>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> {user.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> {user.phone || 'Chưa cập nhật'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Tạo: {dayjs(user.createdAt).format('DD/MM/YYYY')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> Đăng nhập: {user.lastLoginAt ? dayjs(user.lastLoginAt).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* User Statistics Highlights */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Tổng đơn hàng
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {user.totalOrders ?? 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 2 }}>
              {user.completedOrders ?? 0} hoàn thành • {user.cancelledOrders ?? 0} đã hủy
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Tổng chi tiêu tích lũy
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {((user.totalSpent || 0) / 1000).toLocaleString('vi-VN')}k đ
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Doanh thu thực nhận
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Tác vụ Tái tạo 3D
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: 4 }}>
              {user.totalReconstructionJobs ?? 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Pipeline AI quét 3D
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Lệnh in đã gán
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
              {user.totalPrintJobs ?? 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Sản xuất xưởng
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activity History Audit Table */}
      <Card
        title={
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Lịch sử hành động của tài khoản (Audit Trail)
          </span>
        }
        bordered={false}
        style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)' }}
      >
        <ReadState isLoading={loadingAudit} isError={auditError} isFetching={fetchingAudit} onRetry={() => { void refetchAudit(); }}>
        <Table
          columns={auditColumns}
          dataSource={auditLogs?.content || []}
          rowKey="id"
          loading={loadingAudit}
          pagination={{ pageSize: 10 }}
        />
        </ReadState>
      </Card>
    </div>
  );
};

export default AdminUserDetailPage;
