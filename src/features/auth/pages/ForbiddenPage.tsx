import React from 'react';
import { Result, Button, Space, Tag, Typography, Card } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForRole } from '../utils/resolveActorRoute';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { getRoleLabel } from '../../../locales/i18n';

const { Text } = Typography;

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const attemptedPortal = searchParams.get('attempted') || 'portal';
  const role = searchParams.get('role') || user?.role || 'Unknown';

  const handleGoAllowed = () => {
    if (user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#090d16',
        padding: 24,
      }}
    >
      <Card
        style={{
          maxWidth: 580,
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Result
          status="403"
          title={<span style={{ color: '#f8fafc', fontWeight: 800 }}>403 – Từ chối truy cập</span>}
          subTitle={
            <span style={{ color: '#94a3b8' }}>
              Tài khoản của bạn không có đủ quyền để truy cập cổng{' '}
              <Text strong style={{ color: '#f87171' }}>{attemptedPortal.toUpperCase()}</Text>.
            </span>
          }
          extra={[
            <div
              key="details"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: 4 }}>
                Tài khoản xác thực hiện tại:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: '#f8fafc' }}>{user?.fullName || 'Người dùng'} ({user?.email})</Text>
                <Tag color="red" style={{ fontWeight: 700 }}>{getRoleLabel(role)}</Tag>
              </div>
            </div>,
            <Space key="actions" size="middle" wrap style={{ justifyContent: 'center' }}>
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={handleGoAllowed}
                style={{ borderRadius: 8 }}
              >
                Đến không gian được phân quyền
              </Button>
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ borderRadius: 8 }}
              >
                Đăng nhập tài khoản khác
              </Button>
            </Space>,
          ]}
        />
      </Card>
    </div>
  );
};
