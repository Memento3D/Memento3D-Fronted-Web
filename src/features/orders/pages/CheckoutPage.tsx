import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Radio,
  Button,
  Typography,
  Divider,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/context/CartContext';
import { formatCurrency } from '../utils/orderFormatters';
import { OrderPaymentModal } from '../components/OrderPaymentModal';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import type { OrderResponse, PaymentMethod } from '../types/order.types';
import { apiClient } from '../../../services/apiClient';
import { paymentApi } from '../api/paymentApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, isLoading: isCartLoading, refreshCart } = useCart();
  const [form] = Form.useForm();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  const cartItems = cart?.items || [];
  const isCartEmpty = cartItems.length === 0;

  const handleSubmit = async (values: any) => {
    if (isCartEmpty) {
      message.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. POST /api/v1/orders (No total price sent; backend calculates all from DB!)
      const res = await apiClient.post<OrderResponse>('/orders', {
        recipientName: values.recipientName.trim(),
        phone: values.phone.trim(),
        shippingAddress: values.shippingAddress.trim(),
        note: values.note ? values.note.trim() : undefined,
        paymentMethod,
      });

      const order = res.data;
      setCreatedOrder(order);
      await refreshCart();

      // If CASH: Order created with PENDING CASH payment. No external gateway redirect.
      if (paymentMethod === 'CASH') {
        message.success('Đặt hàng thành công! Đơn hàng sẽ thanh toán tiền mặt khi nhận hàng.');
        navigate(`/orders/${order.id}`);
        return;
      }

      // If VNPAY: Call /payments/vnpay/create and redirect directly to VNPAY Sandbox
      if (paymentMethod === 'VNPAY') {
        message.loading({ content: 'Đang chuyển hướng đến cổng thanh toán VNPAY...', key: 'vnpay-loading', duration: 4 });
        try {
          const vnpayRes = await paymentApi.createVnpayPayment(order.id);
          if (vnpayRes.paymentUrl) {
            window.location.assign(vnpayRes.paymentUrl);
            return;
          }
        } catch (vnpayErr: any) {
          message.error({ content: vnpayErr.message || 'Không thể tạo phiên thanh toán VNPAY', key: 'vnpay-loading' });
          navigate(`/orders/${order.id}`);
          return;
        }
      }

      // If MOMO or ZALOPAY: Open payment modal or redirect
      message.success('Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán.');
      setPaymentModalOpen(true);
    } catch (err: any) {
      message.error(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '120px 24px 60px' }}>
        {/* Breadcrumb Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/cart')}
            style={{ color: 'var(--text-secondary)', paddingLeft: 0, borderRadius: 'var(--radius-full)' }}
          >
            Quay lại Giỏ hàng
          </Button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Thanh toán & Xác nhận Đơn hàng
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Vui lòng điền thông tin người nhận và lựa chọn phương thức thanh toán an toàn.
          </Text>
        </div>

        {isCartLoading && !cart ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : isCartEmpty ? (
          <Card
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <Empty
              description={<span style={{ color: 'var(--text-secondary)' }}>Giỏ hàng của bạn đang trống.</span>}
            >
              <Button
                type="primary"
                onClick={() => navigate('/products')}
                style={{
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                }}
              >
                Khám phá sản phẩm
              </Button>
            </Empty>
          </Card>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              recipientName: user?.fullName || '',
              phone: '',
              shippingAddress: '',
              note: '',
            }}
          >
            <Row gutter={[32, 32]}>
              {/* Left Column: Customer & Shipping Information */}
              <Col xs={24} lg={15}>
                {/* 1. Customer & Shipping Info */}
                <Card
                  title={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      1. Thông tin người nhận & Địa chỉ giao hàng
                    </span>
                  }
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                    marginBottom: 24,
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="recipientName"
                        label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Họ và tên người nhận</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
                      >
                        <Input
                          placeholder="Ví dụ: Nguyễn Văn A"
                          size="large"
                          style={{
                            borderRadius: 'var(--radius-default)',
                            borderColor: 'var(--border-default)',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Số điện thoại liên hệ</span>}
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại' },
                          {
                            pattern: /^[0-9+()\-\s]{8,20}$/,
                            message: 'Số điện thoại không hợp lệ',
                          },
                        ]}
                      >
                        <Input
                          placeholder="0912 345 678"
                          size="large"
                          style={{
                            borderRadius: 'var(--radius-default)',
                            borderColor: 'var(--border-default)',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="shippingAddress"
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Địa chỉ giao hàng chi tiết</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                      style={{
                        borderRadius: 'var(--radius-default)',
                        borderColor: 'var(--border-default)',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="note"
                    label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Ghi chú đơn hàng (Tùy chọn)</span>}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Ghi chú thêm về thời gian giao hoặc hướng dẫn bảo quản..."
                      style={{
                        borderRadius: 'var(--radius-default)',
                        borderColor: 'var(--border-default)',
                      }}
                    />
                  </Form.Item>
                </Card>

                {/* 2. Payment Method */}
                <Card
                  title={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      2. Chọn phương thức thanh toán
                    </span>
                  }
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    {/* VNPAY */}
                    <Radio
                      value="VNPAY"
                      style={{
                        background: paymentMethod === 'VNPAY' ? 'rgba(0, 92, 185, 0.08)' : 'var(--surface-container)',
                        border: paymentMethod === 'VNPAY' ? '1.5px solid #005cb9' : '1px solid var(--border-default)',
                        padding: '16px',
                        borderRadius: 'var(--radius-default)',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ fontWeight: 700, color: '#005cb9', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>Cổng VNPAY (QR / ATM / Thẻ quốc tế)</span>
                          <span style={{ fontSize: '0.75rem', background: '#005cb9', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Khuyên dùng</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Thanh toán an toàn qua cổng VNPAY (Quét mã VNPAY-QR, Thẻ ATM nội địa, Internet Banking, Visa/Mastercard)
                        </div>
                      </div>
                    </Radio>

                    {/* Cash / COD */}
                    <Radio
                      value="CASH"
                      style={{
                        background: paymentMethod === 'CASH' ? 'rgba(201, 232, 213, 0.3)' : 'var(--surface-container)',
                        border: paymentMethod === 'CASH' ? '1.5px solid var(--tertiary)' : '1px solid var(--border-default)',
                        padding: '16px',
                        borderRadius: 'var(--radius-default)',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ fontWeight: 700, color: 'var(--tertiary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <DollarCircleOutlined /> Thanh toán khi nhận hàng (COD)
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Thanh toán tiền mặt cho nhân viên giao hàng khi nhận sản phẩm
                        </div>
                      </div>
                    </Radio>

                    {/* MoMo */}
                    <Radio
                      value="MOMO"
                      style={{
                        background: paymentMethod === 'MOMO' ? 'rgba(216, 45, 139, 0.08)' : 'var(--surface-container)',
                        border: paymentMethod === 'MOMO' ? '1.5px solid #d82d8b' : '1px solid var(--border-default)',
                        padding: '16px',
                        borderRadius: 'var(--radius-default)',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ fontWeight: 700, color: '#ec4899', fontSize: '1rem' }}>
                          Ví MoMo
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Thanh toán qua quét mã QR hoặc ứng dụng MoMo
                        </div>
                      </div>
                    </Radio>

                    {/* ZaloPay */}
                    <Radio
                      value="ZALOPAY"
                      style={{
                        background: paymentMethod === 'ZALOPAY' ? 'var(--surface-high)' : 'var(--surface-container)',
                        border: paymentMethod === 'ZALOPAY' ? '1.5px solid var(--primary)' : '1px solid var(--border-default)',
                        padding: '16px',
                        borderRadius: 'var(--radius-default)',
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                          Ví ZaloPay
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Thanh toán qua cổng ZaloPay QR & Thẻ ATM/Visa
                        </div>
                      </div>
                    </Radio>
                  </Radio.Group>
                </Card>
              </Col>

              {/* Right Column: Order Items & Price Summary */}
              <Col xs={24} lg={9}>
                {/* Order Items in Cart */}
                <Card
                  title={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      Sản phẩm trong đơn ({cart?.totalItems || 0})
                    </span>
                  }
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                    marginBottom: 24,
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 320, overflowY: 'auto' }}>
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          paddingBottom: 12,
                          borderBottom: '1px solid var(--border-default)',
                        }}
                      >
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            background: 'var(--surface-container)',
                            border: '1px solid var(--border-default)',
                            flexShrink: 0,
                          }}
                        >
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              📦
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.productName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            SL: {item.quantity} × {formatCurrency(item.unitPrice, 'VND')}
                          </div>
                        </div>

                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                          {formatCurrency(item.subtotal, 'VND')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Price Summary */}
                <Card
                  title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Tổng kết thanh toán</span>}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tạm tính:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {formatCurrency(cart?.subtotal || 0, 'VND')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Giảm giá:</span>
                      <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>
                        - {formatCurrency(cart?.discount || 0, 'VND')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Phí vận chuyển:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {cart?.shippingFee ? formatCurrency(cart.shippingFee, 'VND') : 'Miễn phí'}
                      </span>
                    </div>

                    <Divider style={{ borderColor: 'var(--border-default)', margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Tổng thanh toán:
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(cart?.total || 0, 'VND')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{
                      background: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      height: 50,
                      marginTop: 24,
                      boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                    }}
                  >
                    {paymentMethod === 'CASH'
                      ? 'Xác nhận đặt hàng (COD)'
                      : paymentMethod === 'VNPAY'
                        ? 'Thanh toán với VNPAY'
                        : 'Tiến hành thanh toán'}
                  </Button>

                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <LockOutlined />
                    <span>Thanh toán mã hóa bảo mật SSL 256-bit</span>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        )}

        {/* Payment Modal if MoMo / ZaloPay chosen */}
        {createdOrder && (
          <OrderPaymentModal
            order={createdOrder}
            open={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onPaymentSuccess={() => {
              navigate(`/orders/${createdOrder.id}`);
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
