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

        {/* Portal Quick Switcher */}
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: 6 }}>
            Chuyển đổi cổng truy cập:
          </Text>
          <Space size={[8, 4]} wrap style={{ justifyContent: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Khách hàng</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link to="/warehouse/login" style={{ fontSize: '0.75rem', color: '#06b6d4' }}>Thủ kho</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link to="/operator/login" style={{ fontSize: '0.75rem', color: '#a855f7' }}>Kỹ thuật viên</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link to="/manager/login" style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Quản lý</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link to="/admin/login" style={{ fontSize: '0.75rem', color: '#f97316' }}>Quản trị viên</Link>
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
