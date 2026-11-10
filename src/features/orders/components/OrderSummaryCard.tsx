import React from 'react';
import { Card, Button, Tag } from 'antd';
import {
  EyeOutlined,
  CreditCardOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { OrderResponse } from '../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import { canCustomerCancel } from '../utils/orderStateMachine';
import { isWorkshopOrder, hasPendingQuotation, hasAcceptedQuotation } from '../utils/orderQuotation';

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
  const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
  const pendingQuote = hasPendingQuotation(order);
  const isEligibleToPay = !isPaid && (order.totalAmount ?? order.totalPrice) > 0 &&
    (order.status === 'PENDING_PAYMENT' || order.status === 'PENDING') &&
    (!isWorkshopOrder(order) || hasAcceptedQuotation(order));

  // Representative Product Details
  const items = order.items || [];
  const firstItem = items.length > 0 ? items[0] : null;
  const totalItemCount = order.itemCount || items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  const productName =
    order.representativeProductName ||
    firstItem?.productName ||
    firstItem?.productNameSnapshot ||
    (order.scanId ? 'Kỷ vật 3D Chân dung (Scan AI)' : 'Kỷ vật 3D chế tác Memento3D');

  const productThumbnail =
    order.representativeThumbnailUrl ||
    firstItem?.thumbnailUrl ||
    firstItem?.thumbnailSnapshot;

  const categoryName = firstItem?.categoryName;
  const material = firstItem?.material && firstItem.material !== 'Chưa xác định' ? firstItem.material : null;
  const dimensions = firstItem?.dimensions && firstItem.dimensions !== 'Chưa xác định' ? firstItem.dimensions : null;
  const extraItemsCount = Math.max(0, items.length - 1);

  return (
    <Card
      hoverable
      onClick={() => navigate(detailUrl)}
      className="order-summary-card"
      styles={{ body: { padding: '18px 20px' } }}
    >
      {/* Top Header: Order Code, Badges, Date */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            #{order.orderCode || order.id.slice(0, 8).toUpperCase()}
          </span>

          <OrderStatusBadge status={order.status} />
          {pendingQuote && <Tag color="purple">Có báo giá mới · Chờ bạn duyệt</Tag>}

          {/* Payment Status Tag */}
          <Tag
            style={{
              borderRadius: 9999,
              padding: '2px 10px',
              fontWeight: 600,
              fontSize: '0.725rem',
              border: isPaid
                ? '1px solid var(--success-border)'
                : order.paymentMethod === 'CASH'
                ? '1px solid var(--info-border)'
                : '1px solid var(--warning-border)',
              background: isPaid
                ? 'var(--success-bg)'
                : order.paymentMethod === 'CASH'
                ? 'var(--info-bg)'
                : 'var(--warning-bg)',
              color: isPaid
                ? 'var(--text-on-success)'
                : order.paymentMethod === 'CASH'
                ? 'var(--info-text)'
                : 'var(--warning-text)',
              margin: 0,
            }}
          >
            {isPaid ? 'ĐÃ THANH TOÁN' : pendingQuote ? 'CHỜ DUYỆT BÁO GIÁ' : isWorkshopOrder(order) && !hasAcceptedQuotation(order) ? 'CHỜ XƯỞNG THẨM ĐỊNH' : order.paymentMethod === 'CASH' ? 'TIỀN MẶT (COD)' : 'CHỜ THANH TOÁN'}
          </Tag>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <CalendarOutlined />
          <span>{formatOrderDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Middle Body: Representative Product & Logistics */}
      <div className="order-summary-grid">
        {/* Representative Image */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--surface-container)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {productThumbnail ? (
            <img
              src={productThumbnail}
              alt={productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <InboxOutlined style={{ fontSize: 28, color: 'var(--primary)' }} />
          )}
        </div>

        {/* Product Details & Recipient Summary */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 420,
              }}
            >
              {productName}
            </h4>

            {categoryName && (
              <Tag
                style={{
                  borderRadius: 6,
                  padding: '1px 8px',
                  fontSize: '0.725rem',
                  border: '1px solid var(--primary-glow)',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  margin: 0,
                }}
              >
                {categoryName}
              </Tag>
            )}

            {extraItemsCount > 0 && (
              <Tag
                style={{
                  borderRadius: 6,
                  padding: '1px 8px',
                  fontSize: '0.725rem',
                  border: '1px solid var(--border-default)',
                  background: 'var(--surface-container)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                +{extraItemsCount} sản phẩm khác
              </Tag>
            )}
          </div>

          {/* Material & Dimensions Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
            {material && (
              <span>
                Vật liệu: <strong style={{ color: 'var(--text-primary)' }}>{material}</strong>
              </span>
            )}
            {dimensions && (
              <span>
                Kích thước: <strong style={{ color: 'var(--text-primary)' }}>{dimensions}</strong>
              </span>
            )}
            <span>
              Số lượng: <strong style={{ color: 'var(--text-primary)' }}>{totalItemCount || 1}</strong>
            </span>
          </div>

          {/* Delivery Recipient Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <UserOutlined style={{ color: 'var(--primary)' }} />
              {order.recipientName || 'Chưa cung cấp'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <PhoneOutlined style={{ color: 'var(--info)' }} />
              {order.phone || 'Chưa cung cấp'}
            </span>
          </div>
        </div>

        {/* Total Price Block */}
        <div className="order-summary-price">
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Tổng thanh toán
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatCurrency(order.totalPrice, order.currency)}
          </div>
          {order.shippingCarrier && (
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {order.shippingCarrier}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 10,
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onPay && isEligibleToPay && !isManagerView && (
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => onPay(order)}
            style={{
              height: 36,
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: 'var(--text-on-primary)',
              fontWeight: 600,
              fontSize: '0.825rem',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(124, 92, 252, 0.25)',
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
              height: 36,
              borderRadius: 8,
              fontSize: '0.825rem',
            }}
          >
            Hủy đơn
          </Button>
        )}

        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(detailUrl)}
          style={{
            height: 36,
            background: 'var(--surface-container)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
            borderRadius: 8,
            fontSize: '0.825rem',
          }}
        >
          {pendingQuote && !isManagerView ? 'Xem & duyệt báo giá' : 'Xem chi tiết'}
        </Button>
      </div>
    </Card>
  );
};

