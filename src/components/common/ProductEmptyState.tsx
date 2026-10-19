import React from 'react';
import { Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

interface ProductEmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetText?: string;
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({
  title = 'Không tìm thấy sản phẩm phù hợp',
  message = 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc chọn danh mục khác.',
  onReset,
  resetText = 'Xóa bộ lọc',
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        background: 'var(--bg-card)',
        border: '1px dashed var(--border-color)',
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
          background: 'rgba(14, 165, 233, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
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

      {onReset && (
        <Button
          type="primary"
          icon={<ClearOutlined />}
          onClick={onReset}
          style={{
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            padding: '0 20px',
            height: 38,
          }}
        >
          {resetText}
        </Button>
      )}
    </div>
  );
};

export default ProductEmptyState;
