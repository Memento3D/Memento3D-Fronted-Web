import React from 'react';
import { Button, Tag } from 'antd';
import {
  ArrowRightOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="hero-wrapper">
      <div className="hero-glow-bg" />

      <div className="home-container" style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 40, alignItems: 'center' }}>
          
          {/* Left Column: Headline, Value Proposition & Actions */}
          <div style={{ gridColumn: 'span 7' }} className="hero-text-col">
            <div className="section-badge">
              <StarOutlined style={{ color: '#818cf8' }} />
              <span>Kỷ vật 3D Thế hệ mới</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: 20,
              }}
            >
              Kỷ niệm của bạn.{' '}
              <span className="gradient-text-indigo">
                Hiện thực hóa bằng 3D.
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                lineHeight: 1.6,
                color: '#94a3b8',
                maxWidth: 580,
                marginBottom: 36,
              }}
            >
              Biến những khoảnh khắc quý giá thành kỷ vật 3D cá nhân hóa — từ bức ảnh chụp trên điện thoại trở thành vật phẩm hữu hình bạn có thể lưu giữ mãi mãi.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/products')}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '1rem',
                  height: 52,
                  padding: '0 28px',
                  boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                }}
              >
                Khám phá sản phẩm
              </Button>

              <Button
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate('/checkout')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '1rem',
                  height: 52,
                  padding: '0 24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Tạo kỷ vật ngay
              </Button>
            </div>

            {/* Trust Markers */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 24,
                paddingTop: 24,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Tái tạo mô hình AI 3D chuẩn xác</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Độ sắc nét máy in công nghiệp SLA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Không cần kỹ năng dựng hình 3D</span>
              </div>
            </div>
          </div>

          {/* Right Column: Holographic 3D Interactive Card Showcase */}
          <div style={{ gridColumn: 'span 5' }} className="hero-visual-col">
            <div
              className="home-glass-card anim-float"
              style={{
                padding: 24,
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
              }}
            >
              {/* Card Header Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                    ĐỘNG CƠ HÌNH HỌC AI
                  </span>
                </div>
                <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700 }}>
                  Độ nét vi mô 0.05mm
                </Tag>
              </div>

              {/* 3D Visual Centerpiece */}
              <div
                style={{
                  position: 'relative',
                  height: 320,
                  borderRadius: 16,
                  background: 'radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.25) 0%, rgba(10, 15, 29, 0.95) 70%)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Visual Geometry Representation: 3D Crystal Hexagon Lattice */}
                <div
                  style={{
                    position: 'relative',
                    width: 170,
                    height: 170,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Outer Concentric Wireframe Rings */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '2px dashed rgba(6, 182, 212, 0.45)',
                      animation: 'spinSlow 20s linear infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 16,
                      borderRadius: '50%',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      animation: 'spinSlow 12s linear infinite reverse',
                    }}
                  />

                  {/* Geometric 3D Keepsake Representation Icon */}
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 24,
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(6, 182, 212, 0.9) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 35px rgba(6, 182, 212, 0.6)',
                      transform: 'rotate(12deg)',
                    }}
                  >
                    <ThunderboltOutlined style={{ fontSize: 44, color: '#ffffff' }} />
                  </div>
                </div>

                {/* Synthesis Indicator Bar */}
                <div style={{ marginTop: 24, textAlign: 'center', zIndex: 2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    Kỷ vật: "Tượng Vinh danh Tốt nghiệp"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                    Dựng hình đa giác AI • 14.820 mặt phẳng
                  </div>
                </div>

                {/* Floating Micro Tag 1 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <EyeOutlined /> Đầu vào: Ảnh 2D
                </div>

                {/* Floating Micro Tag 2 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 14,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircleOutlined /> Đã xuất file in (G-Code)
                </div>
              </div>

              {/* Card Footer Specifications */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Vật liệu</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                    PLA Đồng lụa
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Độ phân giải</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                    0.12mm Siêu mịn
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Thời gian</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', marginTop: 2 }}>
                    2-3 Ngày
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .hero-text-col {
            grid-column: span 12 !important;
            text-align: center;
          }
          .hero-text-col p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-text-col > div {
            justify-content: center;
          }
          .hero-visual-col {
            grid-column: span 12 !important;
            max-width: 460px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
};
export default HeroSection;
