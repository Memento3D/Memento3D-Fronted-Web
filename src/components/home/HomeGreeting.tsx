import React from 'react';
import { Tag } from 'antd';
import { getGreeting } from '../../utils/getGreeting';
import { getRoleLabel } from '../../locales/i18n';
import type { User } from '../../features/auth/types/auth.types';

export interface HomeGreetingProps {
  user: User | null;
  subtitle?: string;
  badgeLabel?: string;
  badgeColor?: string;
  actionContent?: React.ReactNode;
}

export const HomeGreeting: React.FC<HomeGreetingProps> = ({
  user,
  subtitle,
  badgeLabel,
  badgeColor = 'cyan',
  actionContent,
}) => {
  const { greeting } = getGreeting(user?.fullName || user?.email?.split('@')[0]);
  const roleDisplay = badgeLabel || getRoleLabel(user?.role);

  return (
    <div className="actor-home-header">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="actor-greeting-title">{greeting}</h1>
          <Tag color={badgeColor} style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
            {roleDisplay}
          </Tag>
        </div>
        {subtitle && <p className="actor-greeting-subtitle">{subtitle}</p>}
      </div>

      {actionContent && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actionContent}</div>}
    </div>
  );
};
