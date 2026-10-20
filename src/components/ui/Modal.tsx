import React from 'react';
import { Modal as AntdModal } from 'antd';
import type { ModalProps as AntdModalProps } from 'antd';

export interface ModalProps extends AntdModalProps {
  description?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  children,
  centered = true,
  width = 560,
  className = '',
  style = {},
  ...rest
}) => {
  return (
    <AntdModal
      title={
        title ? (
          <div style={{ marginBottom: description ? 8 : 0 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {title}
            </div>
            {description && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 400, marginTop: 4 }}>
                {description}
              </div>
            )}
          </div>
        ) : null
      }
      centered={centered}
      width={width}
      className={`atelier-modal ${className}`}
      style={{
        maxWidth: 'calc(100vw - 32px)',
        margin: '16px auto',
        ...style,
      }}
      {...rest}
    >
      <div style={{ marginTop: 12 }}>
        {children}
      </div>
    </AntdModal>
  );
};
