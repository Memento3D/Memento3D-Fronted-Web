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
        background: 'var(--surface-card, #FFFFFF)',
        borderColor: 'var(--border-default, #E2D9F7)',
        borderRadius: 'var(--radius-card-standard, 24px)',
        boxShadow: 'var(--shadow-card)',
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-primary, #28243D)', margin: 0 }}>
            Tiến trình Tái tạo AI 3D Thời gian thực
          </Title>
          <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
            Mã tác vụ GPU: #{jobId.slice(0, 8).toUpperCase()}
          </Text>
        </div>

        <Tag
          style={{
            borderRadius: 'var(--radius-full, 9999px)',
            fontWeight: 700,
            padding: '4px 12px',
            background: status === 'COMPLETED' ? 'var(--mint-accent, #C9E8D5)' : status === 'FAILED' ? 'var(--error-container, #FFDAD6)' : 'var(--surface-container, #F1EBFF)',
            color: status === 'COMPLETED' ? 'var(--tertiary, #466253)' : status === 'FAILED' ? 'var(--on-error-container, #93000A)' : 'var(--primary, #7C5CFC)',
            border: 'none',
          }}
        >
          {status === 'COMPLETED' ? 'HOÀN TẤT' : status === 'FAILED' ? 'THẤT BẠI' : 'ĐANG XỬ LÝ GPU'}
        </Tag>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Progress
          percent={progress}
          status={status === 'FAILED' ? 'exception' : status === 'COMPLETED' ? 'success' : 'active'}
          strokeColor={{
            '0%': '#7C5CFC',
            '100%': '#FFBFAE',
          }}
          strokeWidth={10}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
          <span>Công đoạn: {STAGES[currentStep]?.title || stage}</span>
          <span>{progress}% hoàn thành</span>
        </div>
      </div>

      <Steps
        current={currentStep}
        size="small"
        items={STAGES.map((s, idx) => ({
          title: <span style={{ color: idx <= currentStep ? 'var(--text-primary, #28243D)' : 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', fontWeight: idx <= currentStep ? 600 : 400 }}>{s.title}</span>,
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
              <Button size="small" danger icon={<ReloadOutlined />} onClick={onRetry} style={{ borderRadius: 'var(--radius-full, 9999px)' }}>
                Thử lại
              </Button>
            )
          }
          style={{ marginTop: 16, borderRadius: 'var(--radius-default, 16px)' }}
        />
      )}

      {status === 'COMPLETED' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Alert
            message="Mô hình 3D đã được tái tạo thành công!"
            description="Bạn có thể xoay, phóng to thu nhỏ và kiểm tra bản xem trước 3D có watermark ngay bên dưới."
            type="success"
            showIcon
            style={{ marginBottom: 16, borderRadius: 'var(--radius-default, 16px)', background: 'var(--mint-accent, #C9E8D5)', borderColor: '#A2D4B3', color: 'var(--tertiary, #466253)' }}
          />
        </div>
      )}
    </Card>
  );
};
