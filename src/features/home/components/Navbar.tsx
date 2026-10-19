import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Avatar, Tag, Drawer, Badge, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  CodeSandboxOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  SunOutlined,
  MoonOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/context/CartContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { getDefaultRouteForRole } from '../../auth/utils/resolveActorRoute';
import { NotificationCenter } from '../../../components/notifications/NotificationCenter';
import { getRoleLabel } from '../../../locales/i18n';
import './navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchClick = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('search-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input');
        if (input) input.focus();
        return;
      }
    }
    navigate('/products');
  };

  const dashboardRoute = user ? getDefaultRouteForRole(user.role) : '/login';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '6px 4px' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {user?.fullName || user?.email}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ marginTop: 4 }}>
            <Tag color="cyan" style={{ fontSize: '0.7rem' }}>
              {getRoleLabel(user?.role)}
            </Tag>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'cart-menu',
      icon: <ShoppingCartOutlined style={{ color: 'var(--primary)' }} />,
      label: `Giỏ hàng (${cartCount})`,
      onClick: () => navigate('/cart'),
    },
    {
      key: 'customer-orders',
      icon: <ShoppingOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Cổng quản trị & Vận hành',
      onClick: () => navigate(dashboardRoute),
    },
    ...(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER'
      ? [
          { type: 'divider' as const },
          {
            key: 'manager-products',
            icon: <AppstoreOutlined />,
            label: 'Quản lý Sản phẩm 3D',
            onClick: () => navigate('/manager/products'),
          },
          {
            key: 'manager-categories',
            icon: <TagsOutlined />,
            label: 'Quản lý Danh mục',
            onClick: () => navigate('/manager/categories'),
          },
        ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <nav className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="home-container navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <div className="brand-logo-icon">
            <CodeSandboxOutlined />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">
              Memento<span className="brand-name-accent">3D</span>
            </span>
            <span className="brand-tagline">Personalized Keepsakes</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-links-desktop">
          <span
            className={`nav-item-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Trang chủ
          </span>
          <span
            className={`nav-item-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
            onClick={() => navigate('/products')}
          >
            Sản phẩm
          </span>
          <span
            className={`nav-item-link ${location.pathname.startsWith('/categories') ? 'active' : ''}`}
            onClick={() => navigate('/categories')}
          >
            Danh mục
          </span>
          <span
            className="nav-item-link highlight-link"
            onClick={() => navigate('/reconstruction/demo')}
          >
            <ThunderboltOutlined style={{ marginRight: 4 }} />
            Tạo mô hình 3D
          </span>
          <span
            className={`nav-item-link ${location.pathname.startsWith('/orders') ? 'active' : ''}`}
            onClick={() => navigate('/orders')}
          >
            Đơn hàng
          </span>
          <span
            className={`nav-item-link ${location.pathname === '/cart' ? 'active' : ''}`}
            onClick={() => navigate('/cart')}
          >
            Giỏ hàng
          </span>
        </div>

        {/* Actions (Search, Dark/Light Toggle, Cart, Notification, Auth) */}
        <div className="navbar-actions">
          {/* Quick Search Trigger */}
          <Tooltip title="Tìm kiếm mô hình">
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={handleSearchClick}
              aria-label="Tìm kiếm"
            >
              <SearchOutlined />
            </button>
          </Tooltip>

          {/* Dark / Light Mode Toggle Button */}
          <Tooltip title={isDark ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'}>
            <button
              type="button"
              className="navbar-icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Đổi giao diện Sáng / Tối"
            >
              {isDark ? (
                <SunOutlined style={{ color: '#fbbf24' }} />
              ) : (
                <MoonOutlined style={{ color: '#0284c7' }} />
              )}
            </button>
          </Tooltip>

          {/* Cart Badge Button */}
          <Tooltip title="Giỏ hàng">
            <Badge count={cartCount} size="small" offset={[-2, 4]} color="var(--primary)">
              <button
                type="button"
                className="navbar-icon-btn"
                onClick={() => navigate('/cart')}
                aria-label="Giỏ hàng"
              >
                <ShoppingCartOutlined />
              </button>
            </Badge>
          </Tooltip>

          {/* Real-time Notification Center */}
          {isAuthenticated && <NotificationCenter />}

          {/* User Profile or Guest Auth Buttons */}
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="navbar-user-avatar-btn">
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                  icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                  src={user.avatarUrl}
                  size={36}
                >
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <span className="navbar-user-name">
                  {user.fullName || user.email?.split('@')[0]}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div className="navbar-auth-buttons">
              <Button
                type="text"
                onClick={() => navigate('/login')}
                className="navbar-login-btn"
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/login?tab=register')}
                className="navbar-register-btn"
              >
                Đăng ký
              </Button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <MenuOutlined />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CodeSandboxOutlined style={{ color: 'var(--primary)', fontSize: 20 }} />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Memento3D</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{
          body: {
            padding: '20px 16px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          },
          header: {
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          },
        }}
      >
        <div className="mobile-drawer-content">
          {/* Quick Search in drawer */}
          <div
            className="mobile-search-trigger"
            onClick={() => {
              setMobileMenuOpen(false);
              handleSearchClick();
            }}
          >
            <SearchOutlined />
            <span>Tìm kiếm sản phẩm, kỷ vật...</span>
          </div>

          {/* Theme switch in drawer */}
          <div className="mobile-theme-row" onClick={toggleTheme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isDark ? (
                <SunOutlined style={{ color: '#fbbf24', fontSize: 18 }} />
              ) : (
                <MoonOutlined style={{ color: '#0284c7', fontSize: 18 }} />
              )}
              <span>Chế độ: {isDark ? 'Tối (Dark)' : 'Sáng (Light)'}</span>
            </div>
            <span className="mobile-theme-toggle-hint">Đổi</span>
          </div>

          <div className="mobile-nav-divider" />

          {/* Links */}
          <div className="mobile-nav-links">
            <div
              className="mobile-nav-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/');
              }}
            >
              Trang chủ
            </div>
            <div
              className="mobile-nav-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/products');
              }}
            >
              Sản phẩm
            </div>
            <div
              className="mobile-nav-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/categories');
              }}
            >
              Danh mục
            </div>
            <div
              className="mobile-nav-item mobile-highlight-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/reconstruction/demo');
              }}
            >
              <ThunderboltOutlined style={{ marginRight: 6 }} />
              Tạo mô hình 3D
            </div>
            <div
              className="mobile-nav-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/orders');
              }}
            >
              Đơn hàng
            </div>
            <div
              className="mobile-nav-item"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/cart');
              }}
            >
              Giỏ hàng ({cartCount})
            </div>
          </div>

          <div className="mobile-nav-divider" />

          {/* Auth in Mobile */}
          {isAuthenticated && user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-badge">
                <Avatar
                  style={{ background: 'var(--primary)', fontWeight: 700 }}
                  size={40}
                  src={user.avatarUrl}
                >
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.fullName || user.email}
                  </div>
                  <Tag color="cyan" style={{ fontSize: '0.7rem', marginTop: 2 }}>
                    {getRoleLabel(user.role)}
                  </Tag>
                </div>
              </div>

              <Button
                block
                icon={<DashboardOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(dashboardRoute);
                }}
                style={{ marginTop: 12, borderRadius: 'var(--radius-md)' }}
              >
                Cổng quản trị & Vận hành
              </Button>

              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{ marginTop: 10, borderRadius: 'var(--radius-md)' }}
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="mobile-guest-section">
              <Button
                block
                type="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                style={{ height: 44, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                Đăng nhập
              </Button>
              <Button
                block
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login?tab=register');
                }}
                style={{ height: 44, borderRadius: 'var(--radius-md)', marginTop: 8 }}
              >
                Đăng ký tài khoản
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;
