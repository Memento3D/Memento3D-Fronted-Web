import React from 'react';
import { Result, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';

export const NoWarehouseAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
      <Result
        status="warning"
        title="No Warehouse Scope Assigned"
        subTitle={
          <span style={{ color: '#94a3b8' }}>
            Hello <strong style={{ color: '#f8fafc' }}>{user?.fullName || 'User'}</strong> ({user?.email}).
            Your user account is authenticated, but you are not actively assigned to any regional warehouse facility.
            Warehouse operations, goods receipt, and stocktaking require an active warehouse membership.
          </span>
        }
        extra={[
          <Space key="actions" size="middle">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate('/manager/inventory')}
            >
              Overview Portal
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Sign Out & Switch Account
            </Button>
          </Space>,
        ]}
      />
    </div>
  );
};
