import React from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Typography,
  Divider,
  Empty,
  Popconfirm,
  Tag,
  Spin,
} from 'antd';
import {
  DeleteOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';

const { Title, Text } = Typography;

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
              Giỏ hàng của bạn ({cart?.totalItems || 0} sản phẩm)
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>
              Kiểm tra các kỷ vật 3D đã chọn trước khi tiến hành thanh toán và sản xuất.
            </Text>
          </div>

          {!isEmpty && (
            <Popconfirm
              title="Xóa tất cả sản phẩm?"
              description="Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng không?"
              onConfirm={() => clearCart()}
              okText="Xóa hết"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: 'var(--radius-full)' }}>
                Làm trống giỏ hàng
              </Button>
            </Popconfirm>
          )}
        </div>

        {isLoading && !cart ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Đang tải giỏ hàng...</div>
          </div>
        ) : isEmpty ? (
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
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} style={{ color: 'var(--text-primary)', margin: '16px 0 8px' }}>
                    Giỏ hàng của bạn đang trống
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)' }}>
                    Hãy chọn cho mình hoặc người thân một tác phẩm kỷ vật 3D độc đáo.
                  </Text>
                </div>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                style={{
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  marginTop: 16,
                  boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                }}
              >
                Khám phá sản phẩm
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[32, 32]}>
            {/* Left Column: Cart Items */}
            <Col xs={24} lg={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {items.map((item) => (
                  <Card
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-card)',
                      boxShadow: 'var(--shadow-card)',
                      overflow: 'hidden',
                    }}
                    styles={{ body: { padding: 20 } }}
                  >
                    <Row gutter={[20, 16]} align="middle">
                      {/* Product Thumbnail */}
                      <Col xs={6} sm={4}>
                        <div
                          style={{
                            width: '100%',
                            height: 80,
                            borderRadius: 'var(--radius-default)',
                            overflow: 'hidden',
                            background: 'var(--surface-container)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <InboxOutlined style={{ fontSize: 24, color: 'var(--text-muted)' }} />
                          )}
                        </div>
                      </Col>

                      {/* Product Info */}
                      <Col xs={18} sm={10}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                          onClick={() => navigate(`/products/${item.productSlug}`)}
                        >
                          {item.productName}
                        </div>
                        {item.categoryName && (
                          <Tag
                            style={{
                              marginTop: 4,
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--surface-container)',
                              color: 'var(--primary)',
                              border: '1px solid var(--border-default)',
                              padding: '2px 10px',
                            }}
                          >
                            {item.categoryName}
                          </Tag>
                        )}

                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              marginTop: 6,
                              background: 'var(--surface-container)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {Object.entries(item.customization).map(([k, v]) => (
                              <div key={k}>
                                <span style={{ textTransform: 'capitalize' }}>{k}</span>: {String(v)}
                              </div>
                            ))}
                          </div>
                        )}
                      </Col>

                      {/* Unit Price & Quantity */}
                      <Col xs={12} sm={5} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đơn giá:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {formatCurrency(item.unitPrice, 'VND')}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(val) => {
                              if (val && val >= 1) {
                                updateQuantity(item.id, val);
                              }
                            }}
                            size="small"
                            style={{ width: 68, borderRadius: 'var(--radius-sm)' }}
                          />
                        </div>
                      </Col>

                      {/* Subtotal & Remove */}
                      <Col xs={12} sm={5} style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thành tiền:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatCurrency(item.subtotal, 'VND')}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeItem(item.id)}
                            style={{ borderRadius: 'var(--radius-full)' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/products')}
                  style={{
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-full)',
                    borderColor: 'var(--border-default)',
                    background: 'var(--bg-card)',
                  }}
                >
                  Tiếp tục xem sản phẩm
                </Button>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} lg={8}>
              <Card
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)',
                  position: 'sticky',
                  top: 100,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 20px', fontWeight: 700 }}>
                  Tóm tắt đơn hàng
                </Title>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tạm tính ({cart?.totalItems || 0} món):</span>
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
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tổng cộng:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(cart?.total || 0, 'VND')}
                    </span>
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/checkout')}
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
                  Tiến hành thanh toán
                </Button>

                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <CheckCircleOutlined style={{ color: 'var(--tertiary)' }} />
                  <span>Hỗ trợ thanh toán bảo mật qua VNPAY (QR, ATM, Visa) và Tiền mặt khi nhận hàng (COD).</span>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </main>

      <Footer />
    </div>
  );
};
