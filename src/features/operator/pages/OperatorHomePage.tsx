import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Tag } from 'antd';
import {
  Printer,
  Play,
  CheckCircle,
  AlertOctagon,
  History,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../services/dashboardApi';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import type { PrintJob } from '../../printjob/types/printJob.types';
import '../../../components/home/actorHome.css';

export const OperatorHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real print jobs and printers from backend
  const { data: printJobs = [], isLoading: isJobsLoading } = useQuery<PrintJob[]>({
    queryKey: ['operator-home-print-jobs'],
    queryFn: dashboardApi.getPrintJobs,
  });

  const { data: printers = [] } = useQuery({
    queryKey: ['operator-home-printers'],
    queryFn: dashboardApi.getPrinters,
  });

  // Calculate Operator specific counts
  const printingCount = printJobs.filter((j) => j.status === 'PRINTING').length;
  const queuedCount = printJobs.filter(
    (j) => j.status === 'CREATED' || j.status === 'RESERVED' || j.status === 'ISSUED'
  ).length;
  const qcPendingCount = printJobs.filter((j) => j.status === 'COMPLETED').length;
  const failedCount = printJobs.filter((j) => j.status === 'FAILED' || j.status === 'CANCELLED').length;
  const completedTodayCount = printJobs.filter((j) => j.status === 'COMPLETED').length;

  // Resolve Next Task (the first job ready to start)
  const nextJob = printJobs.find(
    (j) => j.status === 'RESERVED' || j.status === 'CREATED' || j.status === 'ISSUED'
  ) || printJobs[0];

  const assignedPrinter = nextJob?.printerName
    || (nextJob?.printerId ? printers.find((p) => p.id === nextJob.printerId)?.name : null)
    || 'Bàn in tự động #01';

  return (
    <div className="actor-home-container" id="operator-home-page">
      {/* 1. Hero Greeting */}
      <HomeGreeting
        user={user}
        subtitle="Sẵn sàng cho ca làm việc hôm nay? Hãy xử lý từng lệnh in thật cẩn trọng, kiểm tra thông số lớp in và đảm bảo chất lượng kỷ vật hoàn hảo."
        badgeLabel="Kỹ thuật viên In 3D"
        badgeColor="purple"
      />

      {/* 2. Motivational Precision Quote */}
      <QuoteCard role="OPERATOR" />

      {/* 3. Primary Highlight: NEXT TASK */}
      <div className="next-task-card">
        <div className="next-task-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="next-task-badge">
                <Play size={12} style={{ fill: '#fff' }} />
                CÔNG VIỆC TIẾP THEO (NEXT TASK)
              </span>
              {nextJob && (
                <Tag color="cyan" style={{ margin: 0, fontWeight: 700 }}>
                  {nextJob.jobNumber || `#PJ-${nextJob.id?.substring(0, 6).toUpperCase()}`}
                </Tag>
              )}
            </div>
            <h2 style={{ margin: '8px 0 2px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {nextJob?.materialName ? `In kỷ vật vật liệu ${nextJob.materialName}` : 'Gia công mô hình Kỷ vật 3D Tiêu chuẩn'}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Kiểm tra cuộn nhựa, làm sạch bàn in và khởi động lệnh in theo đúng thông số kỹ thuật.
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<Play size={16} style={{ fill: '#fff' }} />}
            onClick={() => navigate('/manager/print-jobs')}
            style={{
              background: 'var(--primary, #7C5CFC)',
              borderColor: 'transparent',
              fontWeight: 700,
              height: 44,
              padding: '0 24px',
              borderRadius: 'var(--radius-full, 9999px)',
              boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
            }}
          >
            Bắt đầu công việc
          </Button>
        </div>

        <div className="next-task-details-grid">
          <div className="next-task-detail-item">
            <span className="next-task-detail-label">Mã lệnh in</span>
            <span className="next-task-detail-value">
              {nextJob?.jobNumber || '#PJ-1028'}
            </span>
          </div>
          <div className="next-task-detail-item">
            <span className="next-task-detail-label">Máy in dự kiến</span>
            <span className="next-task-detail-value">{assignedPrinter}</span>
          </div>
          <div className="next-task-detail-item">
            <span className="next-task-detail-label">Ước tính thời gian</span>
            <span className="next-task-detail-value">02h 15m</span>
          </div>
          <div className="next-task-detail-item">
            <span className="next-task-detail-label">Vật tư giữ chỗ</span>
            <span className="next-task-detail-value">
              {nextJob?.materialName || 'PLA+ Tough White'} ({nextJob?.estimatedGram ? `${nextJob.estimatedGram}g` : '150g'})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Summary Metrics */}
      <div className="stat-cards-grid">
        <HomeStatCard
          label="Print Job được giao"
          value={printJobs.length}
          subtext={`${queuedCount} lệnh đang chờ`}
          icon={<Printer size={18} />}
          iconBg="var(--surface-container, #F1EBFF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isJobsLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Đang in trên xưởng"
          value={printingCount}
          subtext="Đang gia công đùn nhựa"
          icon={<Cpu size={18} />}
          iconBg="var(--surface-high, #EBE4FF)"
          iconColor="var(--primary, #7C5CFC)"
          loading={isJobsLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Chờ Quality Check"
          value={qcPendingCount}
          subtext="Cần kiểm định lớp in"
          icon={<ShieldCheck size={18} />}
          iconBg="var(--peach-accent, #FFBFAE)"
          iconColor="var(--text-primary, #28243D)"
          loading={isJobsLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Lệnh in báo lỗi"
          value={failedCount}
          subtext="Cần kiểm tra sự cố"
          icon={<AlertOctagon size={18} />}
          iconBg="var(--error-container, #FFDAD6)"
          iconColor="var(--on-error-container, #93000A)"
          loading={isJobsLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
        <HomeStatCard
          label="Hoàn thành hôm nay"
          value={completedTodayCount}
          subtext="Đạt chuẩn bàn giao"
          icon={<CheckCircle size={18} />}
          iconBg="var(--mint-accent, #C9E8D5)"
          iconColor="var(--tertiary, #466253)"
          loading={isJobsLoading}
          onClick={() => navigate('/manager/print-jobs')}
        />
      </div>

      {/* 5. Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <span>Thao tác kỹ thuật xưởng</span>
        </h3>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Lệnh in của tôi"
            description="Xem danh sách hàng đợi in"
            icon={<Printer size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/print-jobs')}
          />
          <QuickActionCard
            title="Kiểm tra máy in"
            description="Nhiệt độ đùn, bàn in & camera"
            icon={<Cpu size={20} />}
            iconBg="var(--surface-high, #EBE4FF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/print-jobs')}
          />
          <QuickActionCard
            title="Quality Check (QC)"
            description="Kiểm tra kích thước & độ mịn"
            icon={<ShieldCheck size={20} />}
            iconBg="var(--mint-accent, #C9E8D5)"
            iconColor="var(--tertiary, #466253)"
            onClick={() => navigate('/manager/print-jobs')}
          />
          <QuickActionCard
            title="Lịch sử xuất nhập vật tư"
            description="Xem biến động cuộn nhựa"
            icon={<History size={20} />}
            iconBg="var(--peach-accent, #FFBFAE)"
            iconColor="var(--text-primary, #28243D)"
            onClick={() => navigate('/manager/inventory/transactions')}
          />
          <QuickActionCard
            title="Danh mục vật liệu"
            description="Xem tồn kho cuộn nhựa khả dụng"
            icon={<Layers size={20} />}
            iconBg="var(--surface-container, #F1EBFF)"
            iconColor="var(--primary, #7C5CFC)"
            onClick={() => navigate('/manager/materials')}
          />
        </div>
      </div>
    </div>
  );
};

export default OperatorHomePage;
