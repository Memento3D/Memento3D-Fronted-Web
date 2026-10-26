import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Slider,
  Pagination,
  Tag,
  Typography,
} from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { ProductEmptyState } from '../../../components/common/ProductEmptyState';
import { ProductErrorState } from '../../../components/common/ProductErrorState';

const { Title, Text } = Typography;

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || searchParams.get('categorySlug') || '';
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const sort = (searchParams.get('sort') as any) || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState<string>(keyword);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [committedPriceRange, setCommittedPriceRange] = useState<[number, number]>([0, 2000000]);
  const pageSize = 12;

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Debounced auto-search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== keyword) {
        updateUrl({ keyword: searchInput, page: 1 });
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Categories Query
  const { data: rawCategories = [] } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryApi.list(true),
    staleTime: 10 * 60 * 1000,
  });

  const categories = React.useMemo(() => {
    if (Array.isArray(rawCategories)) return rawCategories;
    if (rawCategories && Array.isArray((rawCategories as any).content)) return (rawCategories as any).content;
    return [];
  }, [rawCategories]);

  // Products Query (triggers only when committedPriceRange changes)
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products-list', page, keyword, selectedCategory, selectedCategoryId, sort, committedPriceRange],
    queryFn: () =>
      productApi.list({
        page: page - 1,
        size: pageSize,
        keyword: keyword || undefined,
        categoryId: selectedCategoryId || undefined,
        categorySlug: selectedCategory || undefined,
        minPrice: committedPriceRange[0] > 0 ? committedPriceRange[0] : undefined,
        maxPrice: committedPriceRange[1] < 2000000 ? committedPriceRange[1] : undefined,
        sort,
      }),
  });

  const handleSearch = () => {
    updateUrl({ keyword: searchInput, page: 1 });
  };

  const updateUrl = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        next.set(k, String(v));
      } else {
        next.delete(k);
      }
    });
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setPriceRange([0, 2000000]);
    setCommittedPriceRange([0, 2000000]);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="home-wrapper" style={{ minHeight: '100dvh' }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <Tag color="cyan" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
            Bộ sưu tập Memento3D
          </Tag>
          <Title level={1} style={{ color: 'var(--text-primary)', margin: '4px 0 12px', fontWeight: 800 }}>
            Khám phá Tác phẩm 3D & Kỷ vật Cá nhân
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 640, display: 'inline-block' }}>
            Từng tác phẩm được in 3D với độ chi tiết vi mô từ nhựa quang hóa cao cấp và hoàn thiện thủ công.
          </Text>
        </div>

        {/* Filter & Search Bar */}
        <Card
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            marginBottom: 32,
            boxShadow: 'var(--shadow-sm)',
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
                size="large"
                style={{
                  background: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </Col>

            <Col xs={12} md={5}>
              <Select
                placeholder="Danh mục"
                value={selectedCategoryId || selectedCategory || undefined}
                onChange={(val) => {
                  const cat = categories.find((c: any) => c.id === val || c.slug === val);
                  updateUrl({ category: cat?.slug, categoryId: cat?.id, page: 1 });
                }}
                allowClear
                size="large"
                style={{ width: '100%' }}
                options={[
                  { label: 'Tất cả danh mục', value: '' },
                  ...categories.map((c: any) => ({
                    label: c.name,
                    value: c.id,
                  })),
                ]}
              />
            </Col>

            <Col xs={12} md={5}>
              <Select
                value={sort}
                onChange={(val) => {
                  updateUrl({ sort: val, page: 1 });
                }}
                size="large"
                style={{ width: '100%' }}
                options={[
                  { label: 'Mới nhất', value: 'newest' },
                  { label: 'Giá: Thấp đến Cao', value: 'priceAsc' },
                  { label: 'Giá: Cao đến Thấp', value: 'priceDesc' },
                  { label: 'Được yêu thích nhất', value: 'popular' },
                ]}
              />
            </Col>

            <Col xs={24} md={6}>
              <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Khoảng giá:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  </span>
                </div>
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                  onChangeComplete={(val) => setCommittedPriceRange(val as [number, number])}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Product Grid */}
        {isLoading ? (
          <Row gutter={[24, 24]}>
            <ProductCardSkeleton count={8} />
          </Row>
        ) : isError ? (
          <ProductErrorState onRetry={() => refetch()} />
        ) : !productsData?.content || productsData.content.length === 0 ? (
          <ProductEmptyState
            title="Không tìm thấy sản phẩm phù hợp"
            message="Hãy thử điều chỉnh từ khóa tìm kiếm hoặc lọc theo danh mục khác."
            onReset={handleResetFilters}
            resetText="Xóa toàn bộ bộ lọc"
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {productsData.content.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {productsData.totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <Pagination
                  current={page}
                  total={productsData.totalElements}
                  pageSize={pageSize}
                  onChange={(p) => {
                    updateUrl({ page: p });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductListPage;
