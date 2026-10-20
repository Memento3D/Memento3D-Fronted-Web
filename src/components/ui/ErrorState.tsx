import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi khi tải dữ liệu',
  message = 'Không thể kết nối đến máy chủ hoặc dữ liệu không tồn tại. Vui lòng thử lại.',
  onRetry,
  retryText = 'Thử lại ngay',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`error-state-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--danger-border, #FFB4AB)',
        boxShadow: 'var(--shadow-card)',
        margin: '16px 0',
        gap: '16px',
        ...style,
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--danger-bg, #FFDAD6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)',
        }}
      >
        <AlertCircle size={32} />
      </div>

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: 460, margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="danger"
          size="md"
          onClick={onRetry}
          leftIcon={<RotateCcw size={15} />}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};
