import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Drawer } from 'antd';
import {
  Cpu,
  ChevronLeft,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getNavigationForRole, isNavigationItemActive } from './navigationConfig';
import type { NavSectionConfig } from './navigationConfig';
import { getRoleLabel } from '../../locales/i18n';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  forceRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  forceRole,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeRole = forceRole || user?.role || 'ROLE_USER';
  const sections: NavSectionConfig[] = getNavigationForRole(activeRole);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const renderNavItems = (isMobile = false) => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
      {sections.map((section, secIdx) => (
        <div key={secIdx} style={{ marginBottom: 16 }}>
          {(!collapsed || isMobile) && (
            <div
              style={{
                padding: '0 20px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {section.title}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isItemActive = isNavigationItemActive(item, location.pathname);

              const navItemContent = (
                <Link
                  to={item.path}
                  aria-current={isItemActive ? 'page' : undefined}
                  onClick={() => {
                    if (isMobile) onMobileClose();
                  }}
                  className={`sidebar-nav-item ${isItemActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed && !isMobile ? '8px 0' : '8px 14px',
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    color: isItemActive ? 'var(--primary)' : 'var(--color-text-secondary)',
                    background: isItemActive ? 'var(--primary-subtle)' : 'transparent',
                    fontWeight: isItemActive ? 600 : 500,
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    margin: collapsed && !isMobile ? '0 8px' : '0 8px',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {(!collapsed || isMobile) && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                  {item.badge && (!collapsed || isMobile) && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs, 4px)',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (collapsed && !isMobile) {
                return (
                  <Tooltip key={itemIdx} title={item.label} placement="right">
                    {navItemContent}
                  </Tooltip>
                );
              }

              return <React.Fragment key={itemIdx}>{navItemContent}</React.Fragment>;
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const brandHeader = (isMobile = false) => (
    <div
      style={{
        height: 64,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden' }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cpu size={18} color="#FFFFFF" />
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Memento<span style={{ color: 'var(--primary)' }}>3D</span>
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {getRoleLabel(activeRole)}
            </div>
          </div>
        )}
      </div>

      {!isMobile && !collapsed && (
        <button
          onClick={onToggleCollapse}
          className="btn-icon"
          title="Thu gọn menu"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-xs, 4px)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={15} />
        </button>
      )}
    </div>
  );

  const userFooter = (isMobile = false) => (
    <div
      style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {(!collapsed || isMobile) ? (
        <div
          onClick={() => {
            navigate('/profile');
            if (isMobile) onMobileClose();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: 'pointer', flex: 1, paddingRight: 8 }}
        >
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
            }}
          >
            <User size={16} color="var(--primary)" />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'Người dùng'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
      ) : (
        <Tooltip title="Hồ sơ người dùng" placement="right">
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--surface-container)',
              border: '1.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
            }}
          >
            <User size={16} color="var(--primary)" />
          </div>
        </Tooltip>
      )}

      {(!collapsed || isMobile) && (
        <Tooltip title="Đăng xuất">
          <button
            onClick={handleLogout}
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--color-danger)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-sm, 6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LogOut size={15} />
          </button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="desktop-sidebar-root"
        className={`atelier-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: collapsed ? 68 : 236,
          minWidth: collapsed ? 68 : 236,
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--color-border)',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 90,
        }}
      >
        {brandHeader(false)}
        {renderNavItems(false)}
        {userFooter(false)}
      </aside>

      {/* Mobile Drawer (Screen < 1024px) */}
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        width={260}
        closable={false}
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--color-surface)',
          },
        }}
      >
        {brandHeader(true)}
        {renderNavItems(true)}
        {userFooter(true)}
      </Drawer>
    </>
  );
};
