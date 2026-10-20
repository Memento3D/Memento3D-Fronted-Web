import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck } from 'lucide-react';
import type { ActorPortalConfig } from '../types/auth.types';

const { Title, Text, Paragraph } = Typography;

interface AuthLayoutProps {
  portalConfig: ActorPortalConfig;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ portalConfig, children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-app, #F8F5FF)',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(124, 92, 252, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 80% 25%, rgba(255, 191, 174, 0.1) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(201, 232, 213, 0.08) 0%, transparent 50%)
        `,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting effects */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.15) 0%, rgba(255, 191, 174, 0.12) 100%)',
          filter: 'blur(120px)',
          opacity: 0.8,
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* Main Auth Container */}
      <div style={{ width: '100%', maxWidth: '460px', zIndex: 1 }} className="animate-enter">
        {/* Branding & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary, #7C5CFC) 0%, var(--primary-system, #5F3ADD) 100%)',
              boxShadow: '0 8px 24px var(--primary-glow)',
              marginBottom: 16,
            }}
          >
            <Cpu size={30} color="#FFFFFF" />
          </div>

          <div style={{ marginBottom: 8 }}>
            <Tag
              color="purple"
              style={{
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 14px',
                borderRadius: '9999px',
                background: 'var(--surface-container, #F1EBFF)',
                color: 'var(--primary-system, #5F3ADD)',
                border: '1px solid var(--border-color, #E2D9F7)',
              }}
            >
              {portalConfig.badge}
            </Tag>
          </div>

          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {portalConfig.title}
          </Title>

          <Paragraph
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {portalConfig.subtitle}
          </Paragraph>
        </div>

        {/* Form Card */}
        <Card
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2D9F7)',
            borderRadius: 'var(--radius-modal, 28px)',
            boxShadow: 'var(--shadow-floating)',
          }}
          bodyStyle={{ padding: '36px 32px' }}
        >
          {children}
        </Card>

        {/* Portal Quick Switcher for All Actors */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            background: 'var(--surface-container, #F1EBFF)',
            border: '1px solid var(--border-color, #E2D9F7)',
            borderRadius: '20px',
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Chuyển đổi cổng truy cập tác nhân:
          </Text>
          <Space size={[8, 6]} wrap style={{ justifyContent: 'center' }}>
            {[
              { actor: 'customer', path: '/login', label: 'Khách hàng', color: '#7C5CFC' },
              { actor: 'warehouse', path: '/warehouse/login', label: 'Thủ kho', color: '#5F3ADD' },
              { actor: 'operator', path: '/operator/login', label: 'Kỹ thuật viên', color: '#7857F8' },
              { actor: 'manager', path: '/manager/login', label: 'Quản lý', color: '#466253' },
              { actor: 'admin', path: '/admin/login', label: 'Quản trị viên', color: '#B35C00' },
              { actor: 'provider', path: '/provider/login', label: 'Đối tác 3D', color: '#7C5CFC' },
              { actor: 'driver', path: '/driver/login', label: 'Tài xế', color: '#466253' },
            ].map((item, idx, arr) => {
              const isActive = portalConfig.actor === item.actor;
              return (
                <React.Fragment key={item.actor}>
                  <Link
                    to={item.path}
                    style={{
                      fontSize: '0.75rem',
                      color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: isActive ? 700 : 500,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: isActive ? 'var(--primary, #7C5CFC)' : 'transparent',
                      border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                  {idx < arr.length - 1 && <span style={{ color: 'var(--border-secondary)' }}>•</span>}
                </React.Fragment>
              );
            })}
          </Space>
        </div>

        {/* Security Footer */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space size={6} style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
            <ShieldCheck size={14} color="var(--tertiary, #466253)" />
            <span>Hệ thống bảo mật Spring Security 6.x & Chuẩn CSDL ACID</span>
          </Space>
        </div>
      </div>
    </div>
  );
};
