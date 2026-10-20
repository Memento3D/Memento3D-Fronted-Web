import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Dropdown,
  Avatar,
  Modal,
  Tag,
} from 'antd';
import {
  Sun,
  Moon,
  LogOut,
  Shield,
  Activity,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { adminApi } from '../api/adminApi';
import { StatusBadge } from '../../../components/common/StatusBadge';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Health probe query
  const { data: healthData } = useQuery({
    queryKey: ['admin-header-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 30000,
  });

  const getBreadcrumbTitle = (path: string): string => {
    if (path.includes('/admin/home')) return 'Bảng tin Điều hành';
    if (path.includes('/admin/dashboard')) return 'Tổng quan Chỉ số KPI';
    if (path.includes('/admin/users')) return 'Quản lý Tài khoản & Phân quyền';
    if (path.includes('/admin/orders')) return 'Đơn hàng Toàn sàn';
    if (path.includes('/admin/products')) return 'Sản phẩm & Danh mục';
    if (path.includes('/admin/payments')) return 'Sổ cái Giao dịch Thanh toán';
    if (path.includes('/admin/reconstruction')) return 'Giám sát Pipeline Tái tạo 3D AI';
    if (path.includes('/admin/print-jobs')) return 'Lệnh in Sản xuất Xưởng';
    if (path.includes('/admin/printers')) return 'Đội máy in & Telemetry';
    if (path.includes('/admin/audit-logs')) return 'Nhật ký Kiểm toán Hệ thống';
    if (path.includes('/admin/system')) return 'Tình trạng Hạ tầng & Dịch vụ';
    return 'Quản trị Hệ thống';
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn kết thúc phiên làm việc Quản trị viên?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        await logout();
        navigate('/login', { replace: true });
      },
    });
  };

  const userMenuItems = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div style={{ padding: '6px 4px' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.fullName || 'Quản trị viên'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
          <div style={{ marginTop: 4 }}>
            <Tag color="purple" style={{ fontSize: '0.7rem' }}>
              ROLE_ADMIN
            </Tag>
          </div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'my-profile',
      icon: <User size={14} style={{ color: 'var(--primary)' }} />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'my-security',
      icon: <Shield size={14} />,
      label: 'Bảo mật tài khoản',
      onClick: () => navigate('/profile/security'),
    },
    { type: 'divider' as const },
    {
      key: 'system-status',
      icon: <Activity size={14} />,
      label: 'Tình trạng hệ thống',
      onClick: () => navigate('/admin/system'),
    },
    {
      key: 'view-customer',
      icon: <ExternalLink size={14} />,
      label: 'Chuyển sang Cửa hàng (Shop)',
      onClick: () => navigate('/customer/home'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={14} />,
      label: 'Đăng xuất an toàn',
      onClick: handleLogout,
    },
  ];

  const overallStatus = healthData?.status || 'HEALTHY';

  return (
    <header
      style={{
        height: 68,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left: Page Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--surface-container, #F1EBFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Shield size={18} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {getBreadcrumbTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* System Health Live Badge */}
        <div
          onClick={() => navigate('/admin/system')}
          style={{ cursor: 'pointer' }}
          title="Bấm để xem chẩn đoán dịch vụ thời gian thực"
        >
          <StatusBadge
            status={overallStatus === 'HEALTHY' ? 'ONLINE' : overallStatus === 'DEGRADED' ? 'WARNING' : 'ERROR'}
            label={`Hệ thống: ${overallStatus}`}
            variant={overallStatus === 'HEALTHY' ? 'mint' : overallStatus === 'DEGRADED' ? 'peach' : 'error'}
          />
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface-container, #F1EBFF)',
            border: '1px solid var(--border-color, #E2D9F7)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 'var(--radius-full, 9999px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-color, #E2D9F7)',
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              icon={!user?.avatarUrl ? <User size={16} /> : undefined}
              style={{ background: 'var(--primary)', border: '1.5px solid var(--border-color)' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.fullName || 'Admin'}
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
