import { ReadState } from '../../../components/ui/ReadState';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Skeleton } from 'antd';
import {
  ThunderboltOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  Box,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useOrders } from '../../orders/hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../products/api/categoryApi';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { getGreeting } from '../../../utils/getGreeting';
import { getStatusLabel } from '../../../locales/i18n';
import type { OrderResponse } from '../../orders/types/order.types';
import type { ProductCategory } from '../../products/types/product.types';
import '../../../components/home/actorHome.css';

export const CustomerHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { greeting } = getGreeting(user?.fullName || user?.email?.split('@')[0]);

  // Fetch customer's own recent orders (real data)
  const ordersQuery = useOrders({
    page: 1,
    limit: 4,
  });
  const { data: ordersData, isLoading: isOrdersLoading } = ordersQuery;

  // Fetch real categories from database (shared cache with product catalog)
  const categoryQuery = useQuery({
    queryKey: ['categories-active'],
    queryFn: () => categoryApi.list(true),
    staleTime: 10 * 60 * 1000,
  });
  const { data: realCategories, isLoading: isCategoriesLoading } = categoryQuery;

  const recentOrders = ordersData?.orders || [];
  const categoriesList = realCategories && realCategories.length > 0 ? realCategories : [];

  return (
    <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
      <ReadState isLoading={ordersQuery.isPending || categoryQuery.isPending} isError={ordersQuery.isError || categoryQuery.isError}
        isFetching={ordersQuery.isFetching || categoryQuery.isFetching} hasData={ordersQuery.data != null && categoryQuery.data != null} onRetry={() => { void ordersQuery.refetch(); void categoryQuery.refetch(); }}>
        {/* 1. Customer Hero Banner */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card, 10px)',
            padding: '24px 28px',
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600, margin: 0, padding: '2px 8px' }}>
              Không gian Sáng tạo Khách hàng
            </Tag>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>• {user?.email}</span>
          </div>

          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {greeting}
            </h1>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 720, lineHeight: 1.5 }}>
              Biến những khoảnh khắc đáng giá của bạn thành kỷ vật 3D cầm nắm được. Hãy bắt đầu tải ảnh quét hoặc khám phá bộ sưu tập độc bản hôm nay.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate('/create-keepsake')}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontWeight: 600,
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                boxShadow: 'none',
              }}
            >
              Tạo mô hình 3D ngay
            </Button>
            <Button
              size="large"
              icon={<AppstoreOutlined />}
              onClick={() => navigate('/products')}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontWeight: 500,
              }}
            >
              Khám phá sản phẩm
            </Button>
            <Button
              size="large"
              icon={<ShoppingBag size={15} />}
              onClick={() => navigate('/orders')}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontWeight: 500,
              }}
            >
              Đơn hàng của tôi
            </Button>
          </div>
        </div>

        {/* 2. Emotional Quote Card */}
        <div style={{ marginBottom: 28 }}>
          <QuoteCard role="CUSTOMER" tag="THÔNG ĐIỆP KỶ NIỆM" />
        </div>

        {/* 3. Recent Orders Summary Section */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} color="var(--primary)" />
              <span>Đơn hàng kỷ vật gần đây</span>
            </h2>
            <Button type="link" onClick={() => navigate('/orders')} style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Xem tất cả đơn hàng &rarr;
            </Button>
          </div>

          {isOrdersLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentOrders.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-color)',
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
              }}
            >
              <Box size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Bạn chưa có đơn hàng nào</h3>
              <p style={{ margin: '6px 0 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Hãy tạo mô hình 3D đầu tiên hoặc chọn sản phẩm từ danh mục để bắt đầu lưu giữ kỷ niệm.
              </p>
              <Button type="primary" onClick={() => navigate('/products')}>
                Khám phá bộ sưu tập ngay
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {recentOrders.map((order: OrderResponse) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-card, 10px)',
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <Tag color={order.status === 'COMPLETED' ? 'green' : order.status === 'PRINTING' ? 'blue' : 'gold'} style={{ borderRadius: 4, margin: 0 }}>
                      {getStatusLabel(order.status)}
                    </Tag>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {order.items?.length ? `${order.items.length} kỷ vật` : 'Kỷ vật 3D'} &bull;{' '}
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                      {((order.totalPrice || order.totalAmount || 0)).toLocaleString('vi-VN')} đ
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Xem chi tiết &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Product Categories Spotlight */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AppstoreOutlined style={{ color: 'var(--primary)' }} />
              <span>Danh mục sản phẩm & Dịch vụ 3D</span>
            </h2>
            <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
              Lựa chọn hình thức kỷ vật phù hợp nhất với câu chuyện của bạn
            </p>
          </div>

          {isCategoriesLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {categoriesList.map((cat: ProductCategory) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/categories/${cat.slug || cat.id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-card, 10px)',
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm, 6px)', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm, 6px)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box size={20} color="var(--primary)" />
                        </div>
                      )}
                      <Tag color="cyan" style={{ margin: 0, fontWeight: 600, fontSize: '0.7rem', borderRadius: 4 }}>
                        {(cat as any).productCount != null ? `${(cat as any).productCount} sản phẩm` : 'Bộ sưu tập'}
                      </Tag>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.775rem', lineHeight: 1.4 }}>
                      {cat.description || 'Khám phá các mẫu kỷ vật 3D tinh xảo thuộc danh mục này.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                    <span>Khám phá ngay</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ReadState>
    </div>
  );
};

export default CustomerHomePage;
