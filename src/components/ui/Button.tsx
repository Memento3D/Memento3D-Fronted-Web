import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'peach' | 'soft' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  style = {},
  ...rest
}) => {
  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '0.8rem', height: 32, gap: 6 },
    md: { padding: '9px 20px', fontSize: '0.875rem', height: 40, gap: 8 },
    lg: { padding: '12px 28px', fontSize: '1rem', height: 48, gap: 10 },
  };

  const variantClassMap: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    peach: 'btn-peach',
    soft: 'btn-soft',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn-ghost',
  };

  return (
    <button
      className={`btn ${variantClassMap[variant] || 'btn-primary'} ${className}`}
      disabled={disabled || isLoading}
      style={{
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {isLoading ? (
        <Spin indicator={<LoadingOutlined style={{ fontSize: size === 'sm' ? 14 : 16, color: 'currentColor' }} spin />} />
      ) : (
        leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>
      )}
    </button>
  );
};
