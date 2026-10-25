import React from 'react';
import { Tag } from 'antd';
import type { OrderStatus } from '../types/order.types';
import { ORDER_STATUS_CONFIG } from '../utils/orderFormatters';
import { useTheme } from '../../../contexts/ThemeContext';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  style?: React.CSSProperties;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, style }) => {
  const { isDark } = useTheme();
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: '#64748b',
    description: '',
  };

  // Harmonized theme colors ensuring WCAG AA contrast in both modes
  const getBadgeColors = () => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
      case 'READY':
        return isDark
          ? { bg: 'rgba(142, 195, 163, 0.16)', text: '#86efac', border: 'rgba(142, 195, 163, 0.35)' }
          : { bg: 'rgba(70, 98, 83, 0.12)', text: '#166534', border: 'rgba(70, 98, 83, 0.25)' };

      case 'PENDING_PAYMENT':
      case 'MODEL_APPROVAL_PENDING':
        return isDark
          ? { bg: 'rgba(255, 186, 122, 0.15)', text: '#fcd34d', border: 'rgba(255, 186, 122, 0.3)' }
          : { bg: 'rgba(180, 83, 9, 0.1)', text: '#92400e', border: 'rgba(180, 83, 9, 0.25)' };

      case 'CANCELLED':
        return isDark
          ? { bg: 'rgba(255, 180, 171, 0.16)', text: '#fca5a5', border: 'rgba(255, 180, 171, 0.35)' }
          : { bg: 'rgba(186, 26, 26, 0.1)', text: '#991b1b', border: 'rgba(186, 26, 26, 0.25)' };

      case 'PRINTING':
      case 'CONFIRMED':
      case 'SHIPPED':
      case 'PROCESSING':
      case 'PENDING':
      default:
        return isDark
          ? { bg: 'rgba(182, 163, 255, 0.16)', text: '#c4b5fd', border: 'rgba(182, 163, 255, 0.35)' }
          : { bg: 'rgba(124, 92, 252, 0.1)', text: '#5b21b6', border: 'rgba(124, 92, 252, 0.25)' };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <Tag
      style={{
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        fontWeight: 600,
        fontSize: '0.725rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: badgeColors.bg,
        color: badgeColors.text,
        border: `1px solid ${badgeColors.border}`,
        margin: 0,
        ...style,
      }}
    >
      {config.label}
    </Tag>
  );
};
