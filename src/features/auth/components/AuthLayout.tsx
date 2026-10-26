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

        {/* Portal Quick Switcher for All Actors */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            background: 'var(--surface-container)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card, 10px)',
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
