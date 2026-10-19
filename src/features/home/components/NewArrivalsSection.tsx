import React from 'react';
import { Row, Col, Button } from 'antd';
import { ThunderboltOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types/product.types';
import { ProductCard } from '../../products/components/ProductCard';
import { ProductCardSkeleton } from '../../products/components/ProductCardSkeleton';
import { ProductEmptyState } from '../../../components/common/ProductEmptyState';
import { ProductErrorState } from '../../../components/common/ProductErrorState';

export const NewArrivalsSection: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: rawResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['home-new-arrivals'],
    queryFn: () => productApi.list({ sort: 'newest', size: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const products = React.useMemo<Product[]>(() => {
    if (Array.isArray(rawResponse?.content)) return rawResponse.content;
    if (Array.isArray(rawResponse)) return rawResponse;
    return [];
  }, [rawResponse]);

  return (
    <section id="new-arrivals" className="home-section" style={{ padding: '60px 0' }}>
      <div className="home-container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 36,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div className="section-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
              <ThunderboltOutlined style={{ color: '#0ea5e9' }} />
              <span>Vừa ra mắt</span>
            </div>
            <h2 className="section-title" style={{ margin: '0 0 8px' }}>
              Sản phẩm mới
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: 540 }}>
              Khám phá các thiết kế mẫu phôi 3D độc quyền và phụ kiện vừa được đưa vào xưởng chế tác.
            </p>
          </div>

          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products?sort=newest')}
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Xem tất cả
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <Row gutter={[24, 24]}>
            <ProductCardSkeleton count={4} />
          </Row>
        ) : isError ? (
          <ProductErrorState onRetry={() => refetch()} />
        ) : products.length === 0 ? (
          <ProductEmptyState
            title="Chưa có sản phẩm mới"
            message="Các sản phẩm mới đang được chuẩn bị lên kệ."
            onReset={() => navigate('/products')}
            resetText="Xem tất cả sản phẩm"
          />
        ) : (
          <Row gutter={[24, 24]}>
            {products.slice(0, 8).map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
