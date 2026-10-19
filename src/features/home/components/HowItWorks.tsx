import React, { useState } from 'react';
import { Row, Col, Tag } from 'antd';
import {
  CloudUploadOutlined,
  ExperimentOutlined,
  BgColorsOutlined,
  GiftOutlined,
  CheckOutlined,
} from '@ant-design/icons';

interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
  details: string[];
  metrics: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Tải lên Ảnh của bạn',
    subtitle: 'Điện thoại hoặc Máy ảnh kỹ thuật số',
    description:
      'Chỉ cần chụp từ 1 đến 5 bức ảnh rõ nét của người thân, thú cưng hoặc địa danh bạn muốn lưu giữ. Không cần máy ảnh chuyên nghiệp hay phần cứng LiDAR.',
    icon: <CloudUploadOutlined style={{ fontSize: 28, color: '#38bdf8' }} />,
    tag: 'Tiếp nhận Tức thì',
    tagColor: 'cyan',
    details: ['Hỗ trợ định dạng JPEG, PNG, HEIC', 'Tự động cân bằng sáng thông minh', 'Tách chủ thể khỏi phông nền'],
    metrics: 'Tải lên < 10 giây',
  },
  {
    number: '02',
    title: 'AI Tái cấu trúc 3D',
    subtitle: 'Tổng hợp Lưới đa giác Neural',
    description:
      'Động cơ thị giác máy tính độc quyền tổng hợp bản đồ độ sâu đa góc nhìn thành lưới đa giác 3D mật độ cao, khép kín hoàn toàn và không có cạnh hở.',
    icon: <ExperimentOutlined style={{ fontSize: 28, color: '#818cf8' }} />,
    tag: 'Hình học AI',
    tagColor: 'purple',
    details: ['Xuất file 3D STL / OBJ hoàn chỉnh', 'Tái tạo đường nét khuôn mặt dưới 1mm', 'Tự động sửa lỗi bề mặt dạng khối'],
    metrics: 'Độ chính xác lưới 99.4%',
  },
  {
    number: '03',
    title: 'Tùy biến Kỷ vật của bạn',
    subtitle: 'Vật liệu & Bề mặt hoàn thiện',
    description:
      'Chọn kích thước vật lý, chất liệu hoàn thiện cao cấp (Đồng lụa, Đá nhám, Resin pha lê trong suốt) và cá nhân hóa đế trưng bày khắc tên hoặc ngày kỷ niệm.',
    icon: <BgColorsOutlined style={{ fontSize: 28, color: '#f59e0b' }} />,
    tag: 'Tùy biến Theo yêu cầu',
    tagColor: 'gold',
    details: ['Kích thước để bàn từ 8cm đến 25cm', 'Vật liệu sinh học Bio-PLA & Resin SLA', 'Khắc laser tên & ngày kỷ niệm lên đế'],
    metrics: 'Hơn 12 bảng màu hoàn thiện',
  },
  {
    number: '04',
    title: 'In 3D & Lưu giữ Mãi mãi',
    subtitle: 'Sản xuất Đắp lớp & Giao nhận',
    description:
      'Được chuyển tới xưởng in 3D khép kín kiểm soát nhiệt độ. Từng tác phẩm được đùn sợi chính xác, sấy UV, kiểm định thủ công và đóng hộp quà bảo vệ sang trọng.',
    icon: <GiftOutlined style={{ fontSize: 28, color: '#10b981' }} />,
    tag: 'Xưởng in Công nghiệp',
    tagColor: 'green',
    details: ['Hàng đợi in tự động OctoPrint', 'Kiểm định QC & hoàn thiện tỉ mỉ bằng tay', 'Đóng gói hộp quà lưu niệm cao cấp'],
    metrics: 'Hoàn thiện trong 48-72 giờ',
  },
];

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="home-section" style={{ position: 'relative' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-badge">
            <span>Quy trình 4 Bước Liền mạch</span>
          </div>
          <h2 className="section-title">
            Kỷ niệm của bạn Trở thành <span className="gradient-text-cyan">Nghệ thuật Hữu hình</span>
          </h2>
          <p className="section-subtitle">
            Từ một bức ảnh thông thường trong điện thoại trở thành tác phẩm điêu khắc 3D vĩnh cửu trên bàn làm việc của bạn. Hoàn toàn không cần kỹ năng kỹ thuật.
          </p>
        </div>

        {/* Interactive Step Navigator Grid */}
        <Row gutter={[24, 24]}>
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <Col xs={24} sm={12} lg={6} key={step.number}>
                <div
                  onClick={() => setActiveStep(idx)}
                  className="home-glass-card"
                  style={{
                    padding: 24,
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: isActive ? 'rgba(99, 102, 241, 0.7)' : 'rgba(255, 255, 255, 0.08)',
                    background: isActive
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'rgba(15, 23, 42, 0.55)',
                    boxShadow: isActive ? '0 10px 30px rgba(99, 102, 241, 0.25)' : 'none',
                    transform: isActive ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <span
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          color: isActive ? '#818cf8' : '#475569',
                          letterSpacing: '-0.05em',
                        }}
                      >
                        {step.number}
                      </span>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                        }}
                      >
                        {step.icon}
                      </div>
                    </div>

                    <Tag color={step.tagColor} style={{ marginBottom: 12, borderRadius: 6, fontWeight: 700 }}>
                      {step.tag}
                    </Tag>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                      {step.title}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>
                      {step.subtitle}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Bullet points for active step */}
                  <div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                      {step.details.map((detail, dIdx) => (
                        <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CheckOutlined style={{ fontSize: 12, color: isActive ? '#38bdf8' : '#64748b' }} />
                          <span style={{ fontSize: '0.78rem', color: isActive ? '#e2e8f0' : '#94a3b8' }}>{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Thông số</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{step.metrics}</span>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </section>
  );
};
export default HowItWorks;
