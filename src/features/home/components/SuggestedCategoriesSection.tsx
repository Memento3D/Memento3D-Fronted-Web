import React from 'react';
import { Row, Col, Button } from 'antd';
import { AppstoreOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../products/api/categoryApi';
import type { ProductCategory } from '../../products/types/product.types';
import { CategoryCard } from '../../products/components/CategoryCard';
import { CategorySkeleton } from '../../products/components/ProductCardSkeleton';
import { ProductErrorState } from '../../../components/common/ProductErrorState';

// Fallback curated categories if DB is pristine
const DEFAULT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-figure',
    name: 'Mini Figure',
    slug: 'mini-figure',
    description: 'Tượng mô hình chân dung, nhân vật anime và idol thu nhỏ.',
    active: true,
    displayOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-keychain',
    name: 'Personalized Keychain',
    slug: 'keychain',
    description: 'Móc khóa 3D khắc tên và biểu tượng mang theo hàng ngày.',
    active: true,
    displayOrder: 2,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-grad',
    name: 'Graduation Gifts',
    slug: 'graduation',
    description: 'Kỷ vật tốt nghiệp độc bản ghi dấu cột mốc thanh xuân.',
    active: true,
    displayOrder: 3,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-couple',
    name: 'Couple Gifts',
    slug: 'couple',
    description: 'Tượng đôi tình nhân và quà kỷ niệm ngày yêu lãng mạn.',
    active: true,
    displayOrder: 4,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-pet',
    name: 'Pet Models',
    slug: 'pet-models',
    description: 'Tượng cún cưng, mèo cưng từ ảnh chụp sinh động.',
    active: true,
    displayOrder: 5,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-decor',
    name: 'Home Decoration',
    slug: 'home-decoration',
    description: 'Tác phẩm điêu khắc nghệ thuật trưng bày bàn làm việc.',
    active: true,
    displayOrder: 6,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-custom',
    name: 'Custom 3D Model',
    slug: 'custom-3d',
    description: 'Tái tạo 3D mọi vật thể bất kỳ theo yêu cầu cá nhân.',
    active: true,
    displayOrder: 7,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-acc',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Đế đỡ điện thoại, giá cắm bút và phụ kiện in 3D cao cấp.',
    active: true,
    displayOrder: 8,
    createdAt: '',
    updatedAt: '',
  },
];

export const SuggestedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: rawCategories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['home-categories-list'],
    queryFn: () => categoryApi.list(true),
    staleTime: 10 * 60 * 1000,
  });

  const categories = React.useMemo<ProductCategory[]>(() => {
    if (Array.isArray(rawCategories) && rawCategories.length > 0) {
      return rawCategories;
    }
    if (rawCategories && Array.isArray((rawCategories as any).content) && (rawCategories as any).content.length > 0) {
      return (rawCategories as any).content;
    }
    return DEFAULT_CATEGORIES;
  }, [rawCategories]);

  const handleCategoryClick = (category: ProductCategory) => {
    if (category.id && !category.id.startsWith('cat-')) {
      navigate(`/products?categoryId=${category.id}`);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  return (
    <section id="categories" className="home-section" style={{ padding: '60px 0' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
              <AppstoreOutlined style={{ color: '#0ea5e9' }} />
              <span>Danh mục đề xuất</span>
            </div>
            <h2 className="section-title" style={{ margin: '0 0 8px' }}>
              Khám phá danh mục
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', maxWidth: 540 }}>
              Tìm sản phẩm phù hợp với từng khoảnh khắc đáng nhớ của bạn.
            </p>
          </div>

          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/categories')}
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Xem tất cả danh mục
          </Button>
        </div>

        {/* Content / Grid */}
        {isLoading ? (
          <Row gutter={[20, 20]}>
            <CategorySkeleton count={8} />
          </Row>
        ) : isError ? (
          <ProductErrorState onRetry={() => refetch()} />
        ) : (
          <Row gutter={[20, 20]}>
            {categories.slice(0, 8).map((cat) => (
              <Col xs={12} sm={8} md={6} lg={6} key={cat.id || cat.slug}>
                <CategoryCard
                  category={cat}
                  onClick={() => handleCategoryClick(cat)}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </section>
  );
};

export default SuggestedCategoriesSection;
