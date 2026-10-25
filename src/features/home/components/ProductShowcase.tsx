import React from 'react';
import { Row, Col, Button, Tag, Card, Spin, Space } from 'antd';
import {
  ArrowRightOutlined,
  FireOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import { categoryApi } from '../../products/api/categoryApi';
import { useCart } from '../../cart/context/CartContext';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import type { ProductCategory } from '../../products/types/product.types';

export const ProductShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Categories from Backend API
  const { data: rawCategories } = useQuery({
    queryKey: ['home-categories'],
    queryFn: () => categoryApi.list(true),
    staleTime: 10 * 60 * 1000,
  });

  // Featured Products from Backend API
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => productApi.list({ size: 6, sort: 'popular' }),
    staleTime: 5 * 60 * 1000,
  });

  // Safe data extraction handling Spring Boot Page vs List vs Null/Undefined/Invalid
  const categories = React.useMemo<ProductCategory[]>(() => {
    if (Array.isArray(rawCategories)) return rawCategories as ProductCategory[];
    if (rawCategories && Array.isArray((rawCategories as any).content)) {
      return (rawCategories as any).content as ProductCategory[];
    }
    return [];
  }, [rawCategories]);

  const products = React.useMemo(() => {
    if (Array.isArray(productsData?.content)) return productsData.content;
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  return (
    <section id="products" className="products-wrapper" style={{ padding: '80px 0', background: 'var(--color-bg)' }}>
      <div className="home-container">
        {/* Section 1: Featured Categories */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="section-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <AppstoreOutlined style={{ color: '#0ea5e9' }} />
            <span>Danh mục Sản phẩm Nổi bật</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
            }}
          >
            Định hình Kỷ niệm theo Cách của Bạn
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto', fontSize: '1rem' }}>
            Từ móc khóa charm bỏ túi đến tượng chân dung bán thân tinh xảo, từng sản phẩm được chế tác tỉ mỉ.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <Row gutter={[20, 20]} style={{ marginBottom: 60 }}>
            {categories.slice(0, 4).map((cat: ProductCategory) => (
              <Col xs={12} sm={12} md={6} key={cat.id}>
                <div
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  className="category-pill-card"
                >
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>
                    {cat.description || 'Xem sản phẩm'}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Section 2: Featured Products Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Bán chạy nhất (Best Sellers)
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 0' }}>
              Tác phẩm Được Yêu thích Nhất
            </h3>
          </div>

          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products')}
            style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Xem tất cả sản phẩm
          </Button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/products/${product.slug}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}
                  cover={
                    <div style={{ height: 220, overflow: 'hidden', background: 'var(--bg-elevated)', position: 'relative' }}>
                      {product.thumbnailUrl ? (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                          📦
                        </div>
                      )}
                      {product.featured && (
                        <Tag color="gold" style={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }}>
                          <FireOutlined /> Nổi bật
                        </Tag>
                      )}
                      {product.category && (
                        <Tag color="cyan" style={{ position: 'absolute', top: 12, right: 12 }}>
                          {product.category.name}
                        </Tag>
                      )}
                    </div>
                  }
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>
                      {product.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16 }}>
                      {product.shortDescription || product.description}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Giá từ:</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                        {formatCurrency(product.price, 'VND')}
                      </div>
                    </div>

                    <Space>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await addToCart({ productId: product.id, quantity: 1 });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                          borderColor: 'transparent',
                          borderRadius: 8,
                        }}
                      />
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </section>
  );
};
