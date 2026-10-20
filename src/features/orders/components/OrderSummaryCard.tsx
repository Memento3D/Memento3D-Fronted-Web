import React from 'react';
import { Card, Button } from 'antd';
import {
  EyeOutlined,
  CreditCardOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { OrderResponse } from '../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import { canCustomerCancel } from '../utils/orderStateMachine';

interface OrderSummaryCardProps {
  order: OrderResponse;
  onPay?: (order: OrderResponse) => void;
  onCancel?: (order: OrderResponse) => void;
  isManagerView?: boolean;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  order,
  onPay,
  onCancel,
  isManagerView = false,
}) => {
  const navigate = useNavigate();
  const detailUrl = isManagerView ? `/manager/orders/${order.id}` : `/customer/orders/${order.id}`;

  const isEligibleToCancel = canCustomerCancel(order.status) || isManagerView;
  const isEligibleToPay = order.status === 'PENDING_PAYMENT';

  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        marginBottom: 16,
        boxShadow: 'var(--shadow-card)',
      }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <CalendarOutlined />
            <span>Ngày tạo: {formatOrderDate(order.createdAt)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Tổng thanh toán
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatCurrency(order.totalPrice, order.currency)}
          </div>
        </div>
      </div>

      <div
        style={{
          margin: '16px 0',
          padding: '12px 14px',
          background: 'var(--surface-container)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-default)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
          <UserOutlined style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Người nhận:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.recipientName || 'Chưa cung cấp'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
          <PhoneOutlined style={{ color: 'var(--tertiary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Điện thoại:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.phone || 'Chưa cung cấp'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', gridColumn: '1 / -1' }}>
          <EnvironmentOutlined style={{ color: 'var(--primary-system)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Địa chỉ:</span>
          <span style={{ color: 'var(--text-primary)' }}>{order.shippingAddress || 'Chưa cung cấp'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {onPay && isEligibleToPay && !isManagerView && (
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => onPay(order)}
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 12px rgba(124, 92, 252, 0.25)',
            }}
          >
            Thanh toán ngay
          </Button>
        )}

        {onCancel && isEligibleToCancel && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => onCancel(order)}
            style={{
              borderRadius: 'var(--radius-full)',
            }}
          >
            Hủy đơn
          </Button>
        )}

        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(detailUrl)}
          style={{
            background: 'var(--surface-container)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          Chi tiết đơn hàng
        </Button>
      </div>
    </Card>
  );
};
