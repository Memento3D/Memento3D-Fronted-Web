import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { Cpu, ShieldCheck } from 'lucide-react';
import type { ActorPortalConfig } from '../types/auth.types';

const { Title, Paragraph } = Typography;

interface AuthLayoutProps {
  portalConfig: ActorPortalConfig;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ portalConfig, children }) => {
  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Main Auth Container */}
      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1 }} className="animate-enter">
        {/* Branding & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 16,
            }}
          >
            <Cpu size={26} color="#FFFFFF" />
          </div>

          <div style={{ marginBottom: 8 }}>
            <Tag
              style={{
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '3px 12px',
                borderRadius: 'var(--radius-sm, 4px)',
                background: 'var(--surface-container)',
                color: 'var(--primary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.725rem',
              }}
            >
              {portalConfig.badge}
            </Tag>
          </div>

          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            {portalConfig.title}
          </Title>

          <Paragraph
            style={{
              color: 'var(--text-secondary)',
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-modal, 12px)',
            boxShadow: 'var(--shadow-card)',
          }}
          bodyStyle={{ padding: '28px 24px' }}
        >
          {children}
        </Card>

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
