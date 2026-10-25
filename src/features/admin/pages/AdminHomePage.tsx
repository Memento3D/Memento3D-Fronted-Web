import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Alert,
  Spin,
} from 'antd';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Box,
  Printer,
  FileText,
  CreditCard,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminApi } from '../api/adminApi';
import dayjs from 'dayjs';

export const AdminHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch real summary metrics from backend
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
    isFetching,
  } = useQuery({
    queryKey: ['admin-home-summary'],
    queryFn: adminApi.getDashboardSummary,
    refetchInterval: 30000,
  });

  // 2. Fetch real recent audit logs for activity stream
  const { data: auditLogs, isLoading: loadingAudit } = useQuery({
    queryKey: ['admin-home-recent-audit'],
    queryFn: () => adminApi.getAuditLogs({ size: 6 }),
  });

  // 3. Time-based dynamic greeting
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const currentDateFormatted = dayjs().format('dddd, [ngày] DD [tháng] MM [năm] YYYY');

  const failedJobsCount = summary?.reconstruction?.failed || 0;
  const offlinePrintersCount = summary?.printers?.printersOffline || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} id="admin-home-view">
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: '28px 32px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {getGreeting()}, {user?.fullName || 'Admin'}
            </span>
            <Tag color="volcano" style={{ fontWeight: 700, borderRadius: 6 }}>
              ROOT ADMIN
            </Tag>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {currentDateFormatted} — Hệ thống Memento3D đang vận hành ổn định trên hạ tầng phân tán.
          </div>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: 12 }}>
          <Button
            icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetchSummary()}
            style={{ borderRadius: 8, height: 40 }}
          >
            Đồng bộ dữ liệu
          </Button>
          <Button
            type="primary"
            icon={<UserPlus size={16} />}
            onClick={() => navigate('/admin/users')}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
            }}
          >
            Thêm tài khoản
          </Button>
        </div>
      </div>

      {/* 2. Critical System Alerts / Warnings */}
      {(failedJobsCount > 0 || offlinePrintersCount > 0) && (
        <Row gutter={[16, 16]}>
          {failedJobsCount > 0 && (
            <Col xs={24} md={12}>
              <Alert
                type="error"
                showIcon
                icon={<AlertTriangle size={20} />}
                message={`${failedJobsCount} tác vụ Tái tạo 3D gặp sự cố lỗi`}
                description="Cần kiểm tra pipeline AI worker hoặc thực hiện thử lại tác vụ an toàn."
                action={
                  <Button size="small" danger onClick={() => navigate('/admin/reconstruction')}>
                    Xử lý ngay
                  </Button>
                }
                style={{ borderRadius: 12, border: '1px solid #f87171' }}
              />
            </Col>
          )}
          {offlinePrintersCount > 0 && (
            <Col xs={24} md={12}>
              <Alert
                type="warning"
                showIcon
                icon={<Printer size={20} />}
                message={`${offlinePrintersCount} máy in mất kết nối telemetry`}
                description="Kiểm tra kết nối mạng nội bộ xưởng hoặc agent daemon trên máy in."
                action={
                  <Button size="small" onClick={() => navigate('/admin/printers')}>
                    Kiểm tra
                  </Button>
                }
                style={{ borderRadius: 12, border: '1px solid #fbbf24' }}
              />
            </Col>
          )}
        </Row>
      )}

      {/* 3. Core KPI Highlights */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/admin/users')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tổng người dùng
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {loadingSummary ? <Spin size="small" /> : summary?.users?.total ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 4 }}>
                  +{summary?.users?.newToday ?? 0} hôm nay • {summary?.users?.active ?? 0} hoạt động
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={24} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/admin/orders')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Đơn hàng toàn sàn
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {loadingSummary ? <Spin size="small" /> : summary?.orders?.total ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: 4 }}>
                  {summary?.orders?.processing ?? 0} đang xử lý • {summary?.orders?.completed ?? 0} xong
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={24} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Doanh thu nền tảng
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  {loadingSummary ? (
                    <Spin size="small" />
                  ) : (
                    `${((summary?.revenue?.total || 0) / 1000000).toFixed(1)}M đ`
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Tháng này: {((summary?.revenue?.thisMonth || 0) / 1000000).toFixed(1)}M đ
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={24} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/admin/reconstruction')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tái tạo mô hình 3D AI
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {loadingSummary ? <Spin size="small" /> : summary?.reconstruction?.total ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a855f7', marginTop: 4 }}>
                  {summary?.reconstruction?.completed ?? 0} hoàn tất • {summary?.reconstruction?.running ?? 0} đang chạy
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box size={24} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 4. Quick Actions */}
      <Card
        title={
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Lối tắt quản trị nhanh (Quick Actions)
          </span>
        }
        bordered={false}
        style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)' }}
      >
        <Row gutter={[16, 16]}>
          {[
            {
              title: 'Quản trị Người dùng & Phân quyền',
              desc: 'Tạo, sửa, khóa hoặc gán vai trò tài khoản',
              icon: Users,
              path: '/admin/users',
              color: '#6366f1',
            },
            {
              title: 'Bảng phân tích KPI & Biểu đồ',
              desc: 'Biểu đồ doanh thu amCharts 5 và phân bố',
              icon: TrendingUp,
              path: '/admin/dashboard',
              color: '#38bdf8',
            },
            {
              title: 'Giám sát Đơn hàng Toàn sàn',
              desc: 'Theo dõi tiến trình thanh toán và in ấn',
              icon: ShoppingBag,
              path: '/admin/orders',
              color: '#10b981',
            },
            {
              title: 'Sổ cái Giao dịch Thanh toán',
              desc: 'Đối soát các giao dịch MoMo, ZaloPay, VietQR',
              icon: CreditCard,
              path: '/admin/payments',
              color: '#f59e0b',
            },
            {
              title: 'Pipeline Tái tạo 3D AI',
              desc: 'Theo dõi hàng đợi, tiến độ và thử lại lỗi',
              icon: Box,
              path: '/admin/reconstruction',
              color: '#a855f7',
            },
            {
              title: 'Nhật ký Kiểm toán Audit Logs',
              desc: 'Truy vết toàn bộ hành vi hệ thống bất biến',
              icon: FileText,
              path: '/admin/audit-logs',
              color: '#ec4899',
            },
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <Col xs={24} sm={12} lg={8} key={idx}>
                <div
                  onClick={() => navigate(act.path)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 12,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = act.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: `${act.color}20`,
                        color: act.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {act.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 5. Recent Activity Feed from Audit Log */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              Nhật ký hành động gần đây (Audit Stream)
            </span>
            <Button
              type="link"
              onClick={() => navigate('/admin/audit-logs')}
              style={{ color: '#6366f1', padding: 0 }}
            >
              Xem tất cả nhật ký &rarr;
            </Button>
          </div>
        }
        bordered={false}
        style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-color)' }}
      >
        {loadingAudit ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : !auditLogs?.content || auditLogs.content.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
            Chưa có hành động audit nào được ghi nhận.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {auditLogs.content.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tag color="blue" style={{ fontWeight: 600 }}>
                    {log.action}
                  </Tag>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.actorEmail || 'HỆ THỐNG'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 8 }}>
                      thực hiện trên {log.entityType || 'Resource'} ({log.entityId || 'ID'})
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {dayjs(log.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminHomePage;
