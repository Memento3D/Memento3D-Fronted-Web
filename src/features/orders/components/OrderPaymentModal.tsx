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
  const [method, setMethod] = useState<PaymentMethod>('MOMO');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
          <QrcodeOutlined style={{ color: '#0ea5e9' }} />
          <span>Thanh toán đơn hàng #{orderCode}</span>
        </div>
      }
      footer={null}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8' }}>Mã đơn hàng:</span>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>#{orderCode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8' }}>Số tiền thanh toán:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatCurrency(totalAmount, order.currency || 'VND')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#94a3b8' }}>Người nhận:</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{order.recipientName}</span>
          </div>
        </div>

        {!activePayment ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
              Chọn phương thức thanh toán:
            </div>

            <Radio.Group
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}
            >
              {/* 1. Ví MoMo */}
              <Radio
                value="MOMO"
                style={{
                  background: method === 'MOMO' ? 'rgba(216, 45, 139, 0.15)' : 'rgba(216, 45, 139, 0.05)',
                  border: method === 'MOMO' ? '1px solid #d82d8b' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 16px',
                  borderRadius: 10,
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: '#ec4899' }}>Ví MoMo</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Thanh toán qua quét mã QR hoặc ứng dụng MoMo
                  </span>
                </div>
              </Radio>

              {/* 2. Ví ZaloPay */}
              <Radio
                value="ZALOPAY"
                style={{
                  background: method === 'ZALOPAY' ? 'rgba(0, 104, 255, 0.15)' : 'rgba(0, 104, 255, 0.05)',
                  border: method === 'ZALOPAY' ? '1px solid #0068ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 16px',
                  borderRadius: 10,
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>Ví ZaloPay</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Thanh toán qua cổng ZaloPay QR & Thẻ ATM/Visa
                  </span>
                </div>
              </Radio>

              {/* 3. Tiền mặt */}
              <Radio
                value="CASH"
                style={{
                  background: method === 'CASH' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.05)',
                  border: method === 'CASH' ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 16px',
                  borderRadius: 10,
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarCircleOutlined /> Tiền mặt
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Thanh toán tiền mặt khi nhận hàng / khi đơn hàng hoàn thành
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
                background:
                  method === 'CASH'
                    ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                    : 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                borderColor: 'transparent',
                fontWeight: 700,
                borderRadius: 8,
              }}
            >
              {method === 'CASH' ? 'Xác nhận đặt hàng' : 'Tiến hành thanh toán'}
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
              style={{ marginBottom: 20, textAlign: 'left', borderRadius: 8 }}
            />

            {activePayment.qrCodeUrl && (
              <div style={{ margin: '16px 0' }}>
                <img
                  src={activePayment.qrCodeUrl}
                  alt="Payment QR"
                  style={{ width: 180, height: 180, borderRadius: 12, border: '2px solid rgba(255, 255, 255, 0.1)' }}
                />
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
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
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  borderColor: 'transparent',
                  marginRight: 8,
                  marginBottom: 12,
                }}
              >
                Mở trang thanh toán ({activePayment.paymentMethod})
              </Button>
            )}

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94a3b8', fontSize: '0.8rem' }}>
              <Spin size="small" />
              <span>Đang lắng nghe xác nhận từ ngân hàng...</span>
            </div>

            <Button
              style={{ marginTop: 16 }}
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
