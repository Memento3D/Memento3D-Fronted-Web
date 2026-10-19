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
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{user?.fullName || 'Quản trị viên'}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user?.email}</div>
          <div style={{ marginTop: 4 }}>
            <Tag color="volcano" style={{ fontSize: '0.7rem' }}>
              ROLE_ADMIN
            </Tag>
          </div>
        </div>
      ),
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
  const statusColor =
    overallStatus === 'HEALTHY' ? '#10b981' : overallStatus === 'DEGRADED' ? '#f59e0b' : '#ef4444';

  return (
    <header
      style={{
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color, #334155)',
        background: 'var(--header-bg, #0f172a)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left: Page Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="#6366f1" />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            {getBreadcrumbTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* System Health Live Badge */}
        <div
          onClick={() => navigate('/admin/system')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #334155',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: '#cbd5e1',
          }}
          title="Bấm để xem chẩn đoán dịch vụ thời gian thực"
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 600 }}>{overallStatus}</span>
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #334155',
            color: '#cbd5e1',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              padding: '4px 8px',
              borderRadius: 8,
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              icon={!user?.avatarUrl ? <User size={16} /> : undefined}
              style={{ background: '#6366f1', border: '2px solid #818cf8' }}
            />
            <div style={{ display: 'none', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                {user?.fullName || 'Admin'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Quản trị viên</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
