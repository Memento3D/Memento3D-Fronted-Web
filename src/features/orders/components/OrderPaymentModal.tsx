import React, { useState } from 'react';
import { Modal, Radio, Button, message, Alert, Spin } from 'antd';
import {
  QrcodeOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { OrderResponse, PaymentMethod, PaymentResponse } from '../types/order.types';
import { usePaymentStatus } from '../hooks/useOrderPayment';
import { paymentApi } from '../api/paymentApi';
import { formatCurrency } from '../utils/orderFormatters';

interface OrderPaymentModalProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const OrderPaymentModal: React.FC<OrderPaymentModalProps> = ({
  order,
  open,
  onClose,
  onPaymentSuccess,
}) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>('VNPAY');
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: pollStatus } = usePaymentStatus(activePayment?.paymentId);

  React.useEffect(() => {
    if (pollStatus?.status === 'SUCCESS' || pollStatus?.status === 'PAID') {
      message.success('Thanh toán đơn hàng thành công!');
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
      if (order?.id) {
        navigate(`/orders/${order.id}`);
      }
    }
  }, [pollStatus, onPaymentSuccess, onClose, order?.id, navigate]);

  if (!order) return null;

  const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
  const totalAmount = order.totalAmount ?? order.totalPrice;

  const handleInitiatePayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (method === 'CASH') {
        // Cash payment does not call external gateway
        const res = await paymentApi.payOrder(order.id, 'CASH');
        setActivePayment(res);
        message.success('Đã chọn phương thức thanh toán Tiền mặt. Đơn hàng đang được xử lý!');
        if (onPaymentSuccess) onPaymentSuccess();
        onClose();
        navigate(`/orders/${order.id}`);
        return;
      }

      if (method === 'VNPAY') {
        message.loading({ content: 'Đang khởi tạo giao dịch VNPAY...', key: 'vnpay-modal-loading', duration: 3 });
        const vnpayRes = await paymentApi.createVnpayPayment(order.id);
        if (vnpayRes.paymentUrl) {
          window.location.assign(vnpayRes.paymentUrl);
          return;
        }
      }

      // MOMO or ZALOPAY
      const response = await paymentApi.payOrder(order.id, method);
      setActivePayment(response);
      message.info('Đã khởi tạo giao dịch thanh toán.');

      if (response.paymentUrl) {
        window.open(response.paymentUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      message.error(err.message || 'Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setActivePayment(null);
        onClose();
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <QrcodeOutlined style={{ color: 'var(--primary)' }} />
          <span>Thanh toán đơn hàng #{orderCode}</span>
        </div>
      }
      footer={null}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        <div
          style={{
            background: 'var(--surface-container)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-default)',
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Mã đơn hàng:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>#{orderCode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Số tiền thanh toán:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(totalAmount, order.currency || 'VND')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Người nhận:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.recipientName}</span>
          </div>
        </div>

        {!activePayment ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              Chọn phương thức thanh toán:
            </div>

            <Radio.Group
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}
            >
              {/* 1. VNPAY */}
              <Radio
                value="VNPAY"
                style={{
                  background: method === 'VNPAY' ? 'rgba(0, 92, 185, 0.08)' : 'var(--surface-container)',
                  border: method === 'VNPAY' ? '1.5px solid #005cb9' : '1px solid var(--border-default)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-default)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: '#005cb9' }}>Cổng VNPAY (QR / ATM / Visa)</span>
                    <span style={{ fontSize: '0.7rem', background: '#005cb9', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Khuyên dùng</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Thanh toán an toàn qua cổng VNPAY (VNPAY-QR, Thẻ ATM/Internet Banking, Thẻ quốc tế)
                  </span>
                </div>
              </Radio>

              {/* 2. Tiền mặt / COD */}
              <Radio
                value="CASH"
                style={{
                  background: method === 'CASH' ? 'rgba(201, 232, 213, 0.3)' : 'var(--surface-container)',
                  border: method === 'CASH' ? '1.5px solid var(--tertiary)' : '1px solid var(--border-default)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-default)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarCircleOutlined /> Tiền mặt (COD)
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Thanh toán tiền mặt khi nhận hàng / khi đơn hàng hoàn thành
                  </span>
                </div>
              </Radio>

              {/* 3. Ví MoMo */}
              <Radio
                value="MOMO"
                style={{
                  background: method === 'MOMO' ? 'rgba(216, 45, 139, 0.08)' : 'var(--surface-container)',
                  border: method === 'MOMO' ? '1.5px solid #d82d8b' : '1px solid var(--border-default)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-default)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: '#ec4899' }}>Ví MoMo</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Thanh toán qua quét mã QR hoặc ứng dụng MoMo
                  </span>
                </div>
              </Radio>

              {/* 4. Ví ZaloPay */}
              <Radio
                value="ZALOPAY"
                style={{
                  background: method === 'ZALOPAY' ? 'var(--surface-high)' : 'var(--surface-container)',
                  border: method === 'ZALOPAY' ? '1.5px solid var(--primary)' : '1px solid var(--border-default)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-default)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Ví ZaloPay</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Thanh toán qua cổng ZaloPay QR & Thẻ ATM/Visa
                  </span>
                </div>
              </Radio>
            </Radio.Group>

            <Button
              type="primary"
              block
              size="large"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleInitiatePayment}
              style={{
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
              }}
            >
              {method === 'CASH'
                ? 'Xác nhận đặt hàng'
                : method === 'VNPAY'
                  ? 'Thanh toán với VNPAY'
                  : 'Tiến hành thanh toán'}
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Alert
              message="Giao dịch đang chờ thanh toán"
              description="Vui lòng hoàn tất thanh toán trên cổng đối tác. Hệ thống tự động ghi nhận khi thanh toán hoàn tất."
              type="info"
              showIcon
              icon={<ClockCircleOutlined />}
              style={{ marginBottom: 20, textAlign: 'left', borderRadius: 'var(--radius-default)', background: 'var(--surface-container)', border: '1px solid var(--border-default)' }}
            />

            {activePayment.qrCodeUrl && (
              <div style={{ margin: '16px 0' }}>
                <img
                  src={activePayment.qrCodeUrl}
                  alt="Payment QR"
                  style={{ width: 180, height: 180, borderRadius: 'var(--radius-default)', border: '2px solid var(--border-default)' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  Quét mã QR bằng ứng dụng ngân hàng hoặc ví
                </div>
              </div>
            )}

            {activePayment.paymentUrl && (
              <Button
                type="primary"
                icon={<LinkOutlined />}
                href={activePayment.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  marginRight: 8,
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(124, 92, 252, 0.25)',
                }}
              >
                Mở trang thanh toán ({activePayment.paymentMethod})
              </Button>
            )}

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <Spin size="small" />
              <span>Đang lắng nghe xác nhận từ ngân hàng...</span>
            </div>

            <Button
              style={{ marginTop: 16, borderRadius: 'var(--radius-full)' }}
              onClick={() => {
                onClose();
                navigate(`/orders/${order.id}`);
              }}
            >
              Xem chi tiết đơn hàng
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
