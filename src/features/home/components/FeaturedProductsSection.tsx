import React from 'react';
import { Row, Col, Button } from 'antd';
import { FireOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types/product.types';
import { ProductCard } from '../../products/components/ProductCard';
import { ProductCardSkeleton } from '../../products/components/ProductCardSkeleton';
import { ProductEmptyState } from '../../../components/common/ProductEmptyState';
import { ProductErrorState } from '../../../components/common/ProductErrorState';

export const FeaturedProductsSection: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: rawProducts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['home-featured-products-data'],
    queryFn: async () => {
      try {
        const featuredList = await productApi.getFeatured();
        if (Array.isArray(featuredList) && featuredList.length > 0) {
          return featuredList;
        }
      } catch {
        // Fallback to query param
      }
      const pageRes = await productApi.list({ featured: true, size: 8 });
      return pageRes?.content || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = React.useMemo<Product[]>(() => {
    if (Array.isArray(rawProducts)) return rawProducts;
    if (rawProducts && Array.isArray((rawProducts as any).content)) {
      return (rawProducts as any).content;
    }
    return [];
  }, [rawProducts]);

  return (
    <section id="featured-products" className="home-section" style={{ padding: '60px 0' }}>
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
              <FireOutlined style={{ color: '#f97316' }} />
              <span>Tuyển chọn đặc biệt</span>
            </div>
            <h2 className="section-title" style={{ margin: '0 0 8px' }}>
              Sản phẩm nổi bật
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: 540 }}>
              Các tác phẩm in 3D cá nhân hóa tinh xảo nhất được đông đảo khách hàng tin yêu.
            </p>
          </div>

          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products?featured=true')}
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
            title="Chưa có sản phẩm nổi bật"
            message="Các sản phẩm nổi bật đang được cập nhật."
            onReset={() => navigate('/products')}
            resetText="Khám phá toàn bộ danh mục"
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

export default FeaturedProductsSection;
