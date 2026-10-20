import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Tag, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  User,
  Shield,
  Settings,
  LogOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { WarehouseSelector } from '../../features/warehouse/components/WarehouseSelector';
import { getRoleLabel } from '../../locales/i18n';
import { showConfirmDialog } from '../ui/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';

export interface TopbarProps {
  onToggleMobileMenu: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileMenu,
  collapsed,
  onToggleCollapse,
  title,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await queryClient.invalidateQueries();
    } catch (e) {
      console.error('Data sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    showConfirmDialog({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại trên Memento3D?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: async () => {
        await logout();
        navigate('/login', { replace: true });
      },
    });
  };

  const isWarehouseRole =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ROLE_MANAGER' ||
    user?.role === 'ROLE_WAREHOUSE' ||
    user?.role === 'ROLE_OPERATOR';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-summary',
      disabled: true,
      label: (
        <div style={{ padding: '6px 4px' }}>
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {user?.fullName || 'Người dùng Memento3D'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {user?.email}
          </div>
          <div style={{ marginTop: 6 }}>
            <Tag color="purple" style={{ borderRadius: '9999px', fontSize: '0.7rem' }}>
              {getRoleLabel(user?.role)}
            </Tag>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <User size={15} style={{ color: 'var(--primary)' }} />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'security',
      icon: <Shield size={15} style={{ color: 'var(--primary)' }} />,
      label: 'Đổi mật khẩu & Bảo mật',
      onClick: () => navigate('/profile/security'),
    },
    {
      key: 'addresses',
      icon: <Settings size={15} />,
      label: 'Sổ địa chỉ & Cài đặt',
      onClick: () => navigate('/profile/addresses'),
    },
    {
      key: 'storefront',
      icon: <ExternalLink size={15} />,
      label: 'Xem cửa hàng Storefront',
      onClick: () => window.open('/products', '_blank'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={15} />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className="atelier-topbar"
      style={{
        height: 68,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        position: 'sticky',
        top: 0,
        zIndex: 80,
      }}
    >
      {/* Left controls: Mobile Hamburger & Current Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Mobile Hamburger toggle (visible on screens <= 1024px) */}
        <button
          onClick={onToggleMobileMenu}
          className="mobile-hamburger-btn btn-icon"
          title="Mở menu"
          style={{
            display: 'none', // Shown via CSS media query
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Desktop Expand Button if Collapsed */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="desktop-expand-btn btn-icon"
            title="Mở rộng menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'none' }} className="desktop-breadcrumb-prefix">
            Không gian /
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {title || getRoleLabel(user?.role)}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Scoped Warehouse Selector */}
        {isWarehouseRole && (
          <div className="topbar-warehouse-container">
            <WarehouseSelector />
          </div>
        )}

        {/* Sync Data CTA */}
        <Tooltip title="Làm mới và đồng bộ dữ liệu CSDL">
          <button
            onClick={handleSyncData}
            disabled={isSyncing}
            className="btn btn-soft"
            style={{ padding: '6px 12px', fontSize: '0.775rem', gap: 6, height: 34 }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span className="desktop-only-text">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
          </button>
        </Tooltip>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Language Toggle VI / EN */}
        <Tooltip title={lang === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}>
          <button
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              height: 34,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Globe size={14} color="var(--primary)" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </Tooltip>

        {/* Theme Toggle Button (Light / Dark) */}
        <Tooltip title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}>
          <button
            onClick={toggleTheme}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: isDark ? '#FFBA7A' : 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            aria-label="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>

        {/* User Profile Avatar with Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              transition: 'background var(--transition-fast)',
            }}
          >
            {user?.avatarUrl ? (
              <Avatar
                src={user.avatarUrl}
                size={34}
                style={{ border: '2px solid var(--primary)', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--surface-container)',
                  border: '1.5px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <User size={16} color="var(--primary)" />
              </div>
            )}
            <div className="desktop-user-name" style={{ textAlign: 'left', minWidth: 0, maxWidth: 110 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName?.split(' ')[0] || 'User'}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
