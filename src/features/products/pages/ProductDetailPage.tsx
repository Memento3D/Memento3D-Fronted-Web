import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Radio,
  InputNumber,
  Input,
  Typography,
  Divider,
  Spin,
} from 'antd';
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  AppstoreOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { useCart } from '../../cart/context/CartContext';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { prefetchChunk } from '../../../utils/prefetch';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleWarmupCheckout = () => {
    prefetchChunk('CheckoutPage', () => import('../../orders/pages/CheckoutPage'));
    prefetchChunk('CartPage', () => import('../../cart/pages/CartPage'));
  };

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('Standard (12-15cm)');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('High-Detail Resin');
  const [selectedBase, setSelectedBase] = useState<string>('Gỗ Walnut cao cấp');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => (slug ? productApi.getBySlug(slug) : null),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="home-wrapper" style={{ minHeight: '100dvh' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: 'var(--text-muted)' }}>Đang tải thông tin sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="home-wrapper" style={{ minHeight: '100dvh' }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', padding: 24 }}>
          <Title level={3} style={{ color: 'var(--color-error, #ef4444)' }}>
            Không tìm thấy sản phẩm
          </Title>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 24 }}>
            Sản phẩm có thể đã ngừng cung cấp hoặc đường dẫn không chính xác.
          </Text>
          <Button type="primary" onClick={() => navigate('/products')} style={{ borderRadius: 'var(--radius-sm, 6px)' }}>
            Xem tất cả sản phẩm
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnailUrl || ''];
  const activeImage = images[selectedImageIndex] || product.thumbnailUrl;
  const isOutOfStock = product.availability === 'OUT_OF_STOCK';

  const customizationPayload = {
    size: selectedSize,
    material: selectedMaterial,
    base: selectedBase,
    note: customerNote || undefined,
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart({
      productId: product.id,
      quantity,
      customization: customizationPayload,
    });
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    setIsAdding(true);
    const ok = await addToCart({
      productId: product.id,
      quantity,
      customization: customizationPayload,
    });
    setIsAdding(false);
    if (ok) {
      navigate('/checkout');
    }
  };

  return (
    <div className="home-wrapper" style={{ minHeight: '100dvh' }}>
      <Navbar />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Back Link */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          style={{ color: 'var(--text-secondary)', marginBottom: 24, paddingLeft: 0 }}
        >
          Quay lại danh mục sản phẩm
        </Button>

        <Row gutter={[48, 36]}>
          {/* Left Column: Gallery */}
          <Col xs={24} md={12}>
            <div
              style={{
                borderRadius: 'var(--radius-card, 10px)',
                overflow: 'hidden',
                background: 'var(--surface-container)',
                border: '1px solid var(--border-color)',
                marginBottom: 16,
                height: 440,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <InboxOutlined />
                  <span style={{ fontSize: '0.9rem' }}>Chưa có hình ảnh</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 'var(--radius-sm, 6px)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border:
                        selectedImageIndex === idx
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-color)',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Customization CTA banner */}
            <Card
              style={{
                background: 'var(--surface-container)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card, 10px)',
                marginTop: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm, 8px)',
                    background: 'var(--lavender-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                  }}
                >
                  <CameraOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Tạo mô hình 3D từ ảnh chụp của bạn?
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Tải lên 20-50 bức ảnh để AI tái cấu trúc 3D chân dung của bạn trước khi in.
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => navigate('/checkout')}
                  style={{
                    background: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    borderRadius: 'var(--radius-sm, 6px)',
                  }}
                >
                  Tùy biến với ảnh
                </Button>
              </div>
            </Card>
          </Col>

          {/* Right Column: Information & Options */}
          <Col xs={24} md={12}>
            {product.category && (
              <Tag color="purple" style={{ marginBottom: 12, borderRadius: 9999 }}>
                {product.category.name}
              </Tag>
            )}

            <Title level={2} style={{ color: 'var(--text-primary)', margin: '0 0 12px', fontWeight: 800 }}>
              {product.name}
            </Title>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(product.price, 'VND')}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Đã bao gồm VAT & phủ UV bảo vệ</span>
            </div>

            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description || product.shortDescription}
            </Paragraph>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            {/* Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Option: Size */}
              <div>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Kích thước tỷ lệ:
                </Text>
                <Radio.Group
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  {['Mini Charm (5-6cm)', 'Standard (12-15cm)', 'Museum Monument (20-24cm)'].map((s) => (
                    <Radio.Button
                      key={s}
                      value={s}
                      style={{
                        background: selectedSize === s ? 'var(--primary)' : 'var(--surface-container)',
                        borderColor: selectedSize === s ? 'var(--primary)' : 'var(--border-color)',
                        color: selectedSize === s ? '#FFFFFF' : 'var(--text-primary)',
                        borderRadius: 9999,
                      }}
                    >
                      {s}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Material */}
              <div>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Chất liệu chế tác:
                </Text>
                <Radio.Group
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  {['High-Detail Resin', 'Silk PLA Matte', 'Cold-Cast Bronze Composite'].map((m) => (
                    <Radio.Button
                      key={m}
                      value={m}
                      style={{
                        background: selectedMaterial === m ? 'var(--primary)' : 'var(--surface-container)',
                        borderColor: selectedMaterial === m ? 'var(--primary)' : 'var(--border-color)',
                        color: selectedMaterial === m ? '#FFFFFF' : 'var(--text-primary)',
                        borderRadius: 9999,
                      }}
                    >
                      {m}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Base */}
              <div>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Đế trưng bày:
                </Text>
                <Radio.Group
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  {['Gỗ Walnut cao cấp', 'Đá cẩm thạch Obsidian', 'Không đế'].map((b) => (
                    <Radio.Button
                      key={b}
                      value={b}
                      style={{
                        background: selectedBase === b ? 'var(--primary)' : 'var(--surface-container)',
                        borderColor: selectedBase === b ? 'var(--primary)' : 'var(--border-color)',
                        color: selectedBase === b ? '#FFFFFF' : 'var(--text-primary)',
                        borderRadius: 9999,
                      }}
                    >
                      {b}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Customer Note */}
              <div>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Ghi chú chế tác / Khắc chữ đế:
                </Text>
                <TextArea
                  rows={2}
                  placeholder="Ví dụ: Khắc chữ 'Kỷ niệm 10 năm' lên mặt trước đế gỗ..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-default)',
                  }}
                />
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  size="large"
                  style={{ borderRadius: 20, width: 100 }}
                />
              </div>
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="default"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={isOutOfStock}
                loading={isAdding}
                onClick={handleAddToCart}
                onMouseEnter={handleWarmupCheckout}
                onFocus={handleWarmupCheckout}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--surface-container)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                Thêm vào giỏ hàng
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                disabled={isOutOfStock}
                loading={isAdding}
                onClick={handleBuyNow}
                onMouseEnter={handleWarmupCheckout}
                onFocus={handleWarmupCheckout}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontWeight: 600,
                  boxShadow: 'none',
                }}
              >
                Mua ngay
              </Button>
            </div>

            {/* Value Guarantees */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginTop: 24,
                padding: 16,
                background: 'var(--surface-container, #F1EBFF)',
                borderRadius: 'var(--radius-card, 10px)',
                border: '1px solid var(--border-color, #E2D9F7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <CheckCircleOutlined style={{ color: 'var(--tertiary)' }} />
                <span>Độ chính xác 0.08mm vi mô</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <SafetyCertificateOutlined style={{ color: 'var(--primary)' }} />
                <span>Cam kết hoàn tiền nếu gãy vỡ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <CarOutlined style={{ color: 'var(--secondary)' }} />
                <span>Giao hàng hỏa tốc toàn quốc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <AppstoreOutlined style={{ color: 'var(--primary-system)' }} />
                <span>Đóng hộp quà cao cấp miễn phí</span>
              </div>
            </div>
          </Col>
        </Row>
      </main>

      <Footer />
    </div>
  );
};
