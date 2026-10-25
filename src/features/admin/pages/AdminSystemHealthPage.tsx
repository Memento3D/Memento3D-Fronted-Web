import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Spin,
} from 'antd';
import {
  Activity,
  RefreshCw,
  Database,
  Server,
  Zap,
  Box,
  Printer,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import dayjs from 'dayjs';

export const AdminSystemHealthPage: React.FC = () => {
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 15000,
  });

  const getStatusBadge = (status: string) => {
    if (status === 'HEALTHY') {
      return (
        <Tag color="success" icon={<CheckCircle size={12} />} style={{ fontWeight: 600 }}>
          HEALTHY (Bình thường)
        </Tag>
      );
    }
    if (status === 'DEGRADED') {
      return (
        <Tag color="warning" icon={<AlertTriangle size={12} />} style={{ fontWeight: 600 }}>
          DEGRADED (Suy giảm)
        </Tag>
      );
    }
    return (
      <Tag color="error" icon={<XCircle size={12} />} style={{ fontWeight: 600 }}>
        DOWN (Mất kết nối)
      </Tag>
    );
  };

  const getServiceIcon = (name: string) => {
    if (name.toLowerCase().includes('database') || name.toLowerCase().includes('postgres'))
      return <Database size={22} color="#38bdf8" />;
    if (name.toLowerCase().includes('redis'))
      return <Zap size={22} color="#f87171" />;
    if (name.toLowerCase().includes('reconstruction') || name.toLowerCase().includes('worker'))
      return <Box size={22} color="#a855f7" />;
    if (name.toLowerCase().includes('printer'))
      return <Printer size={22} color="#10b981" />;
    return <Server size={22} color="#6366f1" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-system-health-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Tình trạng Sức khỏe Hạ tầng & Dịch vụ Nền tảng (System Health)
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Chẩn đoán kết nối cơ sở dữ liệu, bộ nhớ đệm Redis, worker AI tái tạo 3D và gateway máy in
          </div>
        </div>
        <Button
          icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          onClick={() => refetch()}
        >
          Kiểm tra lại
        </Button>
      </div>

      {/* Overall Status Banner */}
      <Card
        bordered={false}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background:
                  health?.status === 'HEALTHY'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : health?.status === 'DEGRADED'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity
                size={28}
                color={
                  health?.status === 'HEALTHY'
                    ? '#10b981'
                    : health?.status === 'DEGRADED'
                    ? '#f59e0b'
                    : '#ef4444'
                }
              />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Trạng thái tổng thể:{' '}
                <span
                  style={{
                    color:
                      health?.status === 'HEALTHY'
                        ? '#10b981'
                        : health?.status === 'DEGRADED'
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                >
                  {health?.status || 'HEALTHY'}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Thời điểm kiểm tra cuối: {health?.timestamp ? dayjs(health.timestamp).format('HH:mm:ss DD/MM/YYYY') : 'Vừa xong'}
              </div>
            </div>
          </div>
          <div>{health?.status && getStatusBadge(health.status)}</div>
        </div>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {Object.entries(health?.services || {}).map(([serviceName, srv]) => (
            <Col xs={24} md={12} lg={6} key={serviceName}>
              <Card
                bordered={false}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 14,
                  border: '1px solid var(--border-color)',
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {getServiceIcon(serviceName)}
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {serviceName}
                    </span>
                  </div>
                  {getStatusBadge(srv.status)}
                </div>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                  {srv.message}
                </div>

                {srv.latencyMs !== undefined && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Độ trễ phản hồi (Latency):{' '}
                    <span
                      style={{
                        fontWeight: 700,
                        color: srv.latencyMs < 50 ? '#10b981' : srv.latencyMs < 200 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {srv.latencyMs} ms
                    </span>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AdminSystemHealthPage;
