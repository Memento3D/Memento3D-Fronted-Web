import React, { useState } from 'react';
import { Card, Button, Modal, Radio, Space, Tag, Typography, Alert, Divider } from 'antd';
import {
  PrinterOutlined,
  DownloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export interface FreemiumModelViewerProps {
  scanId: string;
  previewUrl?: string;
  modelName?: string;
  isUnlocked?: boolean;
}

export const FreemiumModelViewer: React.FC<FreemiumModelViewerProps> = ({
  scanId,
  previewUrl,
  modelName = 'Mô hình 3D Cá nhân hóa',
  isUnlocked = false,
}) => {
  const navigate = useNavigate();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<'PLA' | 'RESIN' | 'FULL_COLOR'>('RESIN');
  const [selectedSize, setSelectedSize] = useState<'8cm' | '12cm' | '16cm'>('12cm');

  const getPrice = () => {
    let base = 250000;
    if (selectedMaterial === 'RESIN') base = 390000;
    if (selectedMaterial === 'FULL_COLOR') base = 690000;

    if (selectedSize === '12cm') base = Math.round(base * 1.5);
    if (selectedSize === '16cm') base = Math.round(base * 2.2);

    return base;
  };

  const handleProceedToPrintOrder = () => {
    setUpgradeModalOpen(false);
    navigate(`/checkout?scanId=${scanId}&material=${selectedMaterial}&size=${selectedSize}`);
  };

  return (
    <div>
      {/* 3D Viewer Canvas with Watermark */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            height: 440,
            background: 'radial-gradient(circle at center, #1e293b 0%, #080d1a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* Watermark Diagonal Grid */}
          {!isUnlocked && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                opacity: 0.18,
                transform: 'rotate(-25deg) scale(1.4)',
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    letterSpacing: '0.25em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  BẢN XEM TRƯỚC MEMENTO3D
                </div>
              ))}
            </div>
          )}

          {/* 3D Model Centerpiece */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))' }}>
              🗿
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginTop: 12 }}>
              {modelName}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
              {isUnlocked ? 'Bản chính thức độ phân giải cao 4K' : 'Bản xem trước miễn phí (Low-Poly / Watermarked)'}
            </div>
          </div>

          {/* Freemium Watermark Top Badge */}
          {!isUnlocked && (
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '4px 12px',
                borderRadius: 20,
                color: '#f87171',
                fontSize: '0.75rem',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              🔒 BẢN XEM TRƯỚC CÓ WATERMARK
            </div>
          )}
        </div>

        {/* Action Call to Action Bar */}
        <div
          style={{
            padding: '24px',
            background: 'rgba(11, 16, 28, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
              {isUnlocked ? 'Mô hình đã sẵn sàng để in vật lý' : 'Bạn hài lòng với bản dựng 3D này?'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>
              {isUnlocked
                ? 'File gốc đã được lưu trữ an toàn trong kho tài sản số của bạn.'
                : 'Nâng cấp ngay để in tượng 3D thực tế hoặc tải file GLB/OBJ gốc sắc nét không có watermark.'}
            </div>
          </div>

          <Space size="middle">
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={() => setUpgradeModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                borderColor: 'transparent',
                fontWeight: 700,
                borderRadius: 10,
                height: 46,
                padding: '0 24px',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
              }}
            >
              Đặt in 3D Thực tế
            </Button>

            <Button
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (isUnlocked && previewUrl) {
                  window.open(previewUrl, '_blank');
                } else {
                  setUpgradeModalOpen(true);
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: 10,
                height: 46,
              }}
            >
              {isUnlocked ? 'Tải file 3D gốc' : 'Mua file 3D chất lượng cao'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Upgrade Modal */}
      <Modal
        open={upgradeModalOpen}
        onCancel={() => setUpgradeModalOpen(false)}
        title={
          <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
            Nâng cấp: In 3D Kỷ vật Thực tế
          </span>
        }
        footer={[
          <Button key="cancel" onClick={() => setUpgradeModalOpen(false)}>
            Để sau
          </Button>,
          <Button
            key="checkout"
            type="primary"
            icon={<ShoppingOutlined />}
            size="large"
            onClick={handleProceedToPrintOrder}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
              borderColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Tiến hành đặt hàng ({getPrice().toLocaleString('vi-VN')} VND)
          </Button>,
        ]}
        width={640}
      >
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="Chế tác vật lý chất lượng cao"
            description="Kỷ vật của bạn sẽ được in trên hệ thống máy in 3D công nghiệp Memento3D và phủ bóng bảo vệ bề mặt cao cấp."
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <div style={{ marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              1. Chọn chất liệu in:
            </Text>
            <Radio.Group
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <Radio value="PLA" style={{ color: '#f8fafc' }}>
                <span style={{ fontWeight: 600 }}>PLA Sinh học cao cấp</span> (Bền nhẹ, thân thiện môi trường)
              </Radio>
              <Radio value="RESIN" style={{ color: '#f8fafc' }}>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>Resin Quang hóa siêu mịn (Khuyên dùng)</span> (Chi tiết sắc nét tới từng micron)
              </Radio>
              <Radio value="FULL_COLOR" style={{ color: '#f8fafc' }}>
                <span style={{ fontWeight: 600, color: '#a855f7' }}>In Full-color Đá sa thạch màu</span> (Màu sắc sống động như thật)
              </Radio>
            </Radio.Group>
          </div>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          <div style={{ marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              2. Chọn kích thước chiều cao:
            </Text>
            <Radio.Group
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              style={{ display: 'flex', gap: 16 }}
            >
              <Radio.Button value="8cm">Nhỏ (8 cm)</Radio.Button>
              <Radio.Button value="12cm">Tiêu chuẩn (12 cm)</Radio.Button>
              <Radio.Button value="16cm">Lớn (16 cm)</Radio.Button>
            </Radio.Group>
          </div>

          <div
            style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dự toán giá trọn gói:</div>
              <div style={{ color: '#22c55e', fontSize: '1.4rem', fontWeight: 800 }}>
                {getPrice().toLocaleString('vi-VN')} VND
              </div>
            </div>
            <Tag color="cyan">Đã bao gồm hoàn thiện & đóng gói</Tag>
          </div>
        </div>
      </Modal>
    </div>
  );
};
