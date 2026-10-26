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
  id: string;
  stepName: string;
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
    id: 'upload',
    stepName: 'Bước 1',
    title: 'Tải lên Ảnh của bạn',
    subtitle: 'Điện thoại hoặc Máy ảnh kỹ thuật số',
    description:
      'Chụp từ 1 đến 5 bức ảnh rõ nét của người thân, thú cưng hoặc địa danh bạn muốn lưu giữ. Không cần máy ảnh chuyên nghiệp hay phần cứng LiDAR.',
    icon: <CloudUploadOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />,
    tag: 'Tiếp nhận Tức thì',
    tagColor: 'purple',
    details: ['Hỗ trợ định dạng JPEG, PNG, HEIC', 'Tự động cân bằng sáng thông minh', 'Tách chủ thể khỏi phông nền'],
    metrics: 'Tải lên < 10 giây',
  },
  {
    id: 'reconstruct',
    stepName: 'Bước 2',
    title: 'AI Tái cấu trúc 3D',
    subtitle: 'Tổng hợp Lưới đa giác Neural',
    description:
      'Động cơ thị giác máy tính độc quyền tổng hợp bản đồ độ sâu đa góc nhìn thành lưới đa giác 3D mật độ cao, khép kín hoàn toàn và không có cạnh hở.',
    icon: <ExperimentOutlined style={{ fontSize: 24, color: '#0284c7' }} />,
    tag: 'Hình học AI',
    tagColor: 'blue',
    details: ['Xuất file 3D STL / OBJ hoàn chỉnh', 'Tái tạo đường nét khuôn mặt dưới 1mm', 'Tự động sửa lỗi bề mặt dạng khối'],
    metrics: 'Độ chính xác lưới 99.4%',
  },
  {
    id: 'customize',
    stepName: 'Bước 3',
    title: 'Tùy biến Kỷ vật của bạn',
    subtitle: 'Vật liệu & Bề mặt hoàn thiện',
    description:
      'Chọn kích thước vật lý, chất liệu hoàn thiện cao cấp (Đồng lụa, Đá nhám, Resin pha lê trong suốt) và cá nhân hóa đế trưng bày khắc tên hoặc ngày kỷ niệm.',
    icon: <BgColorsOutlined style={{ fontSize: 24, color: '#d97706' }} />,
    tag: 'Tùy biến Theo yêu cầu',
    tagColor: 'orange',
    details: ['Kích thước để bàn từ 8cm đến 25cm', 'Vật liệu sinh học Bio-PLA & Resin SLA', 'Khắc laser tên & ngày kỷ niệm lên đế'],
    metrics: 'Hơn 12 bảng màu hoàn thiện',
  },
  {
    id: 'manufacture',
    stepName: 'Bước 4',
    title: 'In 3D & Lưu giữ Mãi mãi',
    subtitle: 'Sản xuất Đắp lớp & Giao nhận',
    description:
      'Được chuyển tới xưởng in 3D khép kín kiểm soát nhiệt độ. Từng tác phẩm được đùn sợi chính xác, sấy UV, kiểm định thủ công và đóng hộp quà bảo vệ sang trọng.',
    icon: <GiftOutlined style={{ fontSize: 24, color: 'var(--tertiary)' }} />,
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
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-badge">
            <span>Quy trình Chế tác Kỷ vật</span>
          </div>
          <h2 className="section-title">
            Kỷ niệm của bạn trở thành tác phẩm hữu hình
          </h2>
          <p className="section-subtitle">
            Từ một bức ảnh thông thường trong điện thoại trở thành tác phẩm điêu khắc 3D vĩnh cửu trên bàn làm việc của bạn.
          </p>
        </div>

        {/* Step Navigator Grid */}
        <Row gutter={[20, 20]}>
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <Col xs={24} sm={12} lg={6} key={step.id}>
                <div
                  onClick={() => setActiveStep(idx)}
                  style={{
                    padding: 20,
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'var(--bg-card)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-card, 10px)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    {/* Step Name & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {step.stepName}
                      </span>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-sm, 6px)',
                          background: 'var(--surface-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {step.icon}
                      </div>
                    </div>

                    <Tag color={step.tagColor} style={{ marginBottom: 10, borderRadius: 4, fontWeight: 600 }}>
                      {step.tag}
                    </Tag>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {step.title}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 10 }}>
                      {step.subtitle}
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                      {step.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      {step.details.map((detail, dIdx) => (
                        <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CheckOutlined style={{ fontSize: 11, color: 'var(--tertiary)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        padding: '6px 10px',
                        background: 'var(--surface-container)',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Thông số</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{step.metrics}</span>
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
