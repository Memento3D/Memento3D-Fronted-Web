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
        background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting effects */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: portalConfig.accentGradient,
          filter: 'blur(160px)',
          opacity: 0.15,
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* Main Auth Container */}
      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}>
        {/* Branding & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: portalConfig.accentGradient,
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
              marginBottom: 16,
            }}
          >
            <Cpu size={28} color="#ffffff" />
          </div>

          <div style={{ marginBottom: 6 }}>
            <Tag
              color={portalConfig.badgeColor}
              style={{
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '2px 10px',
                borderRadius: '6px',
                border: 'none',
              }}
            >
              {portalConfig.badge}
            </Tag>
          </div>

          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {portalConfig.title}
          </Title>

          <Paragraph
            style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
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
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          }}
          bodyStyle={{ padding: '32px 28px' }}
        >
          {children}
        </Card>

        {/* Portal Quick Switcher for All Actors */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Chuyển đổi cổng truy cập tác nhân:
          </Text>
          <Space size={[8, 6]} wrap style={{ justifyContent: 'center' }}>
            {[
              { actor: 'customer', path: '/login', label: 'Khách hàng', color: '#38bdf8' },
              { actor: 'warehouse', path: '/warehouse/login', label: 'Thủ kho', color: '#06b6d4' },
              { actor: 'operator', path: '/operator/login', label: 'Kỹ thuật viên', color: '#a855f7' },
              { actor: 'manager', path: '/manager/login', label: 'Quản lý', color: '#f59e0b' },
              { actor: 'admin', path: '/admin/login', label: 'Quản trị viên', color: '#f97316' },
              { actor: 'provider', path: '/provider/login', label: 'Đối tác 3D', color: '#3b82f6' },
              { actor: 'driver', path: '/driver/login', label: 'Tài xế', color: '#10b981' },
            ].map((item, idx, arr) => {
              const isActive = portalConfig.actor === item.actor;
              return (
                <React.Fragment key={item.actor}>
                  <Link
                    to={item.path}
                    style={{
                      fontSize: '0.75rem',
                      color: isActive ? '#ffffff' : item.color,
                      fontWeight: isActive ? 700 : 500,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      border: isActive ? `1px solid ${item.color}` : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </Link>
                  {idx < arr.length - 1 && <span style={{ color: '#334155' }}>•</span>}
                </React.Fragment>
              );
            })}
          </Space>
        </div>

        {/* Security Footer */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space size={6} style={{ color: '#64748b', fontSize: '0.75rem' }}>
            <ShieldCheck orientation="vertical" size={14} color="#10b981" />
            <span>Hệ thống bảo mật Spring Security 6.x & Chuẩn CSDL ACID</span>
          </Space>
        </div>
      </div>
    </div>
  );
};
