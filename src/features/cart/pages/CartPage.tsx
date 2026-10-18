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
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
              Giỏ hàng của bạn ({cart?.totalItems || 0} sản phẩm)
            </Title>
            <Text style={{ color: '#94a3b8' }}>
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
              <Button type="text" danger icon={<DeleteOutlined />}>
                Làm trống giỏ hàng
              </Button>
            </Popconfirm>
          )}
        </div>

        {isLoading && !cart ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#94a3b8' }}>Đang tải giỏ hàng...</div>
          </div>
        ) : isEmpty ? (
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              textAlign: 'center',
              padding: '60px 20px',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} style={{ color: '#f8fafc', margin: '16px 0 8px' }}>
                    Giỏ hàng của bạn đang trống
                  </Title>
                  <Text style={{ color: '#94a3b8' }}>
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
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  borderColor: 'transparent',
                  borderRadius: 8,
                  fontWeight: 700,
                  marginTop: 16,
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
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <Row gutter={[20, 16]} align="middle">
                      {/* Product Thumbnail */}
                      <Col xs={6} sm={4}>
                        <div
                          style={{
                            width: '100%',
                            height: 80,
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: '#090d16',
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
                            <span style={{ fontSize: '1.8rem' }}>📦</span>
                          )}
                        </div>
                      </Col>

                      {/* Product Info */}
                      <Col xs={18} sm={10}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#f8fafc',
                            cursor: 'pointer',
                          }}
                          onClick={() => navigate(`/products/${item.productSlug}`)}
                        >
                          {item.productName}
                        </div>
                        {item.categoryName && (
                          <Tag color="cyan" style={{ marginTop: 4, borderRadius: 4 }}>
                            {item.categoryName}
                          </Tag>
                        )}

                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#94a3b8',
                              marginTop: 6,
                              background: 'rgba(255, 255, 255, 0.03)',
                              padding: '4px 8px',
                              borderRadius: 6,
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
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Đơn giá:</div>
                        <div style={{ color: '#e2e8f0', fontWeight: 600 }}>
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
                            style={{ width: 68, borderRadius: 6 }}
                          />
                        </div>
                      </Col>

                      {/* Subtotal & Remove */}
                      <Col xs={12} sm={5} style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thành tiền:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                          {formatCurrency(item.subtotal, 'VND')}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeItem(item.id)}
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
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/products')}
                  style={{ color: '#94a3b8' }}
                >
                  Tiếp tục xem sản phẩm
                </Button>
              </div>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} lg={8}>
              <Card
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  position: 'sticky',
                  top: 100,
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Title level={4} style={{ color: '#fff', margin: '0 0 20px', fontWeight: 700 }}>
                  Tóm tắt đơn hàng
                </Title>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Tạm tính ({cart?.totalItems || 0} món):</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                      {formatCurrency(cart?.subtotal || 0, 'VND')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Giảm giá:</span>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>
                      - {formatCurrency(cart?.discount || 0, 'VND')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Phí vận chuyển:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                      {cart?.shippingFee ? formatCurrency(cart.shippingFee, 'VND') : 'Miễn phí'}
                    </span>
                  </div>

                  <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Tổng cộng:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
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
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    fontWeight: 700,
                    height: 50,
                    marginTop: 24,
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
                    color: '#94a3b8',
                  }}
                >
                  <CheckCircleOutlined style={{ color: '#22c55e' }} />
                  <span>Hỗ trợ thanh toán MoMo, ZaloPay và Tiền mặt khi nhận hàng.</span>
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
