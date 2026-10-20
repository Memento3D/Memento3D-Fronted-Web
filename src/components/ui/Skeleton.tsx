import React from 'react';
import { Skeleton as AntdSkeleton } from 'antd';

export interface SkeletonProps {
  type?: 'card' | 'table' | 'text' | 'avatar' | 'custom';
  rows?: number;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  rows = 4,
  active = true,
  className = '',
  style = {},
}) => {
  if (type === 'card') {
    return (
      <div
        className={`skeleton-card-container ${className}`}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 24px)',
          padding: '24px',
          ...style,
        }}
      >
        <AntdSkeleton active={active} avatar paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div
        className={`skeleton-table-container ${className}`}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 24px)',
          padding: '24px',
          ...style,
        }}
      >
        <AntdSkeleton active={active} paragraph={{ rows }} title={{ width: '40%' }} />
      </div>
    );
  }

  return <AntdSkeleton active={active} paragraph={{ rows }} className={className} style={style} />;
};
