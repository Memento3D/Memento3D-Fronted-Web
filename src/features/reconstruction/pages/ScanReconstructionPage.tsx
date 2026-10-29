import { ShoppingPageFrame } from '../../../components/layout/ShoppingPageFrame';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Typography, Space, Tag, Alert } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ReconstructionProgress } from '../components/ReconstructionProgress';
import { Keepsake3DViewer } from '../components/Keepsake3DViewer';
import { OrderKeepsakeModal } from '../components/OrderKeepsakeModal';
import { scanReconstructionService } from '../../../services/scanReconstructionService';

const { Title, Text } = Typography;

export const ScanReconstructionPage: React.FC = () => {
  const { scanId = '' } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Job ID can be passed via router state from Create3DKeepsakePage
  const stateJobId = (location.state as any)?.jobId as string | undefined;

  const [activeJobId, setActiveJobId] = useState<string | null>(stateJobId || null);
  const [isDone, setIsDone] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | undefined>(undefined);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('queued');

  // Request token counter to prevent race conditions & stale job polling
  const activeRequestIdRef = useRef(0);

  const fetchJobOutputs = async (jobId: string, currentReqId: number) => {
    try {
      const outputs = await scanReconstructionService.getJobOutputs(jobId);
      if (currentReqId !== activeRequestIdRef.current) return;

      const glb = outputs.find((o) => o.fileFormat.toLowerCase() === 'glb' && o.outputUrl);
      if (glb && glb.outputUrl) {
        setModelPreviewUrl(glb.outputUrl);
        setIsDone(true);
        setIsFailed(false);
      }
    } catch (err: any) {
      console.warn('Could not fetch outputs for job:', jobId, err);
    }
  };

  const resolveAndPollJob = async () => {
    const currentReqId = ++activeRequestIdRef.current;
    setIsFailed(false);
    setErrorMessage(null);

    // Handle demo route explicitly
    if (scanId === 'scan-demo' || scanId === 'demo') {
      try {
        const demoOutputs = await scanReconstructionService.getDemoOutputs();
        if (currentReqId !== activeRequestIdRef.current) return;
        if (demoOutputs.length > 0 && demoOutputs[0].outputUrl) {
          setModelPreviewUrl(demoOutputs[0].outputUrl);
          setIsDone(true);
        }
      } catch {
        // demo route
      }
      return;
    }

    // Step 1: Resolve real Job ID
    let resolvedJobId = activeJobId;

    if (!resolvedJobId && scanId) {
      try {
        // Try getting latest job for scan session
        const latestJob = await scanReconstructionService.getLatestJobForScan(scanId);
        if (currentReqId !== activeRequestIdRef.current) return;
        if (latestJob && latestJob.jobId) {
          resolvedJobId = latestJob.jobId;
          setActiveJobId(resolvedJobId);
        }
      } catch {
        // If scanId is actually a direct jobId UUID
        try {
          const directJob = await scanReconstructionService.getJobById(scanId);
          if (currentReqId !== activeRequestIdRef.current) return;
          if (directJob && directJob.jobId) {
            resolvedJobId = directJob.jobId;
            setActiveJobId(resolvedJobId);
          }
        } catch (err: any) {
          if (currentReqId !== activeRequestIdRef.current) return;
          setIsFailed(true);
          setErrorMessage(
            'Không tìm thấy tác vụ tái tạo 3D tương ứng với phiên quét này. Vui lòng kiểm tra lại hoặc tạo phiên mới.'
          );
          return;
        }
      }
    }

    if (!resolvedJobId) {
      return;
    }

    // Step 2: Poll status of resolved job
    let pollInterval: any = null;

    const checkStatus = async () => {
      if (currentReqId !== activeRequestIdRef.current) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      try {
        const job = await scanReconstructionService.getJobById(resolvedJobId!);
        if (currentReqId !== activeRequestIdRef.current) return;

        setJobProgress(job.progressPercent ?? 0);
        setJobStage(job.stage || 'running');

        const statusLower = (job.status || '').toLowerCase();

        if (statusLower === 'done' || statusLower === 'completed' || (job.progressPercent ?? 0) >= 100) {
          if (pollInterval) clearInterval(pollInterval);
          await fetchJobOutputs(resolvedJobId!, currentReqId);
        } else if (statusLower === 'failed' || statusLower === 'cancelled') {
          if (pollInterval) clearInterval(pollInterval);
          setIsFailed(true);
          setErrorMessage(
            job.message || 'Quá trình tái tạo 3D không thành công. Ảnh đầu vào có thể bị mờ hoặc thiếu chi tiết.'
          );
        }
      } catch {
        // transient error, continue polling
      }
    };

    await checkStatus();
    pollInterval = setInterval(checkStatus, 3500);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  };

  useEffect(() => {
    // Reset state when scanId changes to prevent showing old model
    setModelPreviewUrl(undefined);
    setIsDone(false);
    setIsFailed(false);
    setErrorMessage(null);

    let cleanupFn: (() => void) | undefined;
    resolveAndPollJob().then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      activeRequestIdRef.current++;
      if (cleanupFn) cleanupFn();
    };
  }, [scanId]);

  return (
    <ShoppingPageFrame publicStyle={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }} contentStyle={{ maxWidth: 1060, margin: '0 auto', padding: '110px 24px 60px' }}>
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
              AI PIPELINE — FASTAPI & HUNYUAN3D
            </Tag>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mã phiên quét: {scanId}
              {activeJobId ? ` | Tác vụ: #${activeJobId.slice(0, 8).toUpperCase()}` : ''}
            </Text>
          </div>
          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Tái Tạo Kỷ Vật 3D từ Ảnh Chụp
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Hệ thống đang chạy cụm thị giác máy tính và khuếch tán hình học (DiT Mesh + Paint Texture) để dựng mô hình 3D chân thực từ ảnh của bạn.
          </Text>
        </div>

        {/* Error Alert with Retry */}
        {isFailed && (
          <Alert
            type="error"
            message="Quá trình tái tạo 3D gặp lỗi"
            description={errorMessage || 'Không thể tạo mô hình 3D. Vui lòng thử lại hoặc tải ảnh rõ nét hơn.'}
            showIcon
            action={
              <Space>
                <Button size="small" icon={<ReloadOutlined />} onClick={resolveAndPollJob}>
                  Thử lại
                </Button>
                <Button size="small" type="primary" onClick={() => navigate('/create-keepsake')}>
                  Thay ảnh khác
                </Button>
              </Space>
            }
            style={{ marginBottom: 28, borderRadius: 12 }}
          />
        )}

        {/* Live Reconstruction Progress Stepper */}
        {activeJobId && (
          <div style={{ marginBottom: 32 }}>
            <ReconstructionProgress
              jobId={activeJobId}
              scanId={scanId}
              initialStage={jobStage}
              initialProgress={jobProgress}
              initialStatus={isDone ? 'COMPLETED' : isFailed ? 'FAILED' : 'RUNNING'}
              onCompleted={(url) => {
                setIsDone(true);
                if (url) setModelPreviewUrl(url);
                else fetchJobOutputs(activeJobId, activeRequestIdRef.current);
              }}
              onRetry={resolveAndPollJob}
            />
          </div>
        )}

        {/* Interactive 3D WebGL Viewer & MVP Print Simulation */}
        <Keepsake3DViewer
          modelUrl={modelPreviewUrl}
          modelName="Kỷ vật 3D Cá nhân hóa (Bản dựng AI)"
          isUnlocked={isDone}
          isProcessing={!isDone && !isFailed}
          statusMessage={
            isFailed
              ? 'Tác vụ dựng 3D gặp lỗi. Bấm "Thử lại" hoặc thay ảnh mới.'
              : !isDone
              ? 'AI đang xử lý ảnh của bạn. Mô hình 3D thực tế sẽ xuất hiện ngay khi hoàn tất.'
              : undefined
          }
          onRetry={() => {
            if (activeJobId) fetchJobOutputs(activeJobId, activeRequestIdRef.current);
          }}
          onProceedToOrder={() => setOrderModalOpen(true)}
        />

      {/* Workshop Manufacturing Order Modal */}
      <OrderKeepsakeModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        scanId={scanId}
        modelUrl={modelPreviewUrl}
        modelName="Kỷ vật 3D Chân dung (Scan AI)"
      />

    </ShoppingPageFrame>
  );
};

export default ScanReconstructionPage;
