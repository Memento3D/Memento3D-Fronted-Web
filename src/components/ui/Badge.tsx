import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'mint' | 'lavender' | 'peach' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  style = {},
}) => {
  const variantStyles: Record<
    'primary' | 'mint' | 'lavender' | 'peach' | 'error' | 'neutral',
    { bg: string; color: string; border: string; dot: string }
  > = {
    primary: {
      bg: 'var(--primary-subtle)',
      color: 'var(--color-primary)',
      border: 'var(--primary-glow)',
      dot: 'var(--color-primary)',
    },
    mint: {
      bg: 'var(--success-bg, #C9E8D5)',
      color: 'var(--text-on-success, #1E3B2C)',
      border: 'var(--success-border, #A5D7B7)',
      dot: 'var(--color-success)',
    },
    lavender: {
      bg: 'var(--info-bg, #ECE3FF)',
      color: 'var(--color-info)',
      border: 'var(--info-border, #DDD6F7)',
      dot: 'var(--color-info)',
    },
    peach: {
      bg: 'var(--secondary-container, #FFE5DF)',
      color: 'var(--text-on-secondary, #7A3E2D)',
      border: 'var(--secondary, #FFBFAE)',
      dot: '#E2765A',
    },
    error: {
      bg: 'var(--danger-bg, #FFDAD6)',
      color: 'var(--color-danger)',
      border: 'var(--danger-border, #FFB4AB)',
      dot: 'var(--color-danger)',
    },
    neutral: {
      bg: 'var(--neutral-chip-bg, #F1EBFF)',
      color: 'var(--color-text-secondary)',
      border: 'var(--border-color)',
      dot: 'var(--text-muted)',
    },
  };

  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <span
      className={`atelier-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '0.725rem' : '0.8rem',
        fontWeight: 600,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: v.dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};
