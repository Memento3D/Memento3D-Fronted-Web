import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from 'antd';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  change?: number; // e.g. +12.5 or -3.2
  changeLabel?: string; // e.g. "so với tháng trước"
  suffix?: string;
  prefix?: string;
  loading?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBg = 'var(--primary-subtle)',
  iconColor = 'var(--color-primary)',
  change,
  changeLabel = 'so với kỳ trước',
  suffix,
  prefix,
  loading = false,
  onClick,
  style = {},
}) => {
  const isPositive = change !== undefined && change >= 0;

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 24px)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          minHeight: 140,
          ...style,
        }}
      >
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card, 24px)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        ...style,
      }}
      className={onClick ? 'hoverable-card' : ''}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {prefix && <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>{prefix}</span>}
            <span className="tabular-nums">{value}</span>
            {suffix && <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{suffix}</span>}
          </div>
        </div>

        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-default, 16px)',
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 700,
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
              background: isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? `+${change}%` : `${change}%`}
          </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
