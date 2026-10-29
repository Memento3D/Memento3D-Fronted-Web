import { ErrorState } from '../../../components/ui/ErrorState';
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Typography,
  Spin,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { scanReconstructionService } from '../../../services/scanReconstructionService';
import type { ReconstructionJobItem } from '../../../services/scanReconstructionService';

const { Title, Text } = Typography;

export const MyModelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ReconstructionJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [hasError, setHasError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let isMounted = true;
    scanReconstructionService
      .getMyJobs(1, 50)
      .then((data) => {
        if (isMounted) setJobs(data.jobs);
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reload]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Sẵn sàng (3D Ready)</Tag>;
      case 'running':
      case 'processing':
        return <Tag color="processing" icon={<SyncOutlined spin />}>Đang dựng mô hình AI</Tag>;
      case 'queued':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Đang chờ xử lý</Tag>;
      case 'failed':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Thất bại</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
              Mô Hình 3D Của Tôi
            </Title>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Quản lý các bản dựng 3D cá nhân hóa, xem lại mô phỏng in và gửi yêu cầu chế tác xưởng.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/create-keepsake')}
            style={{
              background: 'var(--primary, #7C5CFC)',
              borderRadius: 8,
              fontWeight: 700,
              padding: '0 24px',
            }}
          >
            Tạo kỷ vật mới
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <Text style={{ display: 'block', color: 'var(--text-secondary)', marginTop: 16 }}>
              Đang tải danh sách mô hình 3D...
            </Text>
          </div>
        ) : hasError ? (
          <ErrorState onRetry={() => {
            setHasError(false);
            setIsLoading(true);
            setReload((value) => value + 1);
          }} />
        ) : jobs.length === 0 ? (
          <Card
            style={{
              background: 'var(--bg-card, #14121E)',
              borderColor: 'var(--border-default, #2E274A)',
              borderRadius: 20,
              textAlign: 'center',
              padding: '60px 24px',
            }}
          >
            <Empty
              description={
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  Bạn chưa có mô hình 3D nào. Hãy bắt đầu bằng việc chụp hoặc tải lên tập ảnh!
                </span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/create-keepsake')}
                style={{
                  background: 'var(--primary, #7C5CFC)',
                  borderRadius: 8,
                  fontWeight: 700,
                  marginTop: 16,
                }}
              >
                Tạo mô hình đầu tiên
              </Button>
            </Empty>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {jobs.map((job) => (
              <Card
                key={job.jobId}
                hoverable
                style={{
                  background: 'var(--bg-card, #14121E)',
                  borderColor: 'var(--border-default, #2E274A)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                styles={{ body: { padding: 20, flex: 1, display: 'flex', flexDirection: 'column' } }}
              >
                {/* 3D Preview Thumbnail Placeholder */}
                <div
                  style={{
                    height: 180,
                    background: 'radial-gradient(circle at center, #1E1A30 0%, #0E0D14 100%)',
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 10px 15px rgba(124, 92, 252, 0.3))' }}>
                    🗿
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    {getStatusBadge(job.status)}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontWeight: 700 }}>
                    Kỷ vật 3D #{job.jobId.substring(0, 8).toUpperCase()}
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'block' }}>
                    Ngày tạo: {job.createdAt ? new Date(job.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                  </Text>
                  {job.message && (
                    <Text style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
                      {job.message}
                    </Text>
                  )}
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/reconstruction/${job.scanId || job.jobId}`)}
                    style={{
                      flex: 1,
                      background: 'var(--primary, #7C5CFC)',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Xem 3D & In MVP
                  </Button>

                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => navigate(`/reconstruction/${job.scanId || job.jobId}`)}
                    style={{
                      borderRadius: 8,
                      borderColor: '#443C68',
                      color: 'var(--text-primary)',
                      background: 'transparent',
                    }}
                  >
                    Đặt in
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyModelsPage;
