import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Slider,
  Button,
  Tag,
  Pagination,
  Spin,
  Empty,
  Typography,
  Space,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { useCart } from '../../cart/context/CartContext';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import type { Product } from '../types/product.types';

const { Title, Text, Paragraph } = Typography;

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [sort, setSort] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'popular'>(
    (searchParams.get('sort') as any) || 'newest'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const pageSize = 12;

  // Categories Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryApi.list(true),
    staleTime: 10 * 60 * 1000,
  });

  // Products Query
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-list', page, keyword, selectedCategory, sort, priceRange],
    queryFn: () =>
      productApi.list({
        page: page - 1,
        size: pageSize,
        keyword: keyword || undefined,
        categorySlug: selectedCategory || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 2000000 ? priceRange[1] : undefined,
        sort,
      }),
  });

  const handleSearch = () => {
    setPage(1);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    await addToCart({
      productId: product.id,
      quantity: 1,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <Tag color="cyan" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Bộ sưu tập Memento3D
          </Tag>
          <Title level={1} style={{ color: '#ffffff', margin: '4px 0 12px', fontWeight: 800 }}>
            Khám phá Tác phẩm 3D & Kỷ vật Cá nhân
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 640, display: 'inline-block' }}>
            Từng tác phẩm được in 3D với độ chi tiết vi mô từ nhựa quang hóa cao cấp và hoàn thiện thủ công.
          </Text>
        </div>

        {/* Filter & Search Bar */}
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            marginBottom: 32,
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
                size="large"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                }}
              />
            </Col>

            <Col xs={12} md={5}>
              <Select
                placeholder="Danh mục"
                value={selectedCategory || undefined}
                onChange={(val) => {
                  setSelectedCategory(val || '');
                  setPage(1);
                }}
                allowClear
                size="large"
                style={{ width: '100%' }}
                options={[
                  { label: 'Tất cả danh mục', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.slug })),
                ]}
              />
            </Col>

            <Col xs={12} md={5}>
              <Select
                value={sort}
                onChange={(val) => {
                  setSort(val);
                  setPage(1);
                }}
                size="large"
                style={{ width: '100%' }}
                options={[
                  { label: 'Mới nhất', value: 'newest' },
                  { label: 'Giá: Thấp đến Cao', value: 'priceAsc' },
                  { label: 'Giá: Cao đến Thấp', value: 'priceDesc' },
                  { label: 'Phổ biến nhất', value: 'popular' },
                ]}
              />
            </Col>

            <Col xs={24} md={6}>
              <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Khoảng giá:</span>
                  <span style={{ color: '#38bdf8' }}>
                    {formatCurrency(priceRange[0], 'VND')} - {formatCurrency(priceRange[1], 'VND')}
                  </span>
                </div>
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Product Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#94a3b8' }}>Đang tải danh sách tác phẩm...</div>
          </div>
        ) : !productsData?.content || productsData.content.length === 0 ? (
          <Empty
            description={<span style={{ color: '#94a3b8' }}>Không tìm thấy sản phẩm phù hợp.</span>}
            style={{ margin: '80px 0' }}
          >
            <Button
              type="primary"
              onClick={() => {
                setKeyword('');
                setSelectedCategory('');
                setPriceRange([0, 2000000]);
              }}
            >
              Xóa bộ lọc
            </Button>
          </Empty>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {productsData.content.map((product) => {
                const isOutOfStock = product.availability === 'OUT_OF_STOCK';
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/products/${product.slug}`)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 16,
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.25s ease, border-color 0.25s ease',
                      }}
                      bodyStyle={{
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                      cover={
                        <div
                          style={{
                            height: 220,
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#090d16',
                          }}
                        >
                          {product.thumbnailUrl ? (
                            <img
                              alt={product.name}
                              src={product.thumbnailUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#475569',
                                fontSize: '2.5rem',
                              }}
                            >
                              📦
                            </div>
                          )}

                          {product.featured && (
                            <Tag
                              color="gold"
                              style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                fontWeight: 700,
                                borderRadius: 6,
                              }}
                            >
                              <FireOutlined /> Nổi bật
                            </Tag>
                          )}

                          {product.category && (
                            <Tag
                              color="blue"
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                borderRadius: 6,
                              }}
                            >
                              {product.category.name}
                            </Tag>
                          )}

                          {isOutOfStock && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                                fontWeight: 800,
                                fontSize: '1rem',
                              }}
                            >
                              TẠM HẾT HÀNG
                            </div>
                          )}
                        </div>
                      }
                    >
                      <div style={{ flex: 1 }}>
                        <Title
                          level={4}
                          ellipsis={{ rows: 2 }}
                          style={{
                            color: '#ffffff',
                            margin: '0 0 8px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            minHeight: 44,
                          }}
                        >
                          {product.name}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 12 }}
                        >
                          {product.shortDescription || product.description || 'Kỷ vật 3D cá nhân hóa cao cấp.'}
                        </Paragraph>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div>
                          <Text style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                            Giá khởi điểm:
                          </Text>
                          <Text style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                            {formatCurrency(product.price, 'VND')}
                          </Text>
                        </div>

                        <Space>
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            disabled={isOutOfStock}
                            onClick={(e) => handleAddToCart(e, product)}
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
                );
              })}
            </Row>

            {/* Pagination */}
            {productsData.totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Pagination
                  current={page}
                  total={productsData.totalElements}
                  pageSize={pageSize}
                  onChange={(p) => setPage(p)}
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
