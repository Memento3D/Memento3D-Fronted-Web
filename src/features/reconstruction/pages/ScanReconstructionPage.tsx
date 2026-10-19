import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { ReconstructionProgress } from '../components/ReconstructionProgress';
import { FreemiumModelViewer } from '../components/FreemiumModelViewer';

const { Title, Text } = Typography;

export const ScanReconstructionPage: React.FC = () => {
  const { scanId = 'scan-demo' } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  const [isDone, setIsDone] = useState(false);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | undefined>(undefined);

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '110px 24px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            style={{ color: '#94a3b8', paddingLeft: 0 }}
          >
            Quay lại
          </Button>

          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate('/customer/orders')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              borderRadius: 8,
            }}
          >
            Lịch sử đơn hàng
          </Button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
            Tái tạo Kỷ vật 3D từ Ảnh chụp
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Hệ thống đang chạy mô hình thị giác máy tính NeRF và Gaussian Splatting trên cụm GPU đám mây.
          </Text>
        </div>

        {/* Live Reconstruction Progress */}
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

        {/* Freemium 3D Viewer & Physical Keepsake Upgrade */}
        <FreemiumModelViewer
          scanId={scanId}
          previewUrl={modelPreviewUrl}
          isUnlocked={isDone}
        />
      </main>

      <Footer />
    </div>
  );
};
