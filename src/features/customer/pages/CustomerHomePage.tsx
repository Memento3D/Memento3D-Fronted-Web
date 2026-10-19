import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Skeleton } from 'antd';
import {
  ThunderboltOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  Box,
  Layers,
  Camera,
  Gift,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useOrders } from '../../orders/hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../products/api/categoryApi';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
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
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders({
    page: 1,
    limit: 4,
  });

  // Fetch real categories from database
  const { data: realCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['customer-home-categories'],
    queryFn: () => categoryApi.list(true),
  });

  const recentOrders = ordersData?.orders || [];
  const categoriesList = realCategories && realCategories.length > 0 ? realCategories : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Storefront Navbar */}
      <Navbar />

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1300, margin: '0 auto', width: '100%' }}>
        {/* 1. Customer Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 20,
            padding: '36px 32px',
            marginBottom: 28,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, margin: 0, padding: '2px 10px' }}>
              Không gian Sáng tạo Khách hàng
            </Tag>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {user?.email}</span>
          </div>

          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {greeting}
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 740, lineHeight: 1.5 }}>
              Biến những khoảnh khắc đáng giá của bạn thành kỷ vật 3D cầm nắm được. Hãy bắt đầu tải ảnh quét hoặc khám phá bộ sưu tập độc bản hôm nay.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => navigate('/reconstruction/demo')}
              style={{
                height: 46,
                padding: '0 24px',
                borderRadius: 10,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                borderColor: 'transparent',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
              }}
            >
              Tạo mô hình 3D ngay
            </Button>
            <Button
              size="large"
              icon={<AppstoreOutlined />}
              onClick={() => navigate('/products')}
              style={{
                height: 46,
                padding: '0 24px',
                borderRadius: 10,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-primary)',
              }}
            >
              Khám phá sản phẩm
            </Button>
            <Button
              size="large"
              icon={<ShoppingBag size={16} />}
              onClick={() => navigate('/orders')}
              style={{
                height: 46,
                padding: '0 24px',
                borderRadius: 10,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--text-primary)',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {recentOrders.map((order: OrderResponse) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <Tag color={order.status === 'COMPLETED' ? 'green' : order.status === 'PRINTING' ? 'blue' : 'gold'}>
                      {getStatusLabel(order.status)}
                    </Tag>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {order.items?.length ? `${order.items.length} kỷ vật` : 'Kỷ vật 3D'} &bull;{' '}
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                      {((order.totalPrice || order.totalAmount || 0)).toLocaleString('vi-VN')} đ
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Xem chi tiết &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Product Categories Spotlight */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AppstoreOutlined style={{ color: 'var(--primary)' }} />
              <span>Danh mục sản phẩm & Dịch vụ 3D</span>
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Lựa chọn hình thức kỷ vật phù hợp nhất với câu chuyện của bạn
            </p>
          </div>

          {isCategoriesLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {categoriesList.map((cat: ProductCategory) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/categories/${cat.slug || cat.id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box size={22} color="var(--primary)" />
                        </div>
                      )}
                      <Tag color="cyan" style={{ margin: 0, fontWeight: 700, fontSize: '0.7rem' }}>
                        {cat.productCount != null ? `${cat.productCount} sản phẩm` : 'Bộ sưu tập'}
                      </Tag>
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {cat.description || 'Khám phá các mẫu kỷ vật 3D tinh xảo thuộc danh mục này.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: '0.825rem' }}>
                    <span>Khám phá ngay</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerHomePage;
