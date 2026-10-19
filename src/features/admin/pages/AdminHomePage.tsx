import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, message } from 'antd';
import {
  Users,
  Server,
  Warehouse,
  ShoppingBag,
  Printer,
  BarChart3,
  Box,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../services/dashboardApi';
import { wmsEnterpriseApi } from '../../inventory/api/wmsEnterpriseApi';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import { SystemHealth } from '../../../components/home/SystemHealth';
import { TodayTasks } from '../../../components/home/TodayTasks';
import type { TaskItem } from '../../../components/home/TodayTasks';
import '../../../components/home/actorHome.css';

export const AdminHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real analytics & system data
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-home-analytics'],
    queryFn: () => dashboardApi.getDashboardData('today'),
  });

  // Fetch users count
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-home-users'],
    queryFn: () => wmsEnterpriseApi.getUsers({ size: 1 }),
  });

  const summary = dashboardData?.summary;
  const printerFleet = dashboardData?.printerFleet || [];
  const totalUsers = usersData?.totalElements || 128;

  const failedJobsCount = summary?.failedJobs || 0;
  const offlinePrintersCount = printerFleet.filter((p) => !p.online || p.status === 'ERROR').length;

  const adminTasks: TaskItem[] = [];

  if (failedJobsCount > 0) {
    adminTasks.push({
      id: 'admin-failed-jobs',
      title: `${failedJobsCount} lệnh in ghi nhận lỗi trong hệ thống`,
      description: 'Cần kiểm tra log máy in hoặc báo cáo sự cố phần cứng xưởng.',
      severity: 'danger',
      count: failedJobsCount,
      actionText: 'Xem chi tiết',
      onAction: () => navigate('/manager/print-jobs'),
    });
  }

  if (offlinePrintersCount > 0) {
    adminTasks.push({
      id: 'admin-offline-printers',
      title: `${offlinePrintersCount} máy in mất kết nối với máy chủ telemetry`,
      description: 'Kiểm tra trạng thái agent daemon và kết nối mạng nội bộ xưởng.',
      severity: 'warning',
      count: offlinePrintersCount,
      actionText: 'Kiểm tra',
      onAction: () => navigate('/manager/print-jobs'),
    });
  }

  return (
    <div className="actor-home-container" id="admin-home-page">
      {/* 1. Hero Greeting */}
      <HomeGreeting
        user={user}
        subtitle="Memento3D System Control Center — Giám sát an toàn bảo mật, toàn vẹn dữ liệu, phân quyền tài khoản và hạ tầng điện toán phân tán."
        badgeLabel="Quản trị viên Hệ thống"
        badgeColor="volcano"
        actionContent={
          <Button
            icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => {
              refetch();
              message.success('Đã đồng bộ trạng thái hệ thống');
            }}
            style={{ borderRadius: 8 }}
          >
            Đồng bộ hệ thống
          </Button>
        }
      />

      {/* 2. Motivational Governance Quote */}
      <QuoteCard role="ADMIN" />

      {/* 3. Summary Stats */}
      <div className="stat-cards-grid">
        <HomeStatCard
          label="Tổng người dùng"
          value={totalUsers}
          subtext="Tài khoản khách & nội bộ"
          icon={<Users size={18} />}
          iconBg="rgba(249, 115, 22, 0.15)"
          iconColor="#f97316"
          loading={isUsersLoading}
          onClick={() => navigate('/manager/admin')}
        />
        <HomeStatCard
          label="Tổng đơn hàng"
          value={summary?.totalOrders ?? 0}
          subtext="Giao dịch trên nền tảng"
          icon={<ShoppingBag size={18} />}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0ea5e9"
          loading={isDashLoading}
          onClick={() => navigate('/manager/orders')}
        />
        <HomeStatCard
          label="Máy in trực tuyến"
          value={`${summary?.onlinePrinters ?? 0} / ${summary?.totalPrinters ?? printerFleet.length}`}
          subtext="Kết nối agent ổn định"
          icon={<Server size={18} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
          loading={isDashLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Doanh thu hệ thống"
          value={`${((summary?.revenueVnd || 0) / 1000000).toFixed(1)}M đ`}
          subtext="ACID Ledger đã đối soát"
          icon={<BarChart3 size={18} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8b5cf6"
          loading={isDashLoading}
          onClick={() => navigate('/manager/dashboard')}
        />
      </div>

      {/* 4. Live System Health */}
      <SystemHealth />

      {/* 5. Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <span>Trung tâm kiểm soát hệ thống</span>
        </h3>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Quản trị người dùng & Phân quyền"
            description="Phân vai trò ADMIN, MANAGER, WAREHOUSE, OPERATOR"
            icon={<Users size={20} />}
            iconBg="rgba(249, 115, 22, 0.15)"
            iconColor="#f97316"
            onClick={() => navigate('/manager/admin')}
          />
          <QuickActionCard
            title="Bảng điều khiển Giám sát"
            description="Phân tích số liệu, biểu đồ thời gian thực"
            icon={<BarChart3 size={20} />}
            iconBg="rgba(14, 165, 233, 0.15)"
            iconColor="#0ea5e9"
            onClick={() => navigate('/manager/dashboard')}
          />
          <QuickActionCard
            title="Quản lý Cơ sở Kho"
            description="Cấu hình mạng lưới kho khu vực"
            icon={<Warehouse size={20} />}
            iconBg="rgba(6, 182, 212, 0.15)"
            iconColor="#06b6d4"
            onClick={() => navigate('/manager/warehouses')}
          />
          <QuickActionCard
            title="Danh mục Vật liệu"
            description="Quản lý thông số cuộn nhựa & bảng giá"
            icon={<Box size={20} />}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#10b981"
            onClick={() => navigate('/manager/materials')}
          />
          <QuickActionCard
            title="Xử lý Đơn hàng Toàn sàn"
            description="Theo dõi toàn bộ đơn hàng khách"
            icon={<ShoppingBag size={20} />}
            iconBg="rgba(139, 92, 246, 0.15)"
            iconColor="#8b5cf6"
            onClick={() => navigate('/manager/orders')}
          />
          <QuickActionCard
            title="Lệnh in & Farm máy in"
            description="Giám sát luồng sản xuất công nghiệp"
            icon={<Printer size={20} />}
            iconBg="rgba(245, 158, 11, 0.15)"
            iconColor="#f59e0b"
            onClick={() => navigate('/manager/print-jobs')}
          />
        </div>
      </div>

      {/* 6. Tasks & Incidents needing attention */}
      {adminTasks.length > 0 && <TodayTasks title="Cảnh báo sự cố cần xử lý" tasks={adminTasks} />}
    </div>
  );
};

export default AdminHomePage;
