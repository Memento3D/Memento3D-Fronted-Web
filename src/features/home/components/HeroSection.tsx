import React from 'react';
import { Button, Tag } from 'antd';
import {
  ArrowRightOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CodeSandboxOutlined,
  StarFilled,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './heroSection.css';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate3D = () => {
    navigate('/reconstruction/demo');
  };

  const handleExploreProducts = () => {
    navigate('/products');
  };

  return (
    <section id="hero" className="hero-section-wrapper">
      <div className="hero-glow-ambient hero-glow-1" />
      <div className="hero-glow-ambient hero-glow-2" />

      <div className="home-container" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
        <div className="hero-grid-layout">
          
          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="hero-text-col">
            <div className="hero-pill-badge">
              <span className="hero-badge-dot" />
              <span>Nền tảng Chế tác 3D Cá nhân hóa</span>
            </div>

            <h1 className="hero-main-headline">
              Biến khoảnh khắc của bạn
              <span className="hero-highlight-gradient">
                {' '}thành mô hình 3D độc nhất
              </span>
            </h1>

            <p className="hero-subheading-text">
              Tải ảnh lên, tạo mô hình 3D và biến những kỷ niệm đáng nhớ thành sản phẩm cá nhân hóa. Từng chi tiết được in chính xác bằng công nghệ đắp lớp SLA công nghiệp.
            </p>

            <div className="hero-action-group">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={handleCreate3D}
                className="hero-primary-btn"
              >
                Tạo mô hình 3D
              </Button>

              <Button
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleExploreProducts}
                className="hero-secondary-btn"
              >
                Khám phá sản phẩm
              </Button>
            </div>

            {/* Trust Markers */}
            <div className="hero-trust-bar">
              <div className="trust-item">
                <CheckCircleOutlined className="trust-icon" />
                <span>AI NeRF 3D chính xác</span>
              </div>
              <div className="trust-item">
                <CheckCircleOutlined className="trust-icon" />
                <span>In quang hóa độ nét 0.05mm</span>
              </div>
              <div className="trust-item">
                <CheckCircleOutlined className="trust-icon" />
                <span>Xem trước 360° miễn phí</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic / Floating Model Preview Showcase */}
          <div className="hero-visual-col">
            <div className="hero-visual-card">
              {/* Card Header Status */}
              <div className="visual-card-top">
                <div className="visual-status-indicator">
                  <span className="pulse-dot" />
                  <span className="status-label">MÔ PHỎNG 3D THỜI GIAN THỰC</span>
                </div>
                <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
                  Độ chi tiết 8K
                </Tag>
              </div>

              {/* 3D Visual Centerpiece */}
              <div className="visual-stage-box">
                {/* Visual Geometry Representation: 3D Rotating Gyro / Sphere */}
                <div className="gyro-3d-box">
                  <div className="gyro-ring ring-outer" />
                  <div className="gyro-ring ring-mid" />
                  <div className="gyro-ring ring-inner" />

                  {/* Core 3D Model Polyhedron / Cube Icon */}
                  <div className="gyro-core-cube">
                    <CodeSandboxOutlined className="core-icon" />
                  </div>
                </div>

                {/* Synthesis Indicator Bar */}
                <div className="stage-info-pill">
                  <span className="stage-title">Kỷ vật cá nhân hóa</span>
                  <span className="stage-meta">Tái tạo AI đa chiều • Hoàn thiện thủ công</span>
                </div>

                {/* Floating Micro Tag 1 */}
                <div className="floating-chip chip-top-left">
                  <EyeOutlined /> Tải 15 góc ảnh 2D
                </div>

                {/* Floating Micro Tag 2 */}
                <div className="floating-chip chip-bottom-right">
                  <ExperimentOutlined /> Nhựa quang hóa Resin cao cấp
                </div>
              </div>

              {/* Card Footer Telemetry */}
              <div className="visual-card-footer">
                <div className="telemetry-block">
                  <span className="telemetry-val">100%</span>
                  <span className="telemetry-lbl">Độc bản</span>
                </div>
                <div className="telemetry-divider" />
                <div className="telemetry-block">
                  <span className="telemetry-val">15.000+</span>
                  <span className="telemetry-lbl">Tác phẩm</span>
                </div>
                <div className="telemetry-divider" />
                <div className="telemetry-block">
                  <span className="telemetry-val" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <StarFilled style={{ color: '#f59e0b', fontSize: '0.95rem' }} /> 4.9/5
                  </span>
                  <span className="telemetry-lbl">Đánh giá</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
