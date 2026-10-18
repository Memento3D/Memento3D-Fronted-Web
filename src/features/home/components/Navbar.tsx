import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Avatar, Tag, Drawer, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  CodeSandboxOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getDefaultRouteForRole } from '../../auth/utils/resolveActorRoute';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
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
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'My Portal / Dashboard',
      onClick: () => navigate(dashboardRoute),
    },
    {
      key: 'customer-orders',
      icon: <CodeSandboxOutlined />,
      label: 'My 3D Orders',
      onClick: () => navigate('/customer/orders'),
    },
    {
      key: 'checkout-new',
      icon: <ArrowRightOutlined />,
      label: 'Order Keepsake (Checkout)',
      onClick: () => navigate('/checkout'),
    },
    ...(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPERATOR'
      ? [
          {
            key: 'inventory',
            icon: <AppstoreOutlined />,
            label: 'WMS Inventory Control',
            onClick: () => navigate('/manager/inventory'),
          },
          {
            key: 'print-jobs',
            icon: <CodeSandboxOutlined />,
            label: '3D Print Queue Farm',
            onClick: () => navigate('/manager/print-jobs'),
          },
        ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign Out',
      onClick: handleLogout,
    },
  ];

  return (
    <nav className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="home-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div
          onClick={() => scrollToSection('hero')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
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
          <span className="nav-link" onClick={() => scrollToSection('hero')}>
            Home
          </span>
          <span className="nav-link" onClick={() => scrollToSection('how-it-works')}>
            How It Works
          </span>
          <span className="nav-link" onClick={() => scrollToSection('products')}>
            Products
          </span>
          <span className="nav-link" onClick={() => scrollToSection('experience')}>
            3D Studio
          </span>
          <span className="nav-link" onClick={() => scrollToSection('benefits')}>
            Why Us
          </span>
          <span className="nav-link" onClick={() => scrollToSection('story')}>
            Story
          </span>
        </div>

        {/* Auth CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    backgroundColor: '#6366f1',
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
                  <span style={{ fontSize: '0.7rem', color: '#06b6d4' }}>
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
                Sign In
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/login')}
                icon={<ArrowRightOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: 9999,
                  fontWeight: 600,
                  padding: '0 20px',
                  height: 38,
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                }}
              >
                Get Started
              </Button>
            </Space>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20, color: '#f8fafc' }} />}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CodeSandboxOutlined style={{ color: '#06b6d4', fontSize: 20 }} />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Memento3D Menu</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{
          body: { background: '#090d16', padding: '24px 16px' },
          header: { background: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.08)' },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="nav-link" onClick={() => scrollToSection('hero')} style={{ fontSize: '1.1rem' }}>
            Home
          </div>
          <div className="nav-link" onClick={() => scrollToSection('how-it-works')} style={{ fontSize: '1.1rem' }}>
            How It Works
          </div>
          <div className="nav-link" onClick={() => scrollToSection('products')} style={{ fontSize: '1.1rem' }}>
            Product Collection
          </div>
          <div className="nav-link" onClick={() => scrollToSection('experience')} style={{ fontSize: '1.1rem' }}>
            Interactive 3D Studio
          </div>
          <div className="nav-link" onClick={() => scrollToSection('benefits')} style={{ fontSize: '1.1rem' }}>
            Why Memento3D
          </div>
          <div className="nav-link" onClick={() => scrollToSection('story')} style={{ fontSize: '1.1rem' }}>
            Our Story
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

          {isAuthenticated ? (
            <Button
              type="primary"
              block
              icon={<DashboardOutlined />}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(dashboardRoute);
              }}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                height: 44,
                borderRadius: 10,
              }}
            >
              Open Workspace Portal
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button
                type="primary"
                block
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  height: 44,
                  borderRadius: 10,
                }}
              >
                Get Started
              </Button>
              <Button
                block
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  height: 44,
                  borderRadius: 10,
                }}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      <style>{`
        @media (min-width: 868px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 867px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </nav>
  );
};
