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
        background: 'linear-gradient(160deg, rgba(18, 25, 41, 0.7) 0%, rgba(11, 16, 28, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        marginBottom: 16,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.8rem' }}>
            <CalendarOutlined />
            <span>Ngày tạo: {formatOrderDate(order.createdAt)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Tổng thanh toán
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
            {formatCurrency(order.totalPrice, order.currency)}
          </div>
        </div>
      </div>

      <div
        style={{
          margin: '16px 0',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
          <UserOutlined style={{ color: '#06b6d4' }} />
          <span style={{ color: '#94a3b8' }}>Người nhận:</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{order.recipientName || 'Chưa cung cấp'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
          <PhoneOutlined style={{ color: '#10b981' }} />
          <span style={{ color: '#94a3b8' }}>Điện thoại:</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{order.phone || 'Chưa cung cấp'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', gridColumn: '1 / -1' }}>
          <EnvironmentOutlined style={{ color: '#f59e0b' }} />
          <span style={{ color: '#94a3b8' }}>Địa chỉ:</span>
          <span style={{ color: '#cbd5e1' }}>{order.shippingAddress || 'Chưa cung cấp'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {onPay && isEligibleToPay && !isManagerView && (
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => onPay(order)}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              borderColor: 'transparent',
              fontWeight: 600,
              borderRadius: 8,
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
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
            }}
          >
            Hủy đơn
          </Button>
        )}

        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(detailUrl)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            borderRadius: 8,
          }}
        >
          Chi tiết đơn hàng
        </Button>
      </div>
    </Card>
  );
};
