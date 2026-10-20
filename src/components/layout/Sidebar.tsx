import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip, Drawer } from 'antd';
import {
  Cpu,
  ChevronLeft,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getNavigationForRole } from './navigationConfig';
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
              const isItemActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              const navItemContent = (
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={() => {
                    if (isMobile) onMobileClose();
                  }}
                  className={`sidebar-nav-item ${isItemActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: collapsed && !isMobile ? '10px 0' : '10px 20px',
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    color: isItemActive ? 'var(--primary)' : 'var(--color-text-secondary)',
                    background: isItemActive ? 'var(--primary-subtle)' : 'transparent',
                    borderLeft: isItemActive && (!collapsed || isMobile) ? '3px solid var(--primary)' : '3px solid transparent',
                    fontWeight: isItemActive ? 700 : 500,
                    fontSize: '0.875rem',
                    borderRadius: collapsed && !isMobile ? '12px' : '0 12px 12px 0',
                    margin: collapsed && !isMobile ? '0 10px' : '0 10px 0 0',
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
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
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
        height: 68,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', overflow: 'hidden' }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-default, 16px)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-system) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--primary-glow)',
            flexShrink: 0,
          }}
        >
          <Cpu size={22} color="#FFFFFF" />
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Memento<span style={{ color: 'var(--primary)' }}>3D</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
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
            borderRadius: '8px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} />
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
              padding: 8,
              borderRadius: '9999px',
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
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--color-border)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
        width={280}
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
