import { ReadState } from '../../../components/ui/ReadState';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, message } from 'antd';
import {
  ShoppingBag,
  Printer,
  Cpu,
  Layers,
  BarChart3,
  AlertTriangle,
  CheckSquare,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../services/dashboardApi';
import { inventoryService } from '../../../services/inventoryService';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import { TodayTasks } from '../../../components/home/TodayTasks';
import type { TaskItem } from '../../../components/home/TodayTasks';
import type { PrinterFleetItem } from '../../../types/dashboard';
import '../../../components/home/actorHome.css';

export const ManagerHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch real dashboard overview
  const dashboardQuery = useQuery({
    queryKey: ['manager-home-overview'],
    queryFn: () => dashboardApi.getDashboardData('today'),
  });
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    refetch,
    isFetching } = dashboardQuery;

  // 2. Fetch inventory low stock items
  const inventoryQuery = useQuery({
    queryKey: ['manager-home-inventory-balances'],
    queryFn: () => inventoryService.listBalances({ limit: 10 }),
  });
  const { data: inventoryData } = inventoryQuery;

  const summary = dashboardData?.summary;
  const printerFleet: PrinterFleetItem[] = dashboardData?.printerFleet || [];
  const lowStockBalances = inventoryData?.content?.filter((b) => Number(b.availableGram) < 1000) || [];
  const lowStockCount = lowStockBalances.length;

  // Active printers count
  const activePrintersCount = summary?.onlinePrinters || printerFleet.filter((p) => p.online).length;
  const totalPrintersCount = summary?.totalPrinters || printerFleet.length || 0;

  // Print jobs stats
  const runningJobsCount = summary?.activePrintJobs || 0;
  const failedJobsCount = summary?.failedJobs || 0;

  // Build tasks requiring attention
  const attentionTasks: TaskItem[] = [];

  if (failedJobsCount > 0) {
    attentionTasks.push({
      id: 'task-pending-jobs',
      title: `${failedJobsCount} lệnh in 3D gặp sự cố cần kiểm tra`,
      description: 'Lệnh in cần được xử lý lại thông số hoặc khởi động lại.',
      severity: 'warning',
      count: failedJobsCount,
      actionText: 'Xem lệnh in',
      onAction: () => navigate('/manager/print-jobs'),
    });
  }

  const offlinePrinters = printerFleet.filter((p) => !p.online || p.status === 'ERROR' || p.status === 'OFFLINE');
  if (offlinePrinters.length > 0) {
    attentionTasks.push({
      id: 'task-printers-offline',
      title: `${offlinePrinters.length} máy in đang ngoại tuyến hoặc báo lỗi`,
      description: 'Cần kiểm tra nguồn điện, kết nối agent hoặc bàn in 3D.',
      severity: 'danger',
      count: offlinePrinters.length,
      actionText: 'Kiểm tra máy',
      onAction: () => navigate('/manager/print-jobs'),
    });
  }

  if (lowStockCount > 0) {
    attentionTasks.push({
      id: 'task-low-stock',
      title: `${lowStockCount} vật liệu dưới định mức tối thiểu`,
      description: 'Cần lập phiếu đề xuất nhập kho để đảm bảo không gián đoạn sản xuất.',
      severity: 'warning',
      count: lowStockCount,
      actionText: 'Xem tồn kho',
      onAction: () => navigate('/manager/inventory'),
    });
  }

  const ordersCount = summary?.totalOrders || 0;
  if (ordersCount > 0) {
    attentionTasks.push({
      id: 'task-new-orders',
      title: `${ordersCount} đơn hàng mới cần theo dõi tiến độ`,
      description: 'Giám sát tiến độ chế tác và vận chuyển bàn giao cho khách hàng.',
      severity: 'info',
      count: ordersCount,
      actionText: 'Xử lý đơn',
      onAction: () => navigate('/manager/orders'),
    });
  }

  return (
    <div className="actor-home-container" id="manager-home-page">
      <ReadState isLoading={dashboardQuery.isPending || inventoryQuery.isPending} isError={dashboardQuery.isError || inventoryQuery.isError}
        isFetching={dashboardQuery.isFetching || inventoryQuery.isFetching} hasData={dashboardQuery.data != null && inventoryQuery.data != null} onRetry={() => { void dashboardQuery.refetch(); void inventoryQuery.refetch(); }}>
      {/* 1. Hero Greeting */}
      <HomeGreeting
        user={user}
        subtitle="Hôm nay là một ngày mới để đưa Memento3D tiến thêm một bước. Kiểm soát hệ thống, thúc đẩy quy trình và nâng cao năng suất."
        badgeLabel="Quản lý Vận hành"
        badgeColor="purple"
        actionContent={
          <Button
            icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => {
              refetch();
              message.success('Đã làm mới dữ liệu vận hành');
            }}
            style={{ borderRadius: 'var(--radius-pill, 9999px)' }}
          >
            Làm mới
          </Button>
        }
      />

      {/* 2. Motivational Leadership Quote */}
      <QuoteCard role="MANAGER" />

      {/* 3. Summary Cards */}
      <div className="stat-cards-grid">
        <HomeStatCard
          label="Đơn hàng hôm nay"
          value={summary?.totalOrders ?? 0}
          subtext="Đơn đặt in & kỷ vật"
          icon={<ShoppingBag size={18} />}
          iconBg="var(--surface-container, #F1EBFF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isDashLoading}
          onClick={() => navigate('/manager/orders')}
        />
        <HomeStatCard
          label="Print Job đang chạy"
          value={runningJobsCount}
          subtext={`${summary?.completedPrints ?? 0} lệnh đã hoàn thành`}
          icon={<Printer size={18} />}
          iconBg="var(--surface-container, #F1EBFF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isDashLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Máy in đang hoạt động"
          value={`${activePrintersCount} / ${totalPrintersCount}`}
          subtext="Trực tuyến trên xưởng"
          icon={<Cpu size={18} />}
          iconBg="var(--surface-container, #F1EBFF)"
          iconColor="var(--tertiary, #466253)"
          loading={isDashLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Tồn kho cảnh báo"
          value={lowStockCount}
          subtext="Vật liệu chạm ngưỡng"
          icon={<AlertTriangle size={18} />}
          iconBg="var(--error-container, #FFDAD6)"
          iconColor="var(--error, #BA1A1A)"
          loading={isDashLoading}
          onClick={() => navigate('/manager/inventory')}
        />
      </div>

      {/* 4. Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <span>Lối tắt điều hành</span>
        </h3>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Xem đơn hàng"
            description="Xử lý đơn & cập nhật tiến độ"
            icon={<ShoppingBag size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/orders')}
          />
          <QuickActionCard
            title="Quản lý Print Job"
            description="Phân bổ và điều phối lệnh in"
            icon={<Printer size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/print-jobs')}
          />
          <QuickActionCard
            title="Kiểm tra máy in"
            description="Trạng thái máy và camera nhiệt"
            icon={<Cpu size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--tertiary, #466253)"
            onClick={() => navigate('/manager/print-jobs')}
          />
          <QuickActionCard
            title="Xem kho & Vật liệu"
            description="Kiểm tra tồn kho và định mức"
            icon={<Layers size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary-system, #5F3ADD)"
            onClick={() => navigate('/manager/inventory')}
          />
          <QuickActionCard
            title="Xem báo cáo Dashboard"
            description="Phân tích doanh thu & hiệu suất"
            icon={<BarChart3 size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/dashboard')}
          />
          <QuickActionCard
            title="Trung tâm phê duyệt"
            description="Duyệt xuất nhập & điều chuyển"
            icon={<CheckSquare size={20} />}
            iconBg="var(--error-container, #FFDAD6)"
            iconColor="var(--error, #BA1A1A)"
            onClick={() => navigate('/manager/approvals')}
          />
        </div>
      </div>

      {/* 5. Section "Việc cần chú ý hôm nay" */}
      <TodayTasks tasks={attentionTasks} />
      </ReadState>
    </div>
  );
};

export default ManagerHomePage;
