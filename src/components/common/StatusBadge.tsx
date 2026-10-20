import React from 'react';

export type StatusType =
  | 'success'
  | 'pending'
  | 'memory'
  | 'failed'
  | 'neutral'
  | 'active'
  | 'completed'
  | 'processing'
  | 'rejected'
  | 'disabled';

interface StatusBadgeProps {
  status?: string;
  variant?: 'mint' | 'lavender' | 'peach' | 'error' | 'neutral';
  label?: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Resolves a semantic status string into Atelier Forge color tokens:
 * - SUCCESS / COMPLETE / ACTIVE -> Mint (#C9E8D5 / #466253)
 * - PENDING / PROCESSING -> Lavender (#ECE3FF / #5F3ADD)
 * - MEMORY / CREATIVE -> Peach (#FFBFAE / #7A3E2D)
 * - FAILED / REJECTED / CANCELLED -> Error Container (#FFDAD6 / #BA1A1A)
 * - DISABLED / ARCHIVED -> Neutral Lavender Gray (#F1EBFF / #6A6282)
 */
export const resolveStatusVariant = (status?: string): 'mint' | 'lavender' | 'peach' | 'error' | 'neutral' => {
  if (!status) return 'neutral';
  const s = status.toUpperCase().trim();

  // Mint / Success / Active
  if (
    s.includes('SUCCESS') ||
    s.includes('COMPLETE') ||
    s.includes('ACTIVE') ||
    s.includes('READY') ||
    s.includes('DELIVERED') ||
    s.includes('PAID') ||
    s.includes('APPROVED') ||
    s.includes('ONLINE') ||
    s.includes('PASSED') ||
    s.includes('VERIFIED')
  ) {
    return 'mint';
  }

  // Lavender / Pending / Processing
  if (
    s.includes('PROCESS') ||
    s.includes('PRINT') ||
    s.includes('QUEUE') ||
    s.includes('RUNNING') ||
    s.includes('RECONSTRUCT') ||
    s.includes('IN_PROGRESS') ||
    s.includes('TRANSFER') ||
    s.includes('SHIPPED') ||
    s.includes('INFO')
  ) {
    return 'lavender';
  }

  // Peach / Memory / Creative / Special / Warning
  if (
    s.includes('PEND') ||
    s.includes('MEMORY') ||
    s.includes('CREATIVE') ||
    s.includes('KEEPSAKE') ||
    s.includes('STICKER') ||
    s.includes('WARN') ||
    s.includes('DRAFT') ||
    s.includes('UNVERIFIED') ||
    s.includes('WAITING') ||
    s.includes('HOLD')
  ) {
    return 'peach';
  }

  // Error / Failed / Rejected
  if (
    s.includes('FAIL') ||
    s.includes('REJECT') ||
    s.includes('CANCEL') ||
    s.includes('ERROR') ||
    s.includes('DANGER') ||
    s.includes('BLOCKED') ||
    s.includes('DELETED') ||
    s.includes('REFUND')
  ) {
    return 'error';
  }

  // Neutral
  return 'neutral';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  icon,
  dot = true,
  className = '',
  style = {},
}) => {
  const chosenVariant = variant || resolveStatusVariant(status);
  const displayLabel = label || status || 'Trạng thái';

  const variantStyles: Record<
    'mint' | 'lavender' | 'peach' | 'error' | 'neutral',
    { bg: string; color: string; border: string; dotColor: string }
  > = {
    mint: {
      bg: 'var(--success-bg, #C9E8D5)',
      color: 'var(--text-on-success, #1E3B2C)',
      border: 'var(--success-border, #A5D7B7)',
      dotColor: 'var(--tertiary, #466253)',
    },
    lavender: {
      bg: 'var(--info-bg, #ECE3FF)',
      color: 'var(--info-text, #5F3ADD)',
      border: 'var(--info-border, #DDD6F7)',
      dotColor: 'var(--primary, #7C5CFC)',
    },
    peach: {
      bg: 'var(--secondary-container, #FFE5DF)',
      color: '#7A3E2D',
      border: 'var(--secondary, #FFBFAE)',
      dotColor: '#E2765A',
    },
    error: {
      bg: 'var(--danger-bg, #FFDAD6)',
      color: 'var(--text-on-danger, #93000A)',
      border: 'var(--danger-border, #FFB4AB)',
      dotColor: 'var(--error, #BA1A1A)',
    },
    neutral: {
      bg: 'var(--neutral-chip-bg, #F1EBFF)',
      color: 'var(--neutral-chip-text, #6A6282)',
      border: 'var(--neutral-chip-border, #E2D9F7)',
      dotColor: 'var(--text-muted, #8E86A8)',
    },
  };

  const current = variantStyles[chosenVariant];

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '9999px',
        fontSize: '0.775rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: current.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{displayLabel}</span>
    </span>
  );
};
