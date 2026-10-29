import React, { useState } from 'react';
import { Row, Col, Alert, Spin, Button, Card } from 'antd';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Box, 
  Cpu, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../../hooks/useDashboard';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import type { DashboardTimeRange } from '../../../types/dashboard';
import { formatVndCurrency, formatCompactNumber, formatGrams } from '../../../utils/chartFormatter';

// 3D and Visualization components
import { DashboardHero } from '../../../components/dashboard/DashboardHero';
import { DashboardFilters } from '../../../components/dashboard/DashboardFilters';
import { MetricCard } from '../../../components/dashboard/MetricCard';
import { RevenueChart } from '../../../components/charts/RevenueChart';
import { OrderStatusChart } from '../../../components/charts/OrderStatusChart';
import { ReconstructionChart } from '../../../components/charts/ReconstructionChart';
import { MaterialUsageChart } from '../../../components/charts/MaterialUsageChart';
import { PrinterPerformanceChart } from '../../../components/charts/PrinterPerformanceChart';
import { PrinterFleetSection } from '../../../components/dashboard/PrinterFleetSection';
import { ActivityTimeline } from '../../../components/dashboard/ActivityTimeline';
import { Model3DPreview } from '../../../components/three/Model3DPreview';

export const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWarehouse } = useWarehouseContext();
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>('30d');
  const [is3DModalOpen, setIs3DModalOpen] = useState<boolean>(false);

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
    isFetching,
    isRealTimeConnected,
  } = useDashboard({
    timeRange,
    warehouseId: activeWarehouse?.id,
  });

  if ((isLoading || (isError && isFetching)) && !dashboard) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '65vh',
          background: 'var(--bg-app, #F8F5FF)',
        }}
      >
        <Spin size="large" />
        <div style={{ color: 'var(--text-secondary, #6A6282)', marginTop: 16, fontSize: '0.9rem', fontWeight: 600 }}>
          Đang khởi tạo Trung tâm điều khiển Memento3D & Thiết lập luồng Telemetry...
        </div>
      </div>
    );
  }

  if (isError && !dashboard) {
    return (
      <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
        <Alert
          type="error"
          message="Không thể kết nối Trung tâm dữ liệu Memento3D"
          description="Vui lòng thử lại."
          action={<Button type="primary" onClick={() => refetch()}>Thử lại</Button>}
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  const summary = dashboard?.summary;
  const fleetMetrics = dashboard?.fleetMetrics;

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: 1680,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'transparent',
      }}
    >
      {/* 1. Global Filter Bar */}
      <DashboardFilters
        timeRange={timeRange}
        onTimeRangeChange={(r) => setTimeRange(r)}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        isRealTimeConnected={isRealTimeConnected}
        onOpen3DViewer={() => setIs3DModalOpen(true)}
        lastUpdated={dashboard?.meta.lastUpdated}
      />

      {/* 2. 3D Hero Overview */}
      <DashboardHero
        activeJobsCount={summary?.activePrintJobs ?? 8}
        onlinePrintersCount={summary?.onlinePrinters ?? 7}
        successRate={fleetMetrics?.successRate ?? 98.4}
        isRealTimeConnected={isRealTimeConnected}
        onOpen3DViewer={() => setIs3DModalOpen(true)}
      />

      {/* 3. 10 Interactive 3D KPI Cards */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {/* Row 1 of KPI Cards */}
          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Tổng đơn hàng"
              value={formatCompactNumber(summary?.totalOrders ?? 0)}
              deltaPct={summary?.ordersDeltaPct}
              icon={<ShoppingBag size={20} />}
              sparkline={summary?.ordersSparkline}
              colorTheme="cyan"
              tooltipText="Tổng số lượng đơn đặt hàng in 3D & sản phẩm vật lý trong kỳ"
              isRealTimeUpdated
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Doanh thu"
              value={formatVndCurrency(summary?.revenueVnd ?? 0)}
              deltaPct={summary?.revenueDeltaPct}
              icon={<DollarSign size={20} />}
              sparkline={summary?.revenueSparkline}
              colorTheme="emerald"
              tooltipText="Tổng doanh thu thực nhận đã thanh toán thành công"
              isRealTimeUpdated
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Khách hàng tích cực"
              value={summary?.activeCustomers ?? 0}
              deltaPct={summary?.customersDeltaPct}
              icon={<Users size={20} />}
              sparkline={summary?.customersSparkline}
              colorTheme="indigo"
              tooltipText="Khách hàng đã hoàn thành đơn hoặc có scan đang tái tạo"
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Mô hình 3D tạo thành"
              value={summary?.modelsGenerated ?? 0}
              deltaPct={summary?.modelsDeltaPct}
              icon={<Box size={20} />}
              sparkline={summary?.modelsSparkline}
              colorTheme="purple"
              tooltipText="File mô hình GLB / OBJ hoàn tất khâu trích xuất điểm"
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Tác vụ Tái tạo 3D"
              value={summary?.reconstructionJobs ?? 0}
              deltaPct={summary?.reconstructionDeltaPct}
              icon={<Cpu size={20} />}
              sparkline={[14, 18, 22, 19, 26, 30, summary?.reconstructionJobs ?? 32]}
              colorTheme="cyan"
              tooltipText="Tổng số tác vụ NeRF & Gaussian Splatting đã đưa vào hàng đợi"
            />
          </Col>
        </Row>

        {/* Row 2 of KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Lệnh in đang chạy"
              value={summary?.activePrintJobs ?? 0}
              deltaPct={summary?.activePrintJobsDeltaPct}
              icon={<Printer size={20} />}
              sparkline={summary?.printJobsSparkline}
              colorTheme="cyan"
              tooltipText="Các máy in đang thực hiện đùn sợi FDM hoặc chiếu UV Resin"
              isRealTimeUpdated
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Bản in hoàn tất"
              value={summary?.completedPrints ?? 0}
              deltaPct={summary?.completedPrintsDeltaPct}
              icon={<CheckCircle2 size={20} />}
              sparkline={[8, 12, 15, 18, 24, 28, summary?.completedPrints ?? 30]}
              colorTheme="emerald"
              tooltipText="Số lượng sản phẩm in thành công vượt qua khâu kiểm chuẩn QC"
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Lệnh in thất bại"
              value={summary?.failedJobs ?? 0}
              deltaPct={summary?.failedJobsDeltaPct}
              deltaLabel="giảm so với kỳ trước"
              icon={<AlertTriangle size={20} />}
              sparkline={[4, 3, 5, 2, 3, 2, summary?.failedJobs ?? 1]}
              colorTheme="rose"
              tooltipText="Sự cố đứt sợi nhựa, mất nguồn hoặc lỗi bám dính bàn nhiệt"
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Máy in trực tuyến"
              value={`${summary?.onlinePrinters ?? 0} / ${summary?.totalPrinters ?? 0}`}
              icon={<Wifi size={20} />}
              sparkline={[6, 7, 7, 8, 8, 8, summary?.onlinePrinters ?? 8]}
              colorTheme="emerald"
              tooltipText="Máy in có kết nối OctoPrint / Bambu Cloud trực tiếp"
              isRealTimeUpdated
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={4} xl={4} style={{ flex: '1 0 19%' }}>
            <MetricCard
              title="Vật liệu tiêu hao"
              value={formatGrams(summary?.materialUsageGram ?? 0)}
              deltaPct={summary?.materialUsageDeltaPct}
              icon={<Layers size={20} />}
              sparkline={[1200, 1400, 1800, 1600, 2100, 2400, summary?.materialUsageGram ?? 2500]}
              colorTheme="amber"
              tooltipText="Tổng khối lượng cuộn nhựa và mực Resin đã đùn ra phôi in"
            />
          </Col>
        </Row>
      </div>

      {/* 4. Primary amCharts Visualizations: Revenue Analytics & Order Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={15}>
          <RevenueChart data={dashboard?.revenueSeries || []} />
        </Col>
        <Col xs={24} lg={9}>
          <OrderStatusChart
            data={dashboard?.orderStatusSeries || []}
            totalOrders={summary?.totalOrders ?? 0}
          />
        </Col>
      </Row>

      {/* 5. Secondary Visualizations: Reconstruction Pipeline & Material Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <ReconstructionChart data={dashboard?.reconstructionSeries || []} />
        </Col>
        <Col xs={24} lg={12}>
          <MaterialUsageChart data={dashboard?.materialUsageSeries || []} />
        </Col>
      </Row>

      {/* 6. Printer Performance & Fleet Telemetry Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <PrinterPerformanceChart
            metrics={
              fleetMetrics || {
                overallUtilization: 84,
                successRate: 98.4,
                failureRate: 1.6,
                avgPrintMinutes: 145,
                totalGramsUsed: 18450,
              }
            }
            onlineCount={summary?.onlinePrinters ?? 7}
            totalPrinters={summary?.totalPrinters ?? 8}
          />
        </div>

        <PrinterFleetSection printers={dashboard?.printerFleet || []} />
      </div>

      {/* 7. Bottom Section: Live Activity Feed + Quick WMS Management Shortcuts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ActivityTimeline activities={dashboard?.recentActivities || []} />
        </Col>

        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-card, 24px)',
              border: '1px solid var(--border-default, #E2D9F7)',
              boxShadow: 'var(--shadow-card)',
              height: '100%',
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>
                  Trung tâm Điều hành & Vận hành Kho (WMS)
                </span>
                <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', marginTop: 2 }}>
                  Lối tắt phê duyệt và kiểm kê lưu chuyển vật liệu
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => navigate('/manager/approvals')}
                style={{ background: 'var(--primary, #7C5CFC)', borderRadius: 'var(--radius-pill, 9999px)', fontWeight: 600, border: 'none', boxShadow: 'var(--shadow-primary-sm)' }}
              >
                Trung tâm duyệt đơn
              </Button>
            </div>

            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
              <Col xs={12} sm={6}>
                <div
                  onClick={() => navigate('/manager/receipts')}
                  style={{
                    background: 'var(--surface-container, #F1EBFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    borderRadius: 'var(--radius-default, 16px)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary, #7C5CFC)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default, #E2D9F7)')}
                >
                  <ArrowDownLeft color="var(--primary, #7C5CFC)" size={24} style={{ margin: '0 auto 8px' }} />
                  <div style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '0.85rem' }}>Nhập kho</div>
                  <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.72rem' }}>Phiếu nhập vật tư</div>
                </div>
              </Col>

              <Col xs={12} sm={6}>
                <div
                  onClick={() => navigate('/manager/issues')}
                  style={{
                    background: 'var(--surface-container, #F1EBFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    borderRadius: 'var(--radius-default, 16px)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E07A5F')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default, #E2D9F7)')}
                >
                  <ArrowUpRight color="#E07A5F" size={24} style={{ margin: '0 auto 8px' }} />
                  <div style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '0.85rem' }}>Xuất kho</div>
                  <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.72rem' }}>Xuất nhựa cho máy</div>
                </div>
              </Col>

              <Col xs={12} sm={6}>
                <div
                  onClick={() => navigate('/manager/transfers')}
                  style={{
                    background: 'var(--surface-container, #F1EBFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    borderRadius: 'var(--radius-default, 16px)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-system, #5F3ADD)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default, #E2D9F7)')}
                >
                  <ArrowLeftRight color="var(--primary-system, #5F3ADD)" size={24} style={{ margin: '0 auto 8px' }} />
                  <div style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '0.85rem' }}>Điều chuyển</div>
                  <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.72rem' }}>Giữa các xưởng in</div>
                </div>
              </Col>

              <Col xs={12} sm={6}>
                <div
                  onClick={() => navigate('/manager/adjustments')}
                  style={{
                    background: 'var(--surface-container, #F1EBFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    borderRadius: 'var(--radius-default, 16px)',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--tertiary, #466253)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default, #E2D9F7)')}
                >
                  <Sliders color="var(--tertiary, #466253)" size={24} style={{ margin: '0 auto 8px' }} />
                  <div style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '0.85rem' }}>Điều chỉnh</div>
                  <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.72rem' }}>Cân đối tồn kho</div>
                </div>
              </Col>
            </Row>

            <div
              style={{
                marginTop: 20,
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-default, #E2D9F7)',
                borderRadius: 'var(--radius-default, 16px)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600, fontSize: '0.875rem' }}>
                  Sổ cái giao dịch vật tư bất biến (ACID Ledger)
                </div>
                <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.75rem', marginTop: 2 }}>
                  Kiểm tra toàn bộ lịch sử biến động từng gram nhựa in 3D
                </div>
              </div>
              <Button
                type="link"
                onClick={() => navigate('/manager/inventory/transactions')}
                style={{ color: 'var(--primary, #7C5CFC)', fontWeight: 700 }}
              >
                Xem sổ cái →
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 8. 3D Model Studio Viewer Modal */}
      <Model3DPreview
        open={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title="Memento3D Studio Engine • Mô hình In 3D & Kiểm chuẩn Lớp In"
      />
    </div>
  );
};

export default ManagerDashboardPage;
