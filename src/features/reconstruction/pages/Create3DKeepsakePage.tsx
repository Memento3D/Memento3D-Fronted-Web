import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Upload,
  Checkbox,
  Space,
  Tag,
  Typography,
  Progress,
  App,
  Popconfirm,
} from 'antd';
import {
  UploadOutlined,
  CameraOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { scanReconstructionService } from '../../../services/scanReconstructionService';
import type { ReconstructionCapabilities } from '../../../services/scanReconstructionService';

const { Title, Text, Paragraph } = Typography;

interface LocalImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

export const Create3DKeepsakePage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [capabilities, setCapabilities] = useState<ReconstructionCapabilities | null>(null);

  const [images, setImages] = useState<LocalImageItem[]>([]);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch AI Reconstruction capabilities
  useEffect(() => {
    let isMounted = true;
    scanReconstructionService
      .getCapabilities()
      .then((data) => {
        if (isMounted) setCapabilities(data);
      })
      .catch(() => {
        // Fallback default
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const minImages = capabilities?.minImages ?? 1;
  const maxImages = capabilities?.maxImages ?? 50;

  // Add captured or picked file to image list
  const addFile = (file: File) => {
    if (images.length >= maxImages) {
      message.warning(`Đã đạt giới hạn tối đa ${maxImages} ảnh cho một phiên tái tạo.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const isFirst = images.length === 0;

    setImages((prev) => [
      ...prev,
      {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        isPrimary: isFirst,
      },
    ]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const remaining = prev.filter((i) => i.id !== id);
      if (target?.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleSetPrimary = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  // Submit flow: Create Scan Session -> Upload Images -> Submit Reconstruction Job
  const handleSubmitJob = async () => {
    if (images.length < minImages) {
      message.error(`Vui lòng thêm tối thiểu ${minImages} ảnh để AI có thể phân tích và tái tạo mô hình 3D.`);
      return;
    }

    if (!consentChecked) {
      message.warning('Vui lòng xác nhận quyền sở hữu hình ảnh và đồng ý xử lý ảnh để tiếp tục.');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      setStatusMessage('Đang khởi tạo phiên quét 3D an toàn...');

      // 1. Create Scan
      const sessionName = `Kỷ vật 3D (${new Date().toLocaleDateString('vi-VN')})`;
      const scan = await scanReconstructionService.createScan(sessionName);
      setUploadProgress(25);

      // 2. Upload images sequentially
      const total = images.length;
      let primaryBackendImageId = '';

      for (let i = 0; i < total; i++) {
        const item = images[i];
        setStatusMessage(`Đang tải lên và mã hóa ảnh an toàn trên Cloudinary (${i + 1}/${total})...`);
        const uploaded = await scanReconstructionService.uploadImage(scan.id, item.file);

        if (item.isPrimary || !primaryBackendImageId) {
          primaryBackendImageId = uploaded.id;
        }

        const pct = 25 + Math.round(((i + 1) / total) * 55);
        setUploadProgress(pct);
      }

      if (!primaryBackendImageId) {
        throw new Error('Không thể xác nhận mã định danh ảnh trên hệ thống lưu trữ. Vui lòng thử lại.');
      }

      // 3. Submit Reconstruction Job
      setStatusMessage('Đang gửi lệnh tái tạo lên cụm AI FastAPI / Hunyuan3D-2...');
      setUploadProgress(85);

      const job = await scanReconstructionService.submitJob(scan.id, primaryBackendImageId);
      setUploadProgress(100);
      setStatusMessage('Khởi tạo thành công! Đang chuyển hướng tới màn hình theo dõi 3D...');

      message.success('Đã bắt đầu dựng mô hình 3D! Cụm GPU đang xử lý ảnh của bạn.');
      setTimeout(() => {
        navigate(`/reconstruction/${scan.id}`, { state: { jobId: job.jobId } });
      }, 600);
    } catch (err: any) {
      const backendErrorMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        'Không thể tạo phiên quét 3D. Vui lòng kiểm tra kết nối mạng và thử lại.';
      message.error(backendErrorMsg);
      setIsSubmitting(false);
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Tag color="purple" style={{ padding: '4px 14px', borderRadius: 9999, fontWeight: 700, fontSize: '0.8rem' }}>
            DEEPTECH 3D RECONSTRUCTION
          </Tag>
          <Title level={1} style={{ color: 'var(--text-primary)', marginTop: 12, fontWeight: 800 }}>
            Tạo Kỷ Vật 3D Cá Nhân Hóa
          </Title>
          <Paragraph style={{ color: 'var(--text-secondary)', maxWidth: 680, margin: '8px auto 0', fontSize: '1rem' }}>
            Chụp ảnh bằng camera laptop hoặc tải lên tập ảnh từ điện thoại thông minh. Trí tuệ nhân tạo sẽ biến chuỗi ảnh thành mô hình 3D chân thực, sẵn sàng để chế tác in vật lý.
          </Paragraph>
        </div>

        {/* Input Guidelines Alert */}
        <Card
          style={{
            background: 'rgba(124, 92, 252, 0.08)',
            borderColor: 'rgba(124, 92, 252, 0.3)',
            borderRadius: 16,
            marginBottom: 28,
          }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <InfoCircleOutlined style={{ color: 'var(--primary, #7C5CFC)', fontSize: 22, marginTop: 2 }} />
            <div>
              <Text strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Hướng dẫn ảnh đầu vào tiêu chuẩn:
              </Text>
              <Text style={{ display: 'block', color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.88rem' }}>
                {capabilities?.guidelines || 'Chụp các góc ảnh rõ nét, bao quát 360 độ quanh chủ thể với ánh sáng tự nhiên đầy đủ. Tránh chụp vật thể trong suốt hoặc phản chiếu cao.'}
              </Text>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Tag color="blue">Tối thiểu: {minImages} ảnh</Tag>
                <Tag color="cyan">Tối đa: {maxImages} ảnh</Tag>
                <Tag color="geekblue">Định dạng: JPG, PNG, WEBP (Tối đa 20MB/ảnh)</Tag>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons: Camera vs File Upload */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* Card 1: Camera Laptop */}
          <Card
            hoverable
            onClick={() => setCameraModalOpen(true)}
            style={{
              background: 'var(--bg-card, #14121E)',
              borderColor: 'var(--border-default, #2E274A)',
              borderRadius: 20,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
            }}
            styles={{ body: { padding: 24, textAlign: 'center' } }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(124, 92, 252, 0.15)',
                color: 'var(--primary, #7C5CFC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                margin: '0 auto 16px',
              }}
            >
              <CameraOutlined />
            </div>
            <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontWeight: 700 }}>
              Chụp bằng Camera Laptop
            </Title>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mở trực tiếp webcam, căn góc chụp và xem trước từng ảnh chụp trực tiếp trên trình duyệt.
            </Text>
          </Card>

          {/* Card 2: Upload Files */}
          <Upload
            multiple
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            beforeUpload={(file) => {
              addFile(file);
              return false; // Prevent automatic HTTP upload, we handle in submit flow
            }}
          >
            <Card
              hoverable
              style={{
                background: 'var(--bg-card, #14121E)',
                borderColor: 'var(--border-default, #2E274A)',
                borderRadius: 20,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                height: '100%',
              }}
              styles={{ body: { padding: 24, textAlign: 'center' } }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(14, 165, 233, 0.15)',
                  color: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  margin: '0 auto 16px',
                }}
              >
                <UploadOutlined />
              </div>
              <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontWeight: 700 }}>
                Tải ảnh từ Thiết bị
              </Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Kéo thả hoặc chọn nhiều ảnh chụp từ điện thoại thông minh, máy ảnh số hoặc thẻ nhớ.
              </Text>
            </Card>
          </Upload>
        </div>

        {/* Gallery Section */}
        <Card
          style={{
            background: 'var(--bg-card, #14121E)',
            borderColor: 'var(--border-default, #2E274A)',
            borderRadius: 20,
            marginBottom: 28,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                Danh sách ảnh đầu vào ({images.length} / {minImages} tối thiểu)
              </Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Bấm vào biểu tượng ngôi sao để chọn một ảnh làm ảnh góc chính (Primary view).
              </Text>
            </div>

            <Space>
              {images.length > 0 && (
                <Popconfirm
                  title="Xóa toàn bộ ảnh đã chọn?"
                  onConfirm={() => setImages([])}
                  okText="Xóa tất cả"
                  cancelText="Hủy"
                >
                  <Button danger type="text" style={{ borderRadius: 6 }}>
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>

          {images.length === 0 ? (
            <div
              style={{
                border: '2px dashed var(--border-default, #2E274A)',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <UploadOutlined style={{ fontSize: 44, color: 'var(--text-muted, #6A6282)', marginBottom: 12 }} />
              <Paragraph style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Chưa có ảnh nào được thêm. Hãy chọn chụp bằng Camera hoặc tải ảnh từ thiết bị ở trên.
              </Paragraph>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 16,
              }}
            >
              {images.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: item.isPrimary ? '2.5px solid var(--primary, #7C5CFC)' : '1px solid var(--border-default, #2E274A)',
                    background: '#0B0A10',
                  }}
                >
                  <img
                    src={item.previewUrl}
                    alt={`Scan photo ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Primary Badge */}
                  {item.isPrimary && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: 'var(--primary, #7C5CFC)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      Ảnh chính
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      display: 'flex',
                      gap: 4,
                    }}
                  >
                    {!item.isPrimary && (
                      <Button
                        shape="circle"
                        size="small"
                        icon={<StarOutlined />}
                        onClick={() => handleSetPrimary(item.id)}
                        style={{
                          background: 'rgba(0, 0, 0, 0.65)',
                          color: '#facc15',
                          borderColor: 'transparent',
                        }}
                      />
                    )}
                    <Button
                      shape="circle"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveImage(item.id)}
                      style={{
                        background: 'rgba(0, 0, 0, 0.65)',
                        borderColor: 'transparent',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Legal Consent and Submit Card */}
        <Card
          style={{
            background: 'var(--bg-card, #14121E)',
            borderColor: 'var(--border-default, #2E274A)',
            borderRadius: 20,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ marginBottom: 20 }}>
            <Checkbox
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            >
              <Text style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Tôi cam kết có toàn quyền sử dụng hợp pháp các hình ảnh này và đồng ý cho Memento3D xử lý đồ họa tái tạo 3D theo{' '}
                <a href="/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--primary, #7C5CFC)' }}>
                  Điều khoản Dịch vụ
                </a>{' '}
                và{' '}
                <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--primary, #7C5CFC)' }}>
                  Chính sách Bảo mật
                </a>.
              </Text>
            </Checkbox>
          </div>

          {/* Progress bar during uploading */}
          {isSubmitting && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{statusMessage}</Text>
                <Text style={{ color: 'var(--primary, #7C5CFC)', fontWeight: 700 }}>{uploadProgress}%</Text>
              </div>
              <Progress percent={uploadProgress} showInfo={false} strokeColor="var(--primary, #7C5CFC)" />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block' }}>
                Đã sẵn sàng {images.length}/{minImages} ảnh đầu vào
              </Text>
              {images.length < minImages && (
                <Text type="danger" style={{ fontSize: '0.8rem' }}>
                  Cần thêm ít nhất {minImages - images.length} ảnh nữa để tiếp tục.
                </Text>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={handleSubmitJob}
              disabled={images.length < minImages || !consentChecked || isSubmitting}
              loading={isSubmitting}
              style={{
                background: 'var(--primary, #7C5CFC)',
                borderRadius: 9999,
                fontWeight: 700,
                height: 48,
                padding: '0 32px',
                boxShadow: '0 8px 24px rgba(124, 92, 252, 0.4)',
              }}
            >
              Tạo mô hình xem trước (Miễn phí)
            </Button>
          </div>
        </Card>
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onPhotoCaptured={(file) => {
          addFile(file);
          message.success('Đã lưu ảnh từ camera vào danh sách quét 3D.');
        }}
      />

      <Footer />
    </div>
  );
};
