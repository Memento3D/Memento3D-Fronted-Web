import React from 'react';
import { Select as AntdSelect } from 'antd';
import type { SelectProps as AntdSelectProps } from 'antd';

export interface SelectOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends Omit<AntdSelectProps, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required,
  size = 'md',
  fullWidth = true,
  className = '',
  style = {},
  ...rest
}) => {
  const heightMap = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
      }}
      className={`form-field-group ${className}`}
    >
      {label && (
        <label
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ width: '100%' }}>
        <AntdSelect
          status={error ? 'error' : undefined}
          style={{
            width: '100%',
            height: heightMap[size],
            ...style,
          }}
          {...rest}
        />
      </div>

      {error ? (
        <span
          style={{
            fontSize: '0.775rem',
            color: 'var(--color-danger)',
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            fontSize: '0.775rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
