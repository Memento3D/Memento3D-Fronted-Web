import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  ShoppingBag,
  Package,
  Layers,
  CreditCard,
  Box,
  Printer,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Tooltip } from 'antd';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navSections = [
    {
      title: 'Không gian điều hành',
      items: [
        { path: '/admin/home', label: 'Trang chủ', icon: Home },
        { path: '/admin/dashboard', label: 'Tổng quan KPI', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Quản trị nhân sự & RBAC',
      items: [
        { path: '/admin/users', label: 'Quản lý tài khoản', icon: Users },
      ],
    },
    {
      title: 'Thương mại & Danh mục',
      items: [
        { path: '/admin/orders', label: 'Đơn hàng toàn sàn', icon: ShoppingBag },
        { path: '/admin/products', label: 'Sản phẩm & Danh mục', icon: Package },
        { path: '/admin/payments', label: 'Sổ cái thanh toán', icon: CreditCard },
      ],
    },
    {
      title: 'Công nghệ 3D & Sản xuất',
      items: [
        { path: '/admin/reconstruction', label: 'Tái tạo 3D AI', icon: Box },
        { path: '/admin/print-jobs', label: 'Lệnh in sản xuất', icon: Layers },
        { path: '/admin/printers', label: 'Đội máy in & Telemetry', icon: Printer },
      ],
    },
    {
      title: 'An toàn & Hạ tầng',
      items: [
        { path: '/admin/audit-logs', label: 'Nhật ký kiểm toán', icon: FileText },
        { path: '/admin/system', label: 'Hạ tầng hệ thống', icon: Activity },
      ],
    },
  ];

  return (
    <aside
      className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? 80 : 268,
        minWidth: collapsed ? 80 : 268,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 68,
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={18} color="#FFFFFF" />
          </div>
          {!collapsed && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Memento3D
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Admin Portal
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-color, #E2D9F7)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
            title="Thu gọn menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div
                style={{
                  padding: '4px 12px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const linkContent = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: collapsed ? '10px 0' : '10px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-full, 9999px)',
                    marginBottom: 4,
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-system, #5F3ADD)' : 'var(--text-secondary, #6A6282)',
                    background: isActive
                      ? 'var(--surface-tertiary, #ECE3FF)'
                      : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 8px -2px rgba(124, 92, 252, 0.12)' : 'none',
                  })}
                >
                  <Icon
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: 'inherit',
                    }}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );

              return collapsed ? (
                <Tooltip key={item.path} title={item.label} placement="right">
                  {linkContent}
                </Tooltip>
              ) : (
                linkContent
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Toggle when collapsed */}
      {collapsed && (
        <div style={{ padding: '14px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 'var(--radius-full)',
            }}
            title="Mở rộng menu"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
