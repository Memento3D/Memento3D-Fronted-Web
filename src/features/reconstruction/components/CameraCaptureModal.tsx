import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button, Alert, Space, Typography, Tooltip, message } from 'antd';
import {
  CameraOutlined,
  ReloadOutlined,
  CheckOutlined,
  SwapOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onPhotoCaptured: (file: File) => void;
  onSelectUploadFiles?: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  open,
  onClose,
  onPhotoCaptured,
  onSelectUploadFiles,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [sessionCapturedCount, setSessionCapturedCount] = useState(0);

  // Stop camera tracks and release hardware resources cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup object URL
  const clearCaptured = useCallback(() => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
      setCapturedPreviewUrl(null);
    }
    setCapturedBlob(null);
  }, [capturedPreviewUrl]);

  // Request camera and stream video (video-only, strictly NO audio/microphone)
  const initCameraStream = useCallback(async () => {
    setCameraError(null);
    clearCaptured();

    // 1. Check Secure Context (HTTPS or localhost)
    if (
      typeof window !== 'undefined' &&
      window.isSecureContext === false &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError(
        'Camera yêu cầu kết nối bảo mật (HTTPS hoặc localhost). Do bạn đang mở qua HTTP thông thường, trình duyệt chặn quyền truy cập webcam. Vui lòng mở lại trang web qua HTTPS hoặc tải ảnh từ máy tính.'
      );
      return;
    }

    // 2. Check Permissions Policy (iframe support)
    if (
      typeof document !== 'undefined' &&
      (document as any).permissionsPolicy &&
      typeof (document as any).permissionsPolicy.allowsFeature === 'function'
    ) {
      const allowed = (document as any).permissionsPolicy.allowsFeature('camera');
      if (allowed === false) {
        setCameraError(
          'Trình duyệt đang chặn camera theo Permissions Policy (ví dụ: iframe chưa có thuộc tính allow="camera"). Vui lòng chọn tải ảnh từ thiết bị.'
        );
        return;
      }
    }

    // 3. Check getUserMedia API existence
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Trình duyệt của bạn không hỗ trợ camera web (thiếu navigator.mediaDevices.getUserMedia). Vui lòng cập nhật trình duyệt hoặc tải ảnh từ thiết bị.'
      );
      return;
    }

    try {
      // Strictly audio: false to prevent microphone permission prompts
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Bạn đã từ chối quyền truy cập camera. Vui lòng bấm vào biểu tượng ổ khóa/camera trên thanh địa chỉ trình duyệt để Cấp quyền (Allow), sau đó bấm thử lại hoặc chọn tải ảnh từ máy tính.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Không tìm thấy thiết bị camera trên máy tính của bạn. Vui lòng kiểm tra cáp cắm webcam hoặc chọn tải ảnh.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError(
          'Camera đang bận hoặc đang được sử dụng bởi ứng dụng khác (Zoom, Microsoft Teams, Skype, Google Meet, v.v.). Vui lòng đóng ứng dụng đó và thử lại.'
        );
      } else if (err.name === 'SecurityError') {
        setCameraError('Bảo mật trình duyệt đã chặn truy cập camera do chính sách nguồn (Security Policy). Vui lòng tải ảnh từ thiết bị.');
      } else {
        setCameraError(err.message || 'Không thể khởi động camera. Vui lòng thử lại hoặc tải ảnh từ máy tính.');
      }
    }
  }, [clearCaptured]);

  // Start camera when modal opens
  useEffect(() => {
    if (open) {
      setSessionCapturedCount(0);
      initCameraStream();
    } else {
      stopCamera();
      clearCaptured();
    }

    return () => {
      stopCamera();
      clearCaptured();
    };
  }, [open, initCameraStream, stopCamera, clearCaptured]);

  // Capture current video frame to high-resolution canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame without mirroring so photogrammetry AI receives physically natural geometry
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setCapturedPreviewUrl(previewUrl);
        stopCamera();
      },
      'image/jpeg',
      0.95
    );
  };

  // Convert captured blob to real File and trigger callback
  const createCapturedFile = (blob: Blob): File => {
    const timestamp = Date.now();
    const fileName = `webcam_memento3d_${timestamp}.jpg`;
    return new File([blob], fileName, { type: 'image/jpeg', lastModified: timestamp });
  };

  // Keep and finish
  const handleUseAndFinish = () => {
    if (!capturedBlob) return;
    const file = createCapturedFile(capturedBlob);
    onPhotoCaptured(file);
    message.success('Đã thêm ảnh chụp vào danh sách kỷ vật.');
    handleCloseModal();
  };

  // Keep and take another photo immediately
  const handleKeepAndTakeMore = () => {
    if (!capturedBlob) return;
    const file = createCapturedFile(capturedBlob);
    onPhotoCaptured(file);
    setSessionCapturedCount((prev) => prev + 1);
    message.success('Đã lưu ảnh! Bạn có thể tiếp tục chụp góc tiếp theo.');
    handleRetake();
  };

  // Delete captured frame and restart camera
  const handleDeleteCaptured = () => {
    clearCaptured();
    initCameraStream();
  };

  // Retake photo: restart video stream
  const handleRetake = () => {
    clearCaptured();
    initCameraStream();
  };

  const handleCloseModal = () => {
    stopCamera();
    clearCaptured();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCloseModal}
      footer={null}
      width={740}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CameraOutlined style={{ color: 'var(--primary, #7C5CFC)', fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Chụp Ảnh Kỷ Vật bằng Camera</span>
          </div>
          {sessionCapturedCount > 0 && (
            <Text style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              ✓ Đã chụp {sessionCapturedCount} ảnh trong phiên này
            </Text>
          )}
        </div>
      }
      destroyOnClose
      centered
      styles={{
        body: { padding: '16px 0 0' },
      }}
    >
      {cameraError ? (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Alert
            type="error"
            message="Không thể khởi động Camera"
            description={cameraError}
            showIcon
            style={{ marginBottom: 24, textAlign: 'left', borderRadius: 12 }}
          />
          <Space size="middle">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => initCameraStream()}
              style={{ borderRadius: 8 }}
            >
              Thử lại Camera
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => {
                handleCloseModal();
                if (onSelectUploadFiles) onSelectUploadFiles();
              }}
              style={{ borderRadius: 8, background: 'var(--primary, #7C5CFC)' }}
            >
              Chọn tải ảnh từ máy tính
            </Button>
          </Space>
        </div>
      ) : (
        <div>
          {/* Viewport Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 440,
              background: '#0B0A10',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {capturedPreviewUrl ? (
              // Review Captured Frame
              <img
                src={capturedPreviewUrl}
                alt="Captured Snapshot"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              // Live Video Stream
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: isMirrored ? 'scaleX(-1)' : 'none',
                }}
              />
            )}

            {/* Viewfinder crosshairs overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 28,
                border: '1.5px dashed rgba(255, 255, 255, 0.45)',
                borderRadius: 16,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5 }}>
                  {capturedPreviewUrl ? 'XEM LẠI ẢNH ĐÃ CHỤP' : 'CANH CHÍNH GIỮA KHUNG HÌNH'}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: 700 }}>
                  {capturedPreviewUrl ? 'ĐÃ ĐÓNG BĂNG HÌNH' : 'WEBCAM TRỰC TIẾP'}
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.72rem' }}>
                  {capturedPreviewUrl ? 'Kiểm tra độ rõ nét trước khi sử dụng' : 'Giữ cố định camera và chiếu sáng đều khuôn mặt/chủ thể'}
                </Text>
              </div>
            </div>

            {/* Mirror Toggle Button */}
            {!capturedPreviewUrl && (
              <Tooltip title={isMirrored ? 'Tắt lật gương xem trước' : 'Bật lật gương xem trước'}>
                <Button
                  shape="circle"
                  icon={<SwapOutlined />}
                  onClick={() => setIsMirrored(!isMirrored)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#fff',
                    borderColor: 'transparent',
                  }}
                />
              </Tooltip>
            )}
          </div>

          {/* Action Bar */}
          <div
            style={{
              padding: '18px 8px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
              {capturedPreviewUrl
                ? 'Bạn có thể giữ ảnh này, chụp lại hoặc chụp thêm góc ảnh khác.'
                : '💡 Không yêu cầu microphone. Ảnh chụp sẽ được mã hóa và gửi tới pipeline AI 3D.'}
            </Text>

            <Space size="middle" wrap>
              {capturedPreviewUrl ? (
                <>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteCaptured}
                    style={{ borderRadius: 8 }}
                  >
                    Xóa ảnh
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRetake}
                    style={{ borderRadius: 8 }}
                  >
                    Chụp lại
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleKeepAndTakeMore}
                    style={{ borderRadius: 8, borderColor: 'var(--primary, #7C5CFC)', color: 'var(--primary, #7C5CFC)' }}
                  >
                    Lưu & Chụp thêm
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleUseAndFinish}
                    style={{
                      background: 'var(--primary, #7C5CFC)',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Lưu & Sử dụng
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleCloseModal} style={{ borderRadius: 8 }}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CameraOutlined />}
                    onClick={handleCaptureFrame}
                    disabled={!isCameraActive}
                    style={{
                      background: 'var(--primary, #7C5CFC)',
                      borderRadius: 9999,
                      fontWeight: 700,
                      padding: '0 32px',
                    }}
                  >
                    Chụp ảnh ngay
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CameraCaptureModal;
