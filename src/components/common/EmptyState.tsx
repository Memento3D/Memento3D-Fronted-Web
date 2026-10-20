import React from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có thông tin hoặc mục nào được tạo trong phần này.',
  icon,
  actionText,
  onAction,
  style = {},
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px dashed var(--border-color, #E2D9F7)',
        borderRadius: 'var(--radius-card, 24px)',
        boxShadow: 'var(--shadow-card)',
        margin: '16px 0',
        ...style,
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'var(--surface-container, #F1EBFF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary, #7C5CFC)',
          fontSize: 28,
          boxShadow: '0 4px 14px var(--primary-glow)',
        }}
      >
        {icon || <InboxOutlined />}
      </div>

      <h3
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          maxWidth: 440,
          margin: '0 auto 20px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <Button
          type="primary"
          onClick={onAction}
          style={{
            borderRadius: '9999px',
            fontWeight: 600,
            padding: '0 24px',
            height: 40,
            background: 'var(--primary)',
            borderColor: 'var(--primary)',
          }}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
