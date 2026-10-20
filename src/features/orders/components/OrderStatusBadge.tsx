import React from 'react';
import { Tag } from 'antd';
import type { OrderStatus } from '../types/order.types';
import { ORDER_STATUS_CONFIG } from '../utils/orderFormatters';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  style?: React.CSSProperties;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, style }) => {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: '#64748b',
    description: '',
  };

  return (
    <Tag
      style={{
        borderRadius: 'var(--radius-full)',
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: `${config.color}15`,
        color: config.textColor || config.color,
        border: `1px solid ${config.color}35`,
        margin: 0,
        ...style,
      }}
    >
      {config.label}
    </Tag>
  );
};
