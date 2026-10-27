import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Space, Tag } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { ReconstructionProgress } from '../components/ReconstructionProgress';
import { Keepsake3DViewer } from '../components/Keepsake3DViewer';
import { OrderKeepsakeModal } from '../components/OrderKeepsakeModal';
import { scanReconstructionService } from '../../../services/scanReconstructionService';

const { Title, Text } = Typography;

export const ScanReconstructionPage: React.FC = () => {
  const { scanId = 'scan-demo' } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  const [isDone, setIsDone] = useState(false);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | undefined>(undefined);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Polling fallback to check if job finished or outputs are ready
  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    const checkJobStatus = async () => {
      try {
        const job = await scanReconstructionService.getJobById(scanId);
        if (isMounted) {
          if (job.status === 'done' || (job.progressPercent ?? 0) >= 100) {
            setIsDone(true);
            if (job.modelUrl) {
              setModelPreviewUrl(job.modelUrl);
            }
            // Also check outputs
            const outputs = await scanReconstructionService.getJobOutputs(scanId);
            if (outputs && outputs.length > 0 && outputs[0].outputUrl) {
              setModelPreviewUrl(outputs[0].outputUrl);
            }
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch {
        // Continue polling or wait for realtime websocket event
      }
    };

    checkJobStatus();
    pollInterval = setInterval(checkJobStatus, 4000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [scanId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Navigation Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/create-keepsake')}
            style={{ color: 'var(--text-secondary)', paddingLeft: 0 }}
          >
            Tạo kỷ vật mới
          </Button>

          <Space>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => navigate('/my-models')}
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 8,
              }}
            >
              Mô hình của tôi
            </Button>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => navigate('/orders')}
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 8,
              }}
            >
              Lịch sử đơn hàng
            </Button>
          </Space>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700 }}>
              AI PIPELINE
            </Tag>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mã phiên quét: {scanId}
            </Text>
          </div>
          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Tái Tạo Kỷ Vật 3D từ Ảnh Chụp
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Hệ thống đang chạy cụm thị giác máy tính SfM + MVS và Gaussian Splatting để dựng lưới và phủ chất liệu 3D.
          </Text>
        </div>

        {/* Live Reconstruction Progress Stepper */}
        <div style={{ marginBottom: 32 }}>
          <ReconstructionProgress
            jobId={scanId}
            scanId={scanId}
            onCompleted={(url) => {
              setIsDone(true);
              if (url) setModelPreviewUrl(url);
            }}
          />
        </div>

        {/* Interactive 3D WebGL Viewer & MVP Print Simulation */}
        <Keepsake3DViewer
          modelUrl={modelPreviewUrl}
          modelName="Kỷ vật 3D Chân dung (Bản dựng AI)"
          isUnlocked={isDone}
          onProceedToOrder={() => setOrderModalOpen(true)}
        />
      </main>

      {/* Workshop Manufacturing Order Modal */}
      <OrderKeepsakeModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        scanId={scanId}
        modelUrl={modelPreviewUrl}
        modelName="Kỷ vật 3D Chân dung (Scan AI)"
      />

      <Footer />
    </div>
  );
};

export default ScanReconstructionPage;
