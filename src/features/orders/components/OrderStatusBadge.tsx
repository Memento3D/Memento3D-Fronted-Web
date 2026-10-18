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
        borderRadius: 6,
        padding: '3px 10px',
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: `${config.color}1a`,
        color: config.color,
        border: `1px solid ${config.color}40`,
        margin: 0,
        ...style,
      }}
    >
      {config.label}
    </Tag>
  );
};
