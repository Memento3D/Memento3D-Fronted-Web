import React from 'react';
import { Skeleton } from 'antd';

export interface HomeStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

export const HomeStatCard: React.FC<HomeStatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconBg = 'rgba(14, 165, 233, 0.15)',
  iconColor = 'var(--primary)',
  loading = false,
  onClick,
}) => {
  if (loading) {
    return (
      <div className="stat-card" style={{ cursor: 'default' }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div className="stat-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div
          className="stat-card-icon"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>
    </div>
  );
};
