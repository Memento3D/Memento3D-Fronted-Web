import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ProductErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ProductErrorState: React.FC<ProductErrorStateProps> = ({
  title = 'Không thể tải sản phẩm',
  message = 'Đã xảy ra sự cố khi kết nối đến máy chủ. Vui lòng thử lại sau giây lát.',
  onRetry,
  retryText = 'Thử lại',
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto 16px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
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
          maxWidth: 420,
          margin: '0 auto 24px',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={{
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            padding: '0 20px',
            height: 38,
          }}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ProductErrorState;
