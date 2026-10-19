import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface QuickActionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  onClick: () => void;
  badge?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  iconBg = 'rgba(14, 165, 233, 0.12)',
  iconColor = 'var(--primary)',
  onClick,
  badge,
}) => {
  return (
    <div className="quick-action-card" onClick={onClick} role="button" tabIndex={0}>
      <div
        className="quick-action-icon"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="quick-action-text">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="quick-action-title">{title}</span>
          {badge && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {description && <div className="quick-action-desc">{description}</div>}
      </div>
      <ArrowUpRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
    </div>
  );
};
