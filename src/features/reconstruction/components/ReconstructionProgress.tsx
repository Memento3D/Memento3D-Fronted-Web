import React, { useState } from 'react';
import { Card, Steps, Progress, Typography, Button, Alert, Tag } from 'antd';
import {
  CloudUploadOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useEventSubscription } from '../../../shared/realtime';
import type { ReconstructionProgressData, RealTimeEvent } from '../../../shared/realtime';

const { Title, Text } = Typography;

export interface ReconstructionProgressProps {
  jobId: string;
  scanId?: string;
  initialStage?: string;
  initialProgress?: number;
  initialStatus?: string;
  onCompleted?: (previewUrl?: string) => void;
  onRetry?: () => void;
}

const STAGES = [
  { key: 'uploading', title: 'Tải lên ảnh/video', icon: <CloudUploadOutlined /> },
  { key: 'preprocessing', title: 'Tiền xử lý ảnh', icon: <LoadingOutlined /> },
  { key: 'gaussian_splatting', title: 'Tái tạo AI 3D (NeRF/GS)', icon: <ThunderboltOutlined /> },
  { key: 'mesh_generation', title: 'Dựng lưới đa giác (Mesh)', icon: <ThunderboltOutlined /> },
  { key: 'texturing', title: 'Tạo chất liệu màu (Texture)', icon: <ThunderboltOutlined /> },
  { key: 'done', title: 'Hoàn tất', icon: <CheckCircleFilled /> },
];

export const ReconstructionProgress: React.FC<ReconstructionProgressProps> = ({
  jobId,
  scanId,
  initialStage = 'gaussian_splatting',
  initialProgress = 0,
  initialStatus = 'RUNNING',
  onCompleted,
  onRetry,
}) => {
  const [stage, setStage] = useState<string>(initialStage);
  const [progress, setProgress] = useState<number>(initialProgress);
  const [status, setStatus] = useState<string>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to live reconstruction progress events
  useEventSubscription<ReconstructionProgressData>('RECONSTRUCTION_PROGRESS', (event: RealTimeEvent<ReconstructionProgressData>) => {
    if (event.resourceId === jobId || event.data?.jobId === jobId || (scanId && event.data?.scanId === scanId)) {
      if (typeof event.data.progress === 'number') {
        setProgress(event.data.progress);
      }
      if (event.data.stage) {
        setStage(event.data.stage);
      }
    }
  });

  // Subscribe to live status transitions
  useEventSubscription<ReconstructionProgressData>('RECONSTRUCTION_UPDATED', (event: RealTimeEvent<ReconstructionProgressData>) => {
    if (event.resourceId === jobId || event.data?.jobId === jobId || (scanId && event.data?.scanId === scanId)) {
      const newStatus = event.data?.status || 'RUNNING';
      setStatus(newStatus);
      if (typeof event.data?.progress === 'number') {
        setProgress(event.data.progress);
      }

      if (newStatus === 'done' || newStatus === 'COMPLETED' || event.type === 'PREVIEW_READY') {
        setStatus('COMPLETED');
        setProgress(100);
        if (onCompleted) {
          onCompleted(event.data?.previewUrl);
        }
      } else if (newStatus === 'failed' || newStatus === 'FAILED') {
        setErrorMessage('Quá trình tái tạo không thành công do không đủ góc chụp hoặc độ phân giải ảnh thấp.');
      }
    }
  });

  const getStageIndex = (st: string) => {
    const idx = STAGES.findIndex((s) => s.key === st.toLowerCase());
    return idx >= 0 ? idx : 2;
  };

  const currentStep = status === 'COMPLETED' ? STAGES.length - 1 : getStageIndex(stage);

  return (
    <Card
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        backdropFilter: 'blur(16px)',
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Tiến trình Tái tạo AI 3D Thời gian thực
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Mã tác vụ GPU: #{jobId.slice(0, 8).toUpperCase()}
          </Text>
        </div>

        <Tag color={status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'error' : 'processing'}>
          {status === 'COMPLETED' ? 'HOÀN TẤT' : status === 'FAILED' ? 'THẤT BẠI' : 'ĐANG XỬ LÝ GPU'}
        </Tag>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Progress
          percent={progress}
          status={status === 'FAILED' ? 'exception' : status === 'COMPLETED' ? 'success' : 'active'}
          strokeColor={{
            '0%': '#0ea5e9',
            '100%': '#22c55e',
          }}
          strokeWidth={10}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: '#94a3b8', fontSize: '0.8rem' }}>
          <span>Công đoạn: {STAGES[currentStep]?.title || stage}</span>
          <span>{progress}% hoàn thành</span>
        </div>
      </div>

      <Steps
        current={currentStep}
        size="small"
        items={STAGES.map((s, idx) => ({
          title: <span style={{ color: idx <= currentStep ? '#f8fafc' : '#64748b', fontSize: '0.8rem' }}>{s.title}</span>,
          status: status === 'FAILED' && idx === currentStep ? 'error' : undefined,
        }))}
        style={{ marginBottom: 20 }}
      />

      {status === 'FAILED' && (
        <Alert
          message="Lỗi trong quá trình tái tạo 3D"
          description={errorMessage || 'Tác vụ gặp sự cố khi xử lý dữ liệu ảnh point cloud.'}
          type="error"
          showIcon
          action={
            onRetry && (
              <Button size="small" danger icon={<ReloadOutlined />} onClick={onRetry}>
                Thử lại
              </Button>
            )
          }
          style={{ marginTop: 16 }}
        />
      )}

      {status === 'COMPLETED' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Alert
            message="Mô hình 3D đã được tái tạo thành công!"
            description="Bạn có thể xoay, phóng to thu nhỏ và kiểm tra bản xem trước 3D có watermark ngay bên dưới."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </div>
      )}
    </Card>
  );
};
