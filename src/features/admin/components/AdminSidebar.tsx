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
        width: collapsed ? 80 : 260,
        minWidth: collapsed ? 80 : 260,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color, #334155)',
        background: 'var(--sidebar-bg, #0b1120)',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 64,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color, #334155)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={20} color="#ffffff" />
          </div>
          {!collapsed && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Memento3D
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Admin Portal
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Thu gọn menu"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div
                style={{
                  padding: '4px 12px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b',
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
                    padding: collapsed ? '10px 0' : '10px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 8,
                    marginBottom: 4,
                    textDecoration: 'none',
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
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
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid #334155' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 6,
            }}
            title="Mở rộng menu"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};
