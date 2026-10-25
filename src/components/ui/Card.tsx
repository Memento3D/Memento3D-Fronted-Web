import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  extra,
  footer,
  children,
  hoverable = false,
  glass = false,
  padding = 'md',
  className = '',
  style = {},
  ...rest
}) => {
  const paddingMap = {
    none: 0,
    sm: '14px 16px',
    md: '18px 20px',
    lg: '24px',
  };

  return (
    <div
      className={`atelier-card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={{
        background: glass ? 'var(--glass-bg)' : 'var(--color-surface)',
        backdropFilter: glass ? 'var(--glass-blur)' : undefined,
        WebkitBackdropFilter: glass ? 'var(--glass-blur)' : undefined,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card, 10px)',
        boxShadow: 'var(--shadow-card)',
        padding: paddingMap[padding],
        transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {(title || extra) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {subtitle}
              </div>
            )}
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}

      <div style={{ flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
