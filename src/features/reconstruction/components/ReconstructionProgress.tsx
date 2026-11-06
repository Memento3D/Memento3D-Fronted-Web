import React, { useState } from 'react';
import { Card, Steps, Progress, Typography, Button, Alert, Tag, Grid } from 'antd';
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
  failureMessage?: string | null;
  onCompleted?: (previewUrl?: string) => void;
  onRetry?: () => void;
}

const STAGES = [
  { key: 'downloading', title: 'Tải ảnh đầu vào', icon: <CloudUploadOutlined /> },
  { key: 'preprocessing', title: 'Tiền xử lý ảnh', icon: <LoadingOutlined /> },
  { key: 'shape_generation', title: 'Tạo hình khối', icon: <ThunderboltOutlined /> },
  { key: 'texturing', title: 'Tạo texture', icon: <ThunderboltOutlined /> },
  { key: 'validating', title: 'Kiểm tra output', icon: <ThunderboltOutlined /> },
  { key: 'exporting', title: 'Xuất mô hình', icon: <ThunderboltOutlined /> },
  { key: 'uploading', title: 'Lưu output', icon: <CloudUploadOutlined /> },
  { key: 'done', title: 'Hoàn tất', icon: <CheckCircleFilled /> },
];

export const ReconstructionProgress: React.FC<ReconstructionProgressProps> = ({
  jobId,
  initialStage = 'queued',
  initialProgress = 0,
  initialStatus = 'RUNNING',
  failureMessage,
  onCompleted,
  onRetry,
}) => {
  const screens = Grid.useBreakpoint();
  const compact = !screens.md;
  const [liveUpdate, setLiveUpdate] = useState<{
    jobId: string;
    stage?: string;
    progress?: number;
    status?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentLiveUpdate = liveUpdate?.jobId === jobId ? liveUpdate : null;
  // Polling may observe a terminal state after an older SSE update. Never let
  // that cached running event mask the completed/failed result from the parent.
  const parentTerminal = ['done', 'completed', 'failed', 'cancelled'].includes(initialStatus.toLowerCase());
  const status = parentTerminal ? initialStatus : currentLiveUpdate?.status ?? initialStatus;
  const stage = parentTerminal ? initialStage : currentLiveUpdate?.stage ?? initialStage;
  const progress = ['done', 'completed'].includes(status.toLowerCase()) ? 100
    : parentTerminal ? initialProgress : currentLiveUpdate?.progress ?? initialProgress;

  // Subscribe to live reconstruction progress events
  useEventSubscription<ReconstructionProgressData>('RECONSTRUCTION_PROGRESS', (event: RealTimeEvent<ReconstructionProgressData>) => {
    if (event.resourceId === jobId || event.data?.jobId === jobId) {
      setLiveUpdate((current) => ({
        jobId,
        stage: event.data.stage ?? (current?.jobId === jobId ? current.stage : undefined),
        progress: typeof event.data.progress === 'number'
          ? event.data.progress
          : current?.jobId === jobId ? current.progress : undefined,
        status: current?.jobId === jobId ? current.status : undefined,
      }));
    }
  });

  // Subscribe to live status transitions
  useEventSubscription<ReconstructionProgressData>('RECONSTRUCTION_UPDATED', (event: RealTimeEvent<ReconstructionProgressData>) => {
    if (event.resourceId === jobId || event.data?.jobId === jobId) {
      const newStatus = event.data?.status || 'running';
      const normalizedStatus = newStatus.toLowerCase();
      const nextStatus = normalizedStatus === 'done' || normalizedStatus === 'completed' ? 'COMPLETED'
        : normalizedStatus === 'failed' || normalizedStatus === 'cancelled' ? 'FAILED'
          : normalizedStatus.toUpperCase();
      setLiveUpdate((current) => ({
        jobId,
        stage: current?.jobId === jobId ? current.stage : undefined,
        progress: typeof event.data?.progress === 'number'
          ? event.data.progress
          : current?.jobId === jobId ? current.progress : undefined,
        status: nextStatus,
      }));

      if (normalizedStatus === 'done' || normalizedStatus === 'completed' || event.type === 'PREVIEW_READY') {
        setLiveUpdate((current) => ({
          jobId,
          stage: current?.jobId === jobId ? current.stage : undefined,
          progress: 100,
          status: 'COMPLETED',
        }));
        if (onCompleted) {
          onCompleted(event.data?.previewUrl);
        }
      } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
        setErrorMessage('Tác vụ xử lý 3D gặp sự cố. Vui lòng xem thông báo lỗi của tác vụ.');
      }
    }
  });

  const getStageIndex = (st: string) => {
    const idx = STAGES.findIndex((s) => s.key === st.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const normalizedStatus = status.toLowerCase();
  const isComplete = normalizedStatus === 'completed' || normalizedStatus === 'done';
  const isFailed = normalizedStatus === 'failed' || normalizedStatus === 'cancelled';
  const currentStep = isComplete
    ? STAGES.length - 1
    : stage
      ? getStageIndex(stage)
      : normalizedStatus === 'queued'
        ? 0
        : 1;

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
            Mã tác vụ: #{jobId.slice(0, 8).toUpperCase()}
          </Text>
        </div>

        <Tag
          style={{
            borderRadius: 'var(--radius-full, 9999px)',
            fontWeight: 700,
            padding: '4px 12px',
            background:             isComplete ? 'var(--mint-accent, #C9E8D5)' : isFailed ? 'var(--error-container, #FFDAD6)' : 'var(--surface-container, #F1EBFF)',
            color: isComplete ? 'var(--tertiary, #466253)' : isFailed ? 'var(--on-error-container, #93000A)' : 'var(--primary, #7C5CFC)',
            border: 'none',
          }}
        >
          {isComplete ? 'HOÀN TẤT' : isFailed ? 'THẤT BẠI' : normalizedStatus === 'queued' ? 'ĐANG CHỜ' : 'ĐANG XỬ LÝ'}
        </Tag>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Progress
          percent={progress}
          status={isFailed ? 'exception' : isComplete ? 'success' : 'active'}
          strokeColor={{
            '0%': '#7C5CFC',
            '100%': '#FFBFAE',
          }}
          strokeWidth={10}
          showInfo={progress > 0 || isComplete || isFailed}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
          <span>{isFailed ? 'Đã dừng xử lý' : `Công đoạn: ${STAGES[currentStep]?.title || stage}`}</span>
          <span>{isFailed ? 'Xem thông báo lỗi bên dưới' : progress > 0 || isComplete ? `${progress}% hoàn thành` : normalizedStatus === 'queued' ? 'Đang chờ đến lượt' : 'Đang thực hiện'}</span>
        </div>
      </div>

      <details open={!compact || !isComplete} style={{ marginBottom: 16 }}>
      <summary style={{ display: compact ? 'list-item' : 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: 12 }}>
        {isComplete ? 'Xem các bước đã hoàn tất' : 'Chi tiết tiến trình'}
      </summary>
      <Steps
        current={currentStep}
        size="small"
        items={STAGES.map((s, idx) => ({
          title: <span style={{ color: idx <= currentStep ? 'var(--text-primary, #28243D)' : 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', fontWeight: idx <= currentStep ? 600 : 400 }}>{s.title}</span>,
          status: isFailed && idx === currentStep ? 'error' : undefined,
        }))}
        style={{ marginBottom: 20 }}
      />
      </details>

      {isFailed && !failureMessage && (
        <Alert
          title="Lỗi trong quá trình tái tạo 3D"
          description={failureMessage || errorMessage || 'Tác vụ xử lý 3D gặp sự cố.'}
          type="error"
          showIcon
          action={
            onRetry && (
              <Button size="small" danger icon={<ReloadOutlined />} onClick={onRetry} style={{ borderRadius: 'var(--radius-full, 9999px)' }}>
                Kiểm tra lại trạng thái
              </Button>
            )
          }
          style={{ marginTop: 16, borderRadius: 'var(--radius-default, 16px)' }}
        />
      )}

      {isComplete && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Alert
            title="Mô hình 3D đã được tái tạo thành công!"
            description="Bạn có thể xoay và kiểm tra mô hình 3D bên dưới."
            type="success"
            showIcon
            style={{ marginBottom: 16, borderRadius: 'var(--radius-default, 16px)', background: 'var(--mint-accent, #C9E8D5)', borderColor: '#A2D4B3', color: 'var(--tertiary, #466253)' }}
          />
        </div>
      )}
    </Card>
  );
};
