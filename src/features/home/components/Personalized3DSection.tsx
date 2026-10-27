import React from 'react';
import { Button } from 'antd';
import {
  UploadOutlined,
  EyeOutlined,
  ControlOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './personalized3D.css';

const STEPS = [
  {
    stepId: 'upload',
    stepLabel: 'Bước 1',
    title: 'Tải ảnh lên',
    subtitle: 'Upload Photos',
    desc: 'Chụp hoặc tải lên 10–30 góc ảnh từ điện thoại thông minh của bạn trong điều kiện ánh sáng tự nhiên.',
    icon: <UploadOutlined />,
    badge: 'Đơn giản & Nhanh',
  },
  {
    stepId: 'preview',
    stepLabel: 'Bước 2',
    title: 'Xem trước miễn phí',
    subtitle: 'Free 3D Preview',
    desc: 'Cụm GPU đám mây chạy thuật toán NeRF & Photogrammetry tái hiện mô hình 3D tương tác 360 độ.',
    icon: <EyeOutlined />,
    badge: 'AI Render',
  },
  {
    stepId: 'review',
    stepLabel: 'Bước 3',
    title: 'Kiểm tra mô hình 3D',
    subtitle: 'Review 3D Model',
    desc: 'Xem trước bề mặt, chỉnh sửa kích thước, thêm chân đế hoặc khắc chữ thông điệp cá nhân hóa.',
    icon: <ControlOutlined />,
    badge: 'Tùy chỉnh 100%',
  },
  {
    stepId: 'order',
    stepLabel: 'Bước 4',
    title: 'Chọn sản phẩm & Đặt hàng',
    subtitle: 'Choose Product & Order',
    desc: 'Lựa chọn chất liệu (Resin siêu nét, PLA sinh học, Kim loại) và nhận kỷ vật hữu hình tận nhà.',
    icon: <ShoppingOutlined />,
    badge: 'Giao hàng tận nơi',
  },
];

export const Personalized3DSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartCustom3D = () => {
    navigate('/create-keepsake');
  };

  return (
    <section id="custom-3d" className="home-section personalized-section">
      <div className="home-container">
        {/* Banner Card Container */}
        <div className="personalized-hero-card">
          <div className="personalized-glow-bg" />

          {/* Heading Block */}
          <div className="personalized-header">
            <div className="section-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
              <ThunderboltOutlined style={{ color: 'var(--primary)' }} />
              <span>Dịch vụ chế tác Memento3D</span>
            </div>

            <h2 className="personalized-title">
              Bạn chưa tìm thấy món quà phù hợp?
            </h2>

            <p className="personalized-subtitle">
              Tạo sản phẩm 3D của riêng bạn từ ảnh chụp thực tế. Lưu giữ kỷ niệm tình thân, người thương, thú cưng thành tác phẩm cầm nắm trên tay.
            </p>

            <div className="personalized-cta-wrapper">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleStartCustom3D}
                className="personalized-cta-btn"
              >
                Bắt đầu tạo mô hình
              </Button>
              <span className="personalized-cta-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ThunderboltOutlined style={{ color: 'var(--primary)' }} />
                Miễn phí mô phỏng 3D trước khi quyết định đặt in
              </span>
            </div>
          </div>

          {/* 4 Step Cards Grid */}
          <div className="personalized-steps-grid">
            {STEPS.map((step) => (
              <div key={step.stepId} className="step-card">
                <div className="step-card-header">
                  <span className="step-number" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {step.stepLabel}
                  </span>
                  <div className="step-icon-bubble">{step.icon}</div>
                </div>

                <div className="step-tag-pill">{step.badge}</div>

                <h4 className="step-title">{step.title}</h4>
                <span className="step-subtitle">{step.subtitle}</span>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Personalized3DSection;
