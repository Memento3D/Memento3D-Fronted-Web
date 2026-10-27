import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button, Alert, Space, Typography, Tooltip } from 'antd';
import {
  CameraOutlined,
  ReloadOutlined,
  CheckOutlined,
  SwapOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onPhotoCaptured: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  open,
  onClose,
  onPhotoCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);

  // Stop camera tracks and release resources
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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

  // Start camera when modal opens
  useEffect(() => {
    let isCancelled = false;

    const startCamera = async () => {
      setCameraError(null);
      clearCaptured();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Trình duyệt của bạn không hỗ trợ camera web (getUserMedia API). Vui lòng tải ảnh từ thiết bị.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
          },
          audio: false, // Strictly no microphone requested
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err: any) {
        if (isCancelled) return;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt hoặc chọn tải ảnh.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('Không tìm thấy thiết bị camera trên máy tính của bạn.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('Camera đang được sử dụng bởi một ứng dụng khác (Zoom, Teams, v.v.). Vui lòng đóng ứng dụng đó và thử lại.');
        } else {
          setCameraError(err.message || 'Không thể khởi động camera. Vui lòng thử lại hoặc tải ảnh từ máy tính.');
        }
      }
    };

    if (open) {
      startCamera();
    } else {
      stopCamera();
      clearCaptured();
    }

    return () => {
      isCancelled = true;
      stopCamera();
      clearCaptured();
    };
  }, [open, stopCamera, clearCaptured]);

  // Capture current video frame to canvas
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

    // Preserve non-mirrored physical perspective for accurate photogrammetry AI
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

  // Confirm and use captured photo
  const handleUsePhoto = () => {
    if (!capturedBlob) return;
    const fileName = `camera_capture_${Date.now()}.jpg`;
    const file = new File([capturedBlob], fileName, { type: 'image/jpeg' });
    onPhotoCaptured(file);
    handleCloseModal();
  };

  // Retake photo: restart video stream
  const handleRetake = () => {
    clearCaptured();
    // Restart camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setIsCameraActive(true);
        })
        .catch((err) => {
          setCameraError(err.message);
        });
    }
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
      width={720}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CameraOutlined style={{ color: 'var(--primary, #7C5CFC)', fontSize: 20 }} />
          <span>Chụp ảnh kỷ vật bằng Camera</span>
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
            message="Không thể sử dụng Camera"
            description={cameraError}
            showIcon
            style={{ marginBottom: 20, textAlign: 'left' }}
          />
          <Button type="primary" onClick={handleCloseModal} style={{ borderRadius: 8 }}>
            Đóng & Sử dụng tùy chọn tải ảnh
          </Button>
        </div>
      ) : (
        <div>
          {/* Viewport Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 420,
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
                inset: 32,
                border: '1.5px dashed rgba(255, 255, 255, 0.45)',
                borderRadius: 12,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
                  GÓC CHỤP RÕ NÉT
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {capturedPreviewUrl ? 'XEM LẠI ẢNH' : 'LIVE 360°'}
                </Text>
              </div>
            </div>

            {/* Mirror Toggle Button */}
            {!capturedPreviewUrl && (
              <Tooltip title={isMirrored ? 'Đang bật lật gương xem trước' : 'Đang tắt lật gương'}>
                <Button
                  shape="circle"
                  icon={<SwapOutlined />}
                  onClick={() => setIsMirrored(!isMirrored)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(0, 0, 0, 0.55)',
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
              padding: '20px 8px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
              💡 Giữ camera cố định, chiếu sáng đều khuôn mặt hoặc vật thể cần tạo kỷ vật.
            </Text>

            <Space size="middle">
              {capturedPreviewUrl ? (
                <>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRetake}
                    style={{ borderRadius: 8 }}
                  >
                    Chụp lại
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleUsePhoto}
                    style={{
                      background: 'var(--primary, #7C5CFC)',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Sử dụng ảnh này
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
                      padding: '0 28px',
                    }}
                  >
                    Chụp ảnh
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
