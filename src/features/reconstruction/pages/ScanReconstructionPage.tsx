import { ShoppingPageFrame } from '../../../components/layout/ShoppingPageFrame';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Typography, Space, Tag, Alert } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ReconstructionProgress } from '../components/ReconstructionProgress';
import { Keepsake3DViewer } from '../components/Keepsake3DViewer';
import { ModelCustomizationWorkspace } from '../components/ModelCustomizationWorkspace';
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
  const [outputError, setOutputError] = useState<string | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | undefined>(undefined);
  const [modelOutputId, setModelOutputId] = useState<string | null>(null);
  const navigateAway = (path: string) => navigate(path);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState('queued');
  const [jobStatus, setJobStatus] = useState('queued');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Request token counter to prevent race conditions & stale job polling
  const activeRequestIdRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outputRequestRef = useRef<{ jobId: string; requestId: number; promise: Promise<void> } | null>(null);
  const stopPolling = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  };

  const fetchJobOutputs = (jobId: string, currentReqId: number): Promise<void> => {
    const pending = outputRequestRef.current;
    if (pending?.jobId === jobId && pending.requestId === currentReqId) return pending.promise;
    const promise = loadJobOutputs(jobId, currentReqId).finally(() => {
      if (outputRequestRef.current?.promise === promise) outputRequestRef.current = null;
    });
    outputRequestRef.current = { jobId, requestId: currentReqId, promise };
    return promise;
  };
  const loadJobOutputs = async (jobId: string, currentReqId: number) => {
    setOutputError(null);
    try {
      const outputs = await scanReconstructionService.getJobOutputs(jobId);
      if (currentReqId !== activeRequestIdRef.current) return;

      const glb = outputs.find((o) => o.fileFormat.toLowerCase() === 'glb' && o.outputUrl);
      if (glb && glb.outputUrl) {
        setModelOutputId(glb.id);
        setModelPreviewUrl(glb.outputUrl);
        setIsDone(true);
        setIsFailed(false);
      } else {
        setIsDone(true);
        setOutputError('Tác vụ đã hoàn tất nhưng API chưa trả về output GLB để xem.');
      }
    } catch (error: unknown) {
      if (currentReqId !== activeRequestIdRef.current) return;
      setIsDone(true);
      setOutputError(error instanceof Error ? error.message : 'Không thể tải output của reconstruction.');
    }
  };

  const resolveAndPollJob = async (jobIdOverride?: string) => {
    stopPolling();
    const currentReqId = ++activeRequestIdRef.current;
    setIsFailed(false);
    setErrorMessage(null);
    setConnectionError(null);

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
    let resolvedJobId = jobIdOverride ?? activeJobId;

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
        } catch {
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
      setIsFailed(true);
      setErrorMessage('Phiên này chưa có tác vụ tạo mô hình. Bạn có thể quay lại trang tạo kỷ vật.');
      return;
    }

    // Step 2: Poll status of resolved job
    let isTerminal = false;
    let failures = 0;

    const checkStatus = async () => {
      if (currentReqId !== activeRequestIdRef.current) {
        return;
      }

      try {
        const job = await scanReconstructionService.getJobById(resolvedJobId!);
        if (currentReqId !== activeRequestIdRef.current) return;
        failures = 0;
        setConnectionError(null);

        setJobProgress(job.progressPercent ?? 0);
        setJobStage(job.stage || '');
        setJobStatus(job.status);

        const statusLower = (job.status || '').toLowerCase();

        if (statusLower === 'done' || statusLower === 'completed') {
          isTerminal = true;
          stopPolling();
          await fetchJobOutputs(resolvedJobId!, currentReqId);
        } else if (statusLower === 'failed' || statusLower === 'cancelled') {
          isTerminal = true;
          stopPolling();
          setIsDone(false);
          setIsFailed(true);
          setJobStatus(statusLower);
          setErrorMessage(
            job.message || job.errorCode || 'Quá trình reconstruction không thành công.'
          );
        }
      } catch {
        if (currentReqId !== activeRequestIdRef.current) return;
        failures++;
        if (failures >= 3) setConnectionError('Chưa kết nối được máy chủ để cập nhật tiến trình. Tác vụ vẫn có thể đang chạy; bạn không cần gửi lại ảnh.');
      }
      if (!isTerminal && currentReqId === activeRequestIdRef.current) pollTimerRef.current = setTimeout(checkStatus, 3500);
    };

    await checkStatus();

    return () => {
      stopPolling();
    };
  };

  useEffect(() => {
    const requestIdRef = activeRequestIdRef;

    // Reset state when scanId changes to prevent showing old model
    setActiveJobId(stateJobId || null);
    setModelPreviewUrl(undefined);
    setModelOutputId(null);
    setIsDone(false);
    setIsFailed(false);
    setErrorMessage(null);
    setOutputError(null);
    setJobProgress(0);
    setJobStage('queued');
    setJobStatus('queued');

    let cleanupFn: (() => void) | undefined;
    resolveAndPollJob(stateJobId).then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      requestIdRef.current++;
      stopPolling();
      if (cleanupFn) cleanupFn();
    };
  }, [scanId, stateJobId]);

  return (
    <ShoppingPageFrame publicStyle={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }} contentStyle={{ maxWidth: 1060, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Navigation Action Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigateAway('/create-keepsake')}
            style={{ color: 'var(--text-secondary)', paddingLeft: 0 }}
          >
            Tạo kỷ vật mới
          </Button>

          <Space>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => navigateAway('/my-models')}
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
              onClick={() => navigateAway('/orders')}
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
              MEMENTO3D HEAD RECONSTRUCTION
            </Tag>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Phiên scan: {scanId}
              {activeJobId ? ` | Tác vụ: #${activeJobId.slice(0, 8).toUpperCase()}` : ''}
            </Text>
          </div>
          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Tái Tạo Kỷ Vật 3D từ Ảnh Chụp
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Theo dõi trạng thái reconstruction và kiểm tra output sau khi tác vụ hoàn tất.
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
                <Button size="small" icon={<ReloadOutlined />} onClick={() => resolveAndPollJob()}>
                  Kiểm tra lại trạng thái
                </Button>
                <Button size="small" type="primary" onClick={() => navigate('/create-keepsake')}>
                  Thay ảnh khác
                </Button>
              </Space>
            }
            style={{ marginBottom: 28, borderRadius: 12 }}
          />
        )}

        {outputError && (
          <Alert
            type="warning"
            showIcon
            message="Chưa tải được mô hình"
            description={outputError}
            action={<Button onClick={() => activeJobId && void fetchJobOutputs(activeJobId, activeRequestIdRef.current)}>Tải lại mô hình</Button>}
            style={{ marginBottom: 28 }}
          />
        )}
        {connectionError && <Alert type="warning" showIcon title="Đang kết nối lại" description={connectionError}
          action={<Button onClick={() => void resolveAndPollJob()}>Kiểm tra kết nối</Button>} style={{ marginBottom: 24 }} />}

        {/* Live Reconstruction Progress Stepper */}
        {activeJobId && (
          <div style={{ marginBottom: 32 }}>
            <ReconstructionProgress
              jobId={activeJobId}
              scanId={scanId}
              initialStage={jobStage}
              initialProgress={jobProgress}
              initialStatus={isDone ? 'COMPLETED' : isFailed ? 'FAILED' : jobStatus}
              failureMessage={errorMessage}
              onCompleted={(url) => {
                stopPolling();
                setIsDone(true);
                if (url) setModelPreviewUrl(url);
                void fetchJobOutputs(activeJobId, activeRequestIdRef.current);
              }}
              onRetry={() => void resolveAndPollJob()}
            />
          </div>
        )}

        {/* Interactive 3D WebGL Viewer & MVP Print Simulation */}
        {modelOutputId ? <ModelCustomizationWorkspace key={modelOutputId} outputId={modelOutputId} /> : <Keepsake3DViewer
          modelUrl={modelPreviewUrl}
          modelName="Kỷ vật 3D Cá nhân hóa (Bản dựng AI)"
          isUnlocked={isDone}
          isProcessing={!isDone && !isFailed}
          statusMessage={
            isFailed
              ? 'Tác vụ dựng 3D gặp lỗi. Xem thông báo phía trên để biết cách tiếp tục.'
              : !isDone
              ? 'AI đang xử lý ảnh của bạn. Mô hình 3D thực tế sẽ xuất hiện ngay khi hoàn tất.'
              : undefined
          }
          onRetry={() => {
            if (activeJobId) fetchJobOutputs(activeJobId, activeRequestIdRef.current);
          }}
        />}

    </ShoppingPageFrame>
  );
};

export default ScanReconstructionPage;
