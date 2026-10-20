import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingStateProps {
  tip?: string;
  minHeight?: number | string;
  style?: React.CSSProperties;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  tip = 'Đang tải dữ liệu Memento3D...',
  minHeight = 240,
  style = {},
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 36,
        color: 'var(--primary, #7C5CFC)',
      }}
      spin
    />
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: '32px 16px',
        background: 'var(--bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-color, #E2D9F7)',
        boxShadow: 'var(--shadow-card)',
        margin: '16px 0',
        gap: '16px',
        ...style,
      }}
    >
      <Spin indicator={antIcon} />
      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-secondary, #6A6282)',
          letterSpacing: '-0.01em',
        }}
      >
        {tip}
      </span>
    </div>
  );
};
