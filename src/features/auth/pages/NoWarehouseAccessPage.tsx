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
        title="Chưa được phân công kho"
        subTitle={
          <span style={{ color: '#94a3b8' }}>
            Xin chào <strong style={{ color: '#f8fafc' }}>{user?.fullName || 'Người dùng'}</strong> ({user?.email}).
            Tài khoản của bạn đã được xác thực nhưng chưa được gán vào cơ sở kho khu vực nào.
            Thao tác kho, nhập kho và kiểm kê yêu cầu quyền thành viên kho đang hoạt động.
          </span>
        }
        extra={[
          <Space key="actions" size="middle">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate('/manager/inventory')}
            >
              Cổng tổng quan
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất & Đổi tài khoản
            </Button>
          </Space>,
        ]}
      />
    </div>
  );
};
