import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Avatar, Tag, Drawer, Space, Badge } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  CodeSandboxOutlined,
  ArrowRightOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/context/CartContext';
import { getDefaultRouteForRole } from '../../auth/utils/resolveActorRoute';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardRoute = user ? getDefaultRouteForRole(user.role) : '/login';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{user?.fullName || user?.email}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.email}</div>
          <div style={{ marginTop: 4 }}>
            <Tag color="cyan" style={{ fontSize: '0.7rem' }}>{user?.role}</Tag>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'cart-menu',
      icon: <ShoppingCartOutlined style={{ color: '#38bdf8' }} />,
      label: `Giỏ hàng (${cartCount})`,
      onClick: () => navigate('/cart'),
    },
    {
      key: 'customer-orders',
      icon: <CodeSandboxOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Trang quản trị / Portal',
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
      <div className="home-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(14, 165, 233, 0.45)',
            }}
          >
            <CodeSandboxOutlined style={{ fontSize: 22, color: '#ffffff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Memento<span className="gradient-text-cyan">3D</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: -3 }}>
              Physical Keepsakes
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 28,
          }}
          className="desktop-nav-links"
        >
          <span className="nav-link" onClick={() => navigate('/')}>
            Trang chủ
          </span>
          <span className="nav-link" onClick={() => navigate('/products')}>
            Sản phẩm
          </span>
          <span className="nav-link" onClick={() => navigate('/categories')}>
            Danh mục
          </span>
          <span className="nav-link" onClick={() => scrollToSection('how-it-works')}>
            Quy trình
          </span>
          <span className="nav-link" onClick={() => scrollToSection('story')}>
            Câu chuyện
          </span>
        </div>

        {/* Auth & Cart Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Cart Icon Button */}
          <Badge count={cartCount} size="small" offset={[-2, 4]} color="#0ea5e9">
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 20, color: '#f8fafc' }} />}
              onClick={() => navigate('/cart')}
              style={{
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ marginLeft: 4, fontSize: '0.85rem', fontWeight: 600 }}>Giỏ hàng</span>
            </Button>
          </Badge>

          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: '#0ea5e9',
                    verticalAlign: 'middle',
                  }}
                  icon={<UserOutlined />}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    {user.fullName || user.email}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                    {user.role.replace('ROLE_', '')}
                  </span>
                </div>
              </div>
            </Dropdown>
          ) : (
            <Space size={10}>
              <Button
                type="text"
                onClick={() => navigate('/login')}
                style={{
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/login')}
                icon={<ArrowRightOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  border: 'none',
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                Bắt đầu
              </Button>
            </Space>
          )}

          {/* Mobile Hamburger Toggle */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20, color: '#ffffff' }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <span style={{ color: '#ffffff', fontWeight: 700 }}>
            Memento<span className="gradient-text-cyan">3D</span> Menu
          </span>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        bodyStyle={{ background: '#0a0f1d', padding: 24 }}
        headerStyle={{ background: '#070a14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Button
            type="text"
            block
            style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/');
            }}
          >
            Trang chủ
          </Button>

          <Button
            type="text"
            block
            style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/products');
            }}
          >
            Sản phẩm 3D
          </Button>

          <Button
            type="text"
            block
            style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/categories');
            }}
          >
            Danh mục
          </Button>

          <Button
            type="text"
            block
            style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/cart');
            }}
          >
            Giỏ hàng ({cartCount})
          </Button>

          <Button
            type="text"
            block
            style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/orders');
            }}
          >
            Đơn hàng của tôi
          </Button>
        </div>
      </Drawer>
    </nav>
  );
};
