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
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { useCart } from '../../cart/context/CartContext';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
      <div style={{ minHeight: '100vh', background: '#050811' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#94a3b8' }}>Đang tải thông tin sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ minHeight: '100vh', background: '#050811', color: '#fff' }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', padding: 24 }}>
          <Title level={3} style={{ color: '#ef4444' }}>
            Không tìm thấy sản phẩm
          </Title>
          <Text style={{ color: '#94a3b8', display: 'block', marginBottom: 24 }}>
            Sản phẩm có thể đã ngừng cung cấp hoặc đường dẫn không chính xác.
          </Text>
          <Button type="primary" onClick={() => navigate('/products')}>
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
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Back Link */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          style={{ color: '#94a3b8', marginBottom: 24, paddingLeft: 0 }}
        >
          Quay lại danh mục sản phẩm
        </Button>

        <Row gutter={[48, 36]}>
          {/* Left Column: Gallery */}
          <Col xs={24} md={12}>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                <div style={{ fontSize: '4rem', color: '#475569' }}>📦</div>
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
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border:
                        selectedImageIndex === idx
                          ? '2px solid #38bdf8'
                          : '1px solid rgba(255, 255, 255, 0.1)',
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
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                borderRadius: 16,
                marginTop: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(14, 165, 233, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    fontSize: '1.5rem',
                  }}
                >
                  <CameraOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>
                    Tạo mô hình 3D từ ảnh chụp của bạn?
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Tải lên 20-50 bức ảnh để AI tái cấu trúc 3D chân dung của bạn trước khi in.
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => navigate('/checkout')}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                    borderColor: 'transparent',
                    borderRadius: 8,
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
              <Tag color="cyan" style={{ marginBottom: 12, borderRadius: 6 }}>
                {product.category.name}
              </Tag>
            )}

            <Title level={2} style={{ color: '#ffffff', margin: '0 0 12px', fontWeight: 800 }}>
              {product.name}
            </Title>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                {formatCurrency(product.price, 'VND')}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Đã bao gồm VAT & phủ UV bảo vệ</span>
            </div>

            <Paragraph style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description || product.shortDescription}
            </Paragraph>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Option: Size */}
              <div>
                <Text style={{ color: '#e2e8f0', fontWeight: 600, display: 'block', marginBottom: 8 }}>
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
                        background: selectedSize === s ? '#0ea5e9' : 'rgba(255,255,255,0.05)',
                        borderColor: selectedSize === s ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                        color: selectedSize === s ? '#fff' : '#cbd5e1',
                        borderRadius: 8,
                      }}
                    >
                      {s}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Material */}
              <div>
                <Text style={{ color: '#e2e8f0', fontWeight: 600, display: 'block', marginBottom: 8 }}>
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
                        background: selectedMaterial === m ? '#0ea5e9' : 'rgba(255,255,255,0.05)',
                        borderColor: selectedMaterial === m ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                        color: selectedMaterial === m ? '#fff' : '#cbd5e1',
                        borderRadius: 8,
                      }}
                    >
                      {m}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Base */}
              <div>
                <Text style={{ color: '#e2e8f0', fontWeight: 600, display: 'block', marginBottom: 8 }}>
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
                        background: selectedBase === b ? '#0ea5e9' : 'rgba(255,255,255,0.05)',
                        borderColor: selectedBase === b ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                        color: selectedBase === b ? '#fff' : '#cbd5e1',
                        borderRadius: 8,
                      }}
                    >
                      {b}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Option: Customer Note */}
              <div>
                <Text style={{ color: '#e2e8f0', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Ghi chú chế tác / Khắc chữ đế:
                </Text>
                <TextArea
                  rows={2}
                  placeholder="Ví dụ: Khắc chữ 'Kỷ niệm 10 năm' lên mặt trước đế gỗ..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: 8,
                  }}
                />
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Text style={{ color: '#e2e8f0', fontWeight: 600 }}>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  size="large"
                  style={{ borderRadius: 8, width: 100 }}
                />
              </div>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="default"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={isOutOfStock}
                loading={isAdding}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontWeight: 700,
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
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  borderColor: 'transparent',
                  fontWeight: 700,
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
                marginTop: 28,
                padding: 16,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
                <CheckCircleOutlined style={{ color: '#22c55e' }} />
                <span>Độ chính xác 0.08mm vi mô</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
                <SafetyCertificateOutlined style={{ color: '#0ea5e9' }} />
                <span>Cam kết hoàn tiền nếu gãy vỡ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
                <CarOutlined style={{ color: '#f59e0b' }} />
                <span>Giao hàng hỏa tốc toàn quốc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#94a3b8' }}>
                <AppstoreOutlined style={{ color: '#a855f7' }} />
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
