import React from 'react';
import { Row, Col, Button } from 'antd';
import { HeartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types/product.types';
import { ProductCard } from '../../products/components/ProductCard';
import { ProductCardSkeleton } from '../../products/components/ProductCardSkeleton';
import { ProductEmptyState } from '../../../components/common/ProductEmptyState';
import { ProductErrorState } from '../../../components/common/ProductErrorState';

export const PopularProductsSection: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: rawResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['home-popular-products'],
    queryFn: () => productApi.list({ sort: 'popular', size: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const products = React.useMemo<Product[]>(() => {
    if (Array.isArray(rawResponse?.content)) return rawResponse.content;
    if (Array.isArray(rawResponse)) return rawResponse;
    return [];
  }, [rawResponse]);

  return (
    <section id="popular-products" className="home-section" style={{ padding: '60px 0' }}>
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
              <HeartOutlined style={{ color: '#ec4899' }} />
              <span>Yêu thích nhất</span>
            </div>
            <h2 className="section-title" style={{ margin: '0 0 8px' }}>
              Được yêu thích
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: 540 }}>
              Các mẫu kỷ vật nhận được lượt đặt hàng và điểm số phản hồi cao nhất từ cộng đồng.
            </p>
          </div>

          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products?sort=popular')}
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
            title="Chưa có dữ liệu sản phẩm yêu thích"
            message="Các sản phẩm được yêu thích đang được tổng hợp."
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

export default PopularProductsSection;
