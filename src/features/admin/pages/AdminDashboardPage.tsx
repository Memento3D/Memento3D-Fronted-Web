import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Row,
  Col,
  Card,
  Radio,
  Spin,
  Table,
  Button,
  Tag,
} from 'antd';
import {
  RefreshCw,
  Users,
  ShoppingBag,
  TrendingUp,
  Box,
  Printer,
  Package,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { OrderStatusDonutChart } from '../components/charts/OrderStatusDonutChart';
import { UserGrowthChart } from '../components/charts/UserGrowthChart';
import { ReconstructionStatsChart } from '../components/charts/ReconstructionStatsChart';

export const AdminDashboardPage: React.FC = () => {
  const [revenuePeriod, setRevenuePeriod] = useState<string>('30d');
  const [userGrowthPeriod, setUserGrowthPeriod] = useState<string>('30d');

  // 1. Dashboard summary
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
    isFetching,
  } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: adminApi.getDashboardSummary,
    refetchInterval: 30000,
  });

  // 2. Revenue trend
  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin-dashboard-revenue', revenuePeriod],
    queryFn: () => adminApi.getRevenueTrend(revenuePeriod),
  });

  // 3. User growth
  const { data: userGrowthData, isLoading: loadingGrowth } = useQuery({
    queryKey: ['admin-dashboard-user-growth', userGrowthPeriod],
    queryFn: () => adminApi.getUserGrowth(userGrowthPeriod),
  });

  // 4. Category performance
  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ['admin-dashboard-category-performance'],
    queryFn: adminApi.getCategoryPerformance,
  });

  const categoryColumns = [
    {
      title: 'Danh mục sản phẩm',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (val: string) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>,
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orderCount',
      key: 'orderCount',
      sorter: (a: any, b: any) => a.orderCount - b.orderCount,
      render: (val: number) => <Tag color="blue">{val} đơn</Tag>,
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: any, b: any) => a.revenue - b.revenue,
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: 'var(--tertiary)' }}>
          {(val || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} id="admin-analytics-view">
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Bảng điều khiển Giám sát Toàn diện
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tổng hợp dữ liệu thời gian thực từ cơ sở dữ liệu PostgreSQL và hạ tầng sản xuất
          </div>
        </div>
        <Button
          icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          onClick={() => refetchSummary()}
          style={{ borderRadius: 8 }}
        >
          Làm mới số liệu
        </Button>
      </div>

      {/* KPI Detail Cards Grid */}
      <Row gutter={[16, 16]}>
        {/* Users KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Người dùng
              </span>
              <Users size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {loadingSummary ? <Spin size="small" /> : summary?.users?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tertiary)', marginTop: 4 }}>
              {summary?.users?.active ?? 0} Hoạt động • {summary?.users?.locked ?? 0} Khóa
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              +{summary?.users?.newThisMonth ?? 0} tháng này
            </div>
          </Card>
        </Col>

        {/* Orders KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Đơn hàng
              </span>
              <ShoppingBag size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {loadingSummary ? <Spin size="small" /> : summary?.orders?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 4 }}>
              +{summary?.orders?.ordersToday ?? 0} hôm nay
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {summary?.orders?.completed ?? 0} đã hoàn thành
            </div>
          </Card>
        </Col>

        {/* Revenue KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Doanh thu
              </span>
              <TrendingUp size={16} color="var(--tertiary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--tertiary)', marginTop: 4 }}>
              {loadingSummary ? (
                <Spin size="small" />
              ) : (
                `${((summary?.revenue?.total || 0) / 1000000).toFixed(1)}M đ`
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Hôm nay: {((summary?.revenue?.today || 0) / 1000).toLocaleString('vi-VN')}k đ
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              AOV: {((summary?.revenue?.averageOrderValue || 0) / 1000).toLocaleString('vi-VN')}k đ
            </div>
          </Card>
        </Col>

        {/* Catalog KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Sản phẩm & Danh mục
              </span>
              <Package size={16} color="var(--secondary-active)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {loadingSummary ? <Spin size="small" /> : summary?.catalog?.totalProducts ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-active)', marginTop: 4 }}>
              {summary?.catalog?.totalCategories ?? 0} Phân loại
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Danh mục hoạt động
            </div>
          </Card>
        </Col>

        {/* 3D Reconstruction KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Tái tạo 3D AI
              </span>
              <Box size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {loadingSummary ? <Spin size="small" /> : summary?.reconstruction?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 4 }}>
              {summary?.reconstruction?.completed ?? 0} Xong • {summary?.reconstruction?.failed ?? 0} Lỗi
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {summary?.reconstruction?.premiumJobs ?? 0} HQ • {summary?.reconstruction?.previewJobs ?? 0} Preview
            </div>
          </Card>
        </Col>

        {/* Printers Hardware KPI */}
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Đội máy in
              </span>
              <Printer size={16} color="var(--tertiary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {loadingSummary ? <Spin size="small" /> : summary?.printers?.total ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--tertiary)', marginTop: 4 }}>
              {summary?.printers?.printersOnline ?? 0} Online
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 2 }}>
              {summary?.printers?.printersOffline ?? 0} Mất kết nối
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Charts - Revenue Trend & Order Status Donut */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Biến động Doanh thu Nền tảng (amCharts 5)
                </span>
                <Radio.Group
                  size="small"
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="today">Hôm nay</Radio.Button>
                  <Radio.Button value="7d">7 ngày</Radio.Button>
                  <Radio.Button value="30d">30 ngày</Radio.Button>
                  <Radio.Button value="3m">3 tháng</Radio.Button>
                  <Radio.Button value="6m">6 tháng</Radio.Button>
                  <Radio.Button value="1y">1 năm</Radio.Button>
                </Radio.Group>
              </div>
            }
            bordered={false}
            style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            {loadingRevenue ? (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin />
              </div>
            ) : (
              <RevenueTrendChart
                data={revenueData?.dataPoints || []}
                period={revenuePeriod}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                Phân bố Trạng thái Đơn hàng
              </span>
            }
            bordered={false}
            style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <OrderStatusDonutChart stats={summary?.orders} />
          </Card>
        </Col>
      </Row>

      {/* Row 3: User Growth & 3D Reconstruction Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Tăng trưởng Thành viên (Đăng ký mới & Tích lũy)
                </span>
                <Radio.Group
                  size="small"
                  value={userGrowthPeriod}
                  onChange={(e) => setUserGrowthPeriod(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="7d">7 ngày</Radio.Button>
                  <Radio.Button value="30d">30 ngày</Radio.Button>
                  <Radio.Button value="3m">3 tháng</Radio.Button>
                </Radio.Group>
              </div>
            }
            bordered={false}
            style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            {loadingGrowth ? (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin />
              </div>
            ) : (
              <UserGrowthChart data={userGrowthData?.dataPoints || []} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                Thống kê Tái tạo 3D AI
              </span>
            }
            bordered={false}
            style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <ReconstructionStatsChart stats={summary?.reconstruction} />
          </Card>
        </Col>
      </Row>

      {/* Row 4: Top Category Performance Table */}
      <Card
        title={
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Hiệu suất Danh mục Sản phẩm (Doanh thu & Số lượng đơn)
          </span>
        }
        bordered={false}
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
      >
        <Table
          columns={categoryColumns}
          dataSource={categoryData?.categories || []}
          rowKey="categoryId"
          loading={loadingCategories}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
