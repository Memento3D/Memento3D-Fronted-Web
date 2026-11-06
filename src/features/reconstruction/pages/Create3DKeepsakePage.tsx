import { ShoppingPageFrame } from '../../../components/layout/ShoppingPageFrame';
import React, { useState, useEffect, useRef } from 'react';
import { apiErrorStatus } from '../../../services/apiErrors';
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
  Select,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  CameraOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { scanReconstructionService } from '../../../services/scanReconstructionService';
import type { ReconstructionCapabilities, ViewHint } from '../../../services/scanReconstructionService';

const { Title, Text, Paragraph } = Typography;

interface LocalImageItem {
  id: string;
  file: File;
  previewUrl: string;
  viewHint: ViewHint | null;
}

const REQUIRED_VIEW_HINTS: ViewHint[] = ['front', 'left', 'right'];
const VIEW_HINT_OPTIONS: Array<{ value: ViewHint; label: string }> = [
  { value: 'front', label: 'Chính diện (front)' },
  { value: 'left', label: 'Nghiêng trái (left)' },
  { value: 'right', label: 'Nghiêng phải (right)' },
  { value: 'back', label: 'Phía sau (back, tùy chọn)' },
];

export const Create3DKeepsakePage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [capabilities, setCapabilities] = useState<ReconstructionCapabilities | null>(null);
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null);
  const [capabilitiesReload, setCapabilitiesReload] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const pendingScanRef = useRef<{ signature: string; id: string; uploaded: Map<string, string>; submitted: boolean } | null>(null);

  const [images, setImages] = useState<LocalImageItem[]>([]);
  const imagesRef = useRef<LocalImageItem[]>([]);
  const imageUrlsRef = useRef(new Set<string>());
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
        if (isMounted) {
          setCapabilities(data);
          setCapabilitiesError(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setCapabilitiesError(
            error instanceof Error ? error.message : 'Không thể tải cấu hình reconstruction từ máy chủ.'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [capabilitiesReload]);
  useEffect(() => { mountedRef.current = true;return () => { mountedRef.current = false; }; }, []);

  // Keep the ref in sync for synchronous multi-file selection events.
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup object URLs on unmount.
  useEffect(() => {
    const imageUrls = imageUrlsRef.current;
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
      imageUrls.clear();
    };
  }, []);

  const minImages = capabilities?.minImages ?? 3;
  const maxImages = capabilities?.maxImages ?? 4;

  // Add captured or picked file to image list
  const addFile = (file: File) => {
    if (submittingRef.current) return;
    if (!capabilities) {
      message.error('Chưa tải được cấu hình ảnh từ máy chủ. Vui lòng tải lại trang hoặc thử lại sau.');
      return;
    }

    if (imagesRef.current.length >= maxImages) {
      message.warning(`Đã đạt giới hạn tối đa ${maxImages} ảnh cho một phiên tái tạo.`);
      return;
    }

    if (!capabilities.supportedFormats.includes(file.type)) {
      message.error(`Định dạng ${file.type || 'không xác định'} không được hỗ trợ.`);
      return;
    }

    if (file.size > capabilities.maxFileSizeMb * 1024 * 1024) {
      message.error(`Mỗi ảnh không được vượt quá ${capabilities.maxFileSizeMb} MiB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    imageUrlsRef.current.add(previewUrl);
    const next = [
      ...imagesRef.current,
      {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        viewHint: null,
      },
    ];
    imagesRef.current = next;
    setImages(next);
    return true;
  };

  const handleRemoveImage = (id: string) => {
    if (submittingRef.current) return;
    const target = imagesRef.current.find((image) => image.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      imageUrlsRef.current.delete(target.previewUrl);
    }
    const next = imagesRef.current.filter((image) => image.id !== id);
    imagesRef.current = next;
    setImages(next);
  };

  const handleSetViewHint = (id: string, viewHint: ViewHint | null) => {
    if (submittingRef.current) return;
    if (viewHint && imagesRef.current.some((image) => image.id !== id && image.viewHint === viewHint)) {
      message.warning(`Đã có ảnh được gán góc ${viewHint}. Mỗi góc chỉ dùng một ảnh.`);
      return;
    }
    const next = imagesRef.current.map((image) => image.id === id ? { ...image, viewHint } : image);
    imagesRef.current = next;
    setImages(next);
  };

  const handleRemoveAllImages = () => {
    if (submittingRef.current) return;
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrlsRef.current.clear();
    imagesRef.current = [];
    setImages([]);
  };

  // Submit flow: Create Scan Session -> Upload Images -> Submit Reconstruction Job
  const handleSubmitJob = async () => {
    if (submittingRef.current) return;
    if (!capabilities) {
      message.error('Chưa lấy được cấu hình reconstruction từ máy chủ.');
      return;
    }

    if (images.length < minImages || images.length > maxImages) {
      message.error(`Cần chọn từ ${minImages} đến ${maxImages} ảnh.`);
      return;
    }

    const currentImages = imagesRef.current;
    const assignedViews = currentImages.map((image) => image.viewHint).filter((view): view is ViewHint => view !== null);
    const missingViews = REQUIRED_VIEW_HINTS.filter((view) => !assignedViews.includes(view));
    if (currentImages.length < minImages || currentImages.length > maxImages || missingViews.length > 0) {
      message.error(`Vui lòng gán đủ góc: ${missingViews.join(', ')}.`);
      return;
    }

    if (assignedViews.length !== currentImages.length) {
      message.error('Mỗi ảnh được gửi cần có một góc chụp; ảnh back là tùy chọn.');
      return;
    }

    if (!consentChecked) {
      message.warning('Vui lòng xác nhận quyền sở hữu hình ảnh và đồng ý xử lý ảnh để tiếp tục.');
      return;
    }

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      setSubmitError(null);
      setUploadProgress(10);
      setStatusMessage('Đang khởi tạo phiên quét 3D an toàn...');

      // 1. Create Scan
      const sessionName = `Kỷ vật 3D (${new Date().toLocaleDateString('vi-VN')})`;
      const signature = currentImages.map(image => `${image.id}:${image.viewHint}`).join('|');
      if (pendingScanRef.current?.signature !== signature) {
        const scan = await scanReconstructionService.createScan(sessionName);
        pendingScanRef.current = { signature, id: scan.id, uploaded: new Map(), submitted: false };
      }
      const pending = pendingScanRef.current!;
      const scan = { id: pending.id };
      setUploadProgress(25);

      // 2. Upload images sequentially
      const total = currentImages.length;
      let frontImageId = '';

      for (let i = 0; i < total; i++) {
        const item = currentImages[i];
        setStatusMessage(`Đang tải ảnh ${item.viewHint} lên phiên scan (${i + 1}/${total})...`);
        let imageId = pending.uploaded.get(item.id);
        if (!imageId) {
          const uploaded = await scanReconstructionService.uploadImage(scan.id, item.file, item.viewHint!);
          imageId = uploaded.id;
          pending.uploaded.set(item.id, imageId);
        }
        if (item.viewHint === 'front') frontImageId = imageId;

        const pct = 25 + Math.round(((i + 1) / total) * 55);
        setUploadProgress(pct);
      }

      if (!frontImageId) {
        throw new Error('Không nhận được ID của ảnh front sau khi upload.');
      }

      // 3. Submit a free preview job using the front image as the required primary reference.
      setStatusMessage('Đang gửi bộ ảnh front/left/right tới dịch vụ reconstruction...');
      setUploadProgress(85);

      let job;
      if (pending.submitted) {
        // A timed-out POST may already have created the job. Resolve it before
        // issuing another creation request for this same scan.
        try { job = await scanReconstructionService.getLatestJobForScan(scan.id); }
        catch (error) { if (apiErrorStatus(error) !== 404) throw error; }
      }
      if (!job) {
        pending.submitted = true;
        job = await scanReconstructionService.submitPreviewJob(scan.id, frontImageId);
      }
      setUploadProgress(100);
      setStatusMessage('Khởi tạo thành công! Đang chuyển hướng tới màn hình theo dõi 3D...');

      message.success('Đã bắt đầu dựng mô hình xem trước.');
      setTimeout(() => {
        if (mountedRef.current) navigate(`/reconstruction/${scan.id}`, { state: { jobId: job.jobId } });
      }, 600);
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : 'Không thể tạo phiên scan và reconstruction.');
      setSubmitError('Chưa gửi xong bộ ảnh. Giữ nguyên lựa chọn và bấm tạo lại để tiếp tục phiên đang tải; các ảnh đã nhận thành công sẽ không được gửi lại.');
      submittingRef.current = false;
      setIsSubmitting(false);
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  return (
    <ShoppingPageFrame publicStyle={{ minHeight: '100vh', background: 'var(--color-bg, #0B0A10)', color: 'var(--text-primary)' }} contentStyle={{ maxWidth: 1080, margin: '0 auto', padding: '110px 24px 60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Tag color="purple" style={{ padding: '4px 14px', borderRadius: 9999, fontWeight: 700, fontSize: '0.8rem' }}>
            MEMENTO3D HEAD RECONSTRUCTION
          </Tag>
          <Title level={1} style={{ color: 'var(--text-primary)', marginTop: 12, fontWeight: 800 }}>
            Tạo Kỷ Vật 3D Cá Nhân Hóa
          </Title>
          <Paragraph style={{ color: 'var(--text-secondary)', maxWidth: 680, margin: '8px auto 0', fontSize: '1rem' }}>
            Chụp hoặc tải lên bộ ảnh có đủ góc chính diện, trái và phải. Bạn có thể kiểm tra mô hình xem trước sau khi reconstruction hoàn tất.
          </Paragraph>
        </div>

        {capabilitiesError && (
          <Alert
            type="error"
            showIcon
            message="Không tải được cấu hình reconstruction"
            description={capabilitiesError}
            action={<Button onClick={() => { setCapabilitiesError(null);setCapabilitiesReload(value => value + 1); }}>Tải lại cấu hình</Button>}
            style={{ marginBottom: 24 }}
          />
        )}
        {submitError && <Alert type="error" showIcon title="Chưa tạo được tác vụ" description={submitError} style={{ marginBottom: 24 }} />}

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
                <Tag color="geekblue">
                  Định dạng: {capabilities?.supportedFormats.join(', ') || 'đang tải'} (tối đa {capabilities?.maxFileSizeMb ?? '—'} MiB/ảnh)
                </Tag>
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
            accept={capabilities?.supportedFormats.join(',') || 'image/jpeg,image/png'}
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
                Ảnh đầu vào ({images.length}/{maxImages})
              </Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Gán đúng góc chụp cho từng ảnh. Cần đủ front, left và right; back là tùy chọn.
              </Text>
            </div>

            <Space>
              {images.length > 0 && (
                <Popconfirm
                  title="Xóa toàn bộ ảnh đã chọn?"
                  onConfirm={handleRemoveAllImages}
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
                    border: item.viewHint ? '2.5px solid var(--primary, #7C5CFC)' : '1px solid var(--border-default, #2E274A)',
                    background: '#0B0A10',
                  }}
                >
                  <img
                    src={item.previewUrl}
                    alt={`Scan photo ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {item.viewHint && (
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
                      {item.viewHint}
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

                  <Select
                    value={item.viewHint ?? undefined}
                    placeholder="Chọn góc ảnh"
                    options={VIEW_HINT_OPTIONS.map((option) => ({
                      ...option,
                      disabled: images.some((other) => other.id !== item.id && other.viewHint === option.value),
                    }))}
                    onChange={(value: ViewHint | undefined) => handleSetViewHint(item.id, value ?? null)}
                    allowClear
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      width: 'calc(100% - 16px)',
                    }}
                    disabled={isSubmitting}
                  />
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
                Đã gán góc: {REQUIRED_VIEW_HINTS.filter((view) => images.some((image) => image.viewHint === view)).length}/3
              </Text>
              {REQUIRED_VIEW_HINTS.some((view) => !images.some((image) => image.viewHint === view)) && (
                <Text type="danger" style={{ fontSize: '0.8rem' }}>
                  Cần gán đủ ba ảnh front, left và right để tiếp tục.
                </Text>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={handleSubmitJob}
              disabled={
                !capabilities ||
                images.length < minImages ||
                images.length > maxImages ||
                REQUIRED_VIEW_HINTS.some((view) => !images.some((image) => image.viewHint === view)) ||
                images.some((image) => image.viewHint === null) ||
                !consentChecked ||
                isSubmitting
              }
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


      {/* Camera Capture Modal */}
      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onPhotoCaptured={(file) => {
          if (addFile(file)) message.success('Đã lưu ảnh từ camera vào danh sách quét 3D.');
        }}
      />
    </ShoppingPageFrame>
  );
};
