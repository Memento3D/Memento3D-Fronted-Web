import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Tag } from 'antd';
import {
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ClipboardCheck,
  AlertTriangle,
  Box,
  History,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { wmsEnterpriseApi } from '../../inventory/api/wmsEnterpriseApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { materialService } from '../../../services/materialService';
import { inventoryService } from '../../../services/inventoryService';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import { TodayTasks } from '../../../components/home/TodayTasks';
import type { TaskItem } from '../../../components/home/TodayTasks';
import '../../../components/home/actorHome.css';

export const WarehouseHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active warehouse
  const activeWarehouseId = localStorage.getItem('memento3d_active_warehouse_id');

  // Fetch balances to identify low stock items
  const { data: inventoryData, isLoading: isLowStockLoading } = useQuery({
    queryKey: ['warehouse-home-balances'],
    queryFn: () => inventoryService.listBalances({ limit: 50 }),
  });

  // Fetch receipts list
  const { data: receiptsData, isLoading: isReceiptsLoading } = useQuery({
    queryKey: ['warehouse-home-receipts'],
    queryFn: () => wmsEnterpriseApi.getGoodsReceipts({ size: 50 }),
  });

  // Fetch issues list
  const { data: issuesData, isLoading: isIssuesLoading } = useQuery({
    queryKey: ['warehouse-home-issues'],
    queryFn: () => wmsEnterpriseApi.getStockIssues({ size: 50 }),
  });

  // Fetch materials catalog
  const { data: materialsData, isLoading: isMatLoading } = useQuery({
    queryKey: ['warehouse-home-materials'],
    queryFn: () => materialService.list({ limit: 100 }),
  });

  // Fetch user authorized warehouses
  const { data: authorizedWarehouses = [] } = useQuery({
    queryKey: ['warehouse-home-my-warehouses'],
    queryFn: warehouseApi.getMyWarehouses,
  });

  const activeWarehouse = authorizedWarehouses.find((w) => w.id === activeWarehouseId) || authorizedWarehouses[0];

  const lowStockBalances = inventoryData?.content?.filter((b) => Number(b.availableGram) < 1000) || [];
  const totalMaterials = materialsData?.totalElements || materialsData?.content?.length || 0;
  const receiptsList = receiptsData?.content || [];
  const issuesList = issuesData?.content || [];

  const pendingReceipts = receiptsList.filter((r) => r.status === 'DRAFT' || r.status === 'SUBMITTED').length;
  const pendingIssues = issuesList.filter((i) => i.status === 'DRAFT' || i.status === 'SUBMITTED').length;

  // Build warehouse tasks needing attention
  const attentionTasks: TaskItem[] = [];

  if (lowStockBalances.length > 0) {
    attentionTasks.push({
      id: 'task-low-stock',
      title: `${lowStockBalances.length} cuộn nhựa / vật tư chạm ngưỡng tồn kho tối thiểu`,
      description: 'Cần lập phiếu nhập kho hoặc đề xuất điều chuyển để kịp thời bổ sung.',
      severity: 'danger',
      count: lowStockBalances.length,
      actionText: 'Tạo phiếu nhập',
      onAction: () => navigate('/manager/inventory/receipts/new'),
    });
  }

  if (pendingReceipts > 0) {
    attentionTasks.push({
      id: 'task-pending-receipts',
      title: `${pendingReceipts} phiếu nhập kho đang chờ kiểm định & nhập kho`,
      description: 'Kiểm tra bao bì, mã lô cuộn nhựa và xác nhận vào hệ thống.',
      severity: 'warning',
      count: pendingReceipts,
      actionText: 'Xác nhận nhập',
      onAction: () => navigate('/manager/receipts'),
    });
  }

  if (pendingIssues > 0) {
    attentionTasks.push({
      id: 'task-pending-issues',
      title: `${pendingIssues} phiếu xuất kho đang chờ bàn giao xưởng in`,
      description: 'Xuất vật tư theo lệnh in 3D đã được duyệt giữ trước.',
      severity: 'info',
      count: pendingIssues,
      actionText: 'Xử lý xuất',
      onAction: () => navigate('/manager/issues'),
    });
  }

  return (
    <div className="actor-home-container" id="warehouse-home-page">
      {/* 1. Hero Greeting */}
      <HomeGreeting
        user={user}
        subtitle="Kho vận tốt là nền tảng của một quy trình sản xuất ổn định. Kiểm soát xuất nhập chính xác, bảo toàn định mức và minh bạch dữ liệu tồn kho."
        badgeLabel="Thủ kho & Hậu cần WMS"
        badgeColor="cyan"
        actionContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="geekblue" icon={<WarehouseIcon size={12} style={{ marginRight: 4 }} />}>
              Kho: {activeWarehouse?.name || activeWarehouse?.code || 'Kho Trung tâm'}
            </Tag>
            {authorizedWarehouses.length > 1 && (
              <Button size="small" onClick={() => navigate('/warehouse/select')}>
                Đổi cơ sở kho
              </Button>
            )}
          </div>
        }
      />

      {/* 2. Motivational Warehouse Accuracy Quote */}
      <QuoteCard role="WAREHOUSE" />

      {/* 3. Summary Cards */}
      <div className="stat-cards-grid">
        <HomeStatCard
          label="Tổng vật liệu quản lý"
          value={totalMaterials}
          subtext="Danh mục cuộn nhựa & vật tư"
          icon={<Box size={18} />}
          iconBg="var(--surface-container, #F1EBFF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isMatLoading}
          onClick={() => navigate('/manager/materials')}
        />
        <HomeStatCard
          label="Vật liệu sắp hết"
          value={lowStockBalances.length}
          subtext="Chạm ngưỡng an toàn"
          icon={<AlertTriangle size={18} />}
          iconBg="var(--peach-accent, #FFBFAE)"
          iconColor="var(--text-primary, #28243D)"
          loading={isLowStockLoading}
          onClick={() => navigate('/manager/inventory')}
        />
        <HomeStatCard
          label="Phiếu nhập kho"
          value={receiptsList.length}
          subtext={`${pendingReceipts} phiếu chờ xử lý`}
          icon={<ArrowDownLeft size={18} />}
          iconBg="var(--mint-accent, #C9E8D5)"
          iconColor="var(--tertiary, #466253)"
          loading={isReceiptsLoading}
          onClick={() => navigate('/manager/receipts')}
        />
        <HomeStatCard
          label="Phiếu xuất kho"
          value={issuesList.length}
          subtext={`${pendingIssues} phiếu chờ xuất`}
          icon={<ArrowUpRight size={18} />}
          iconBg="var(--surface-high, #EBE4FF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isIssuesLoading}
          onClick={() => navigate('/manager/issues')}
        />
      </div>

      {/* 4. Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <span>Nghiệp vụ kho nhanh</span>
        </h3>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Tạo phiếu nhập kho"
            description="Tiếp nhận cuộn nhựa từ nhà cung cấp"
            icon={<ArrowDownLeft size={20} />}
            iconBg="var(--mint-accent, #C9E8D5)"
            iconColor="var(--tertiary, #466253)"
            badge="Nhập mới"
            onClick={() => navigate('/manager/inventory/receipts/new')}
          />
          <QuickActionCard
            title="Tạo phiếu xuất kho"
            description="Xuất cấp cuộn nhựa cho xưởng in"
            icon={<ArrowUpRight size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            badge="Xuất mới"
            onClick={() => navigate('/manager/inventory/issues/new')}
          />
          <QuickActionCard
            title="Tồn kho thực tế"
            description="Xem số dư khả dụng và vị trí bin"
            icon={<Layers size={20} />}
            iconBg="var(--surface-high, #EBE4FF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/inventory')}
          />
          <QuickActionCard
            title="Điều chuyển kho"
            description="Chuyển vật tư giữa các cơ sở"
            icon={<ArrowLeftRight size={20} />}
            iconBg="var(--peach-accent, #FFBFAE)"
            iconColor="var(--text-primary, #28243D)"
            onClick={() => navigate('/manager/transfers')}
          />
          <QuickActionCard
            title="Kiểm kê kho"
            description="Đối chiếu sổ sách và thực tế"
            icon={<ClipboardCheck size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/stock-counts')}
          />
          <QuickActionCard
            title="Sổ cái biến động kho"
            description="Lịch sử giao dịch từng cuộn nhựa"
            icon={<History size={20} />}
            iconBg="var(--surface-high, #EBE4FF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/inventory/transactions')}
          />
        </div>
      </div>

      {/* 5. Section "Việc cần chú ý hôm nay" */}
      <TodayTasks tasks={attentionTasks} />
    </div>
  );
};

export default WarehouseHomePage;
