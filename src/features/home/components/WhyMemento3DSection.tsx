import React from 'react';
import { Row, Col } from 'antd';
import {
  CameraOutlined,
  SafetyCertificateOutlined,
  AppstoreAddOutlined,
  RadarChartOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import './whyMemento3D.css';

const BENEFITS = [
  {
    icon: <CameraOutlined />,
    title: 'Cá nhân hóa',
    subtitle: 'Mô hình 3D từ ảnh thật',
    description:
      'Chuyển đổi từng góc chụp điện thoại thành mô hình 3D sống động. Tái hiện chuẩn xác thần thái, nụ cười và khoảnh khắc đáng nhớ nhất của bạn.',
    accentColor: '#0ea5e9',
    badge: 'AI Photogrammetry',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Chất lượng',
    subtitle: 'Kiểm tra chất lượng trước khi giao',
    description:
      'Quy trình kiểm tra QA quang học khắt khe trước đóng gói. Đảm bảo bề mặt in nhẵn mịn, không lỗi khuyết tật và độ bám màu bền bỉ với thời gian.',
    accentColor: '#10b981',
    badge: 'Chuẩn công nghiệp',
  },
  {
    icon: <AppstoreAddOutlined />,
    title: 'Linh hoạt',
    subtitle: 'Nhiều vật liệu và kích thước',
    description:
      'Đa dạng chất liệu từ Resin quang hóa 8K siêu chi tiết, PLA sinh học thân thiện môi trường đến kim loại đồng đúc cao cấp với kích thước từ 5cm – 30cm.',
    accentColor: '#8b5cf6',
    badge: 'Tùy biến cao',
  },
  {
    icon: <RadarChartOutlined />,
    title: 'Theo dõi',
    subtitle: 'Theo dõi tiến độ đơn hàng',
    description:
      'Cập nhật trạng thái sản xuất theo thời gian thực (Real-time SSE): từ dựng lưới AI, cắt lớp in, sấy quang hóa đến khi xuất xưởng giao tận tay.',
    accentColor: '#f59e0b',
    badge: 'Thời gian thực',
  },
];

export const WhyMemento3DSection: React.FC = () => {
  return (
    <section id="why-memento3d" className="home-section why-section">
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 52px' }}>
          <div className="section-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <DeploymentUnitOutlined style={{ color: '#0ea5e9' }} />
            <span>Giá trị cốt lõi</span>
          </div>

          <h2 className="section-title" style={{ margin: '0 0 14px' }}>
            Vì sao chọn Memento3D?
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0, lineHeight: 1.6 }}>
            Chúng tôi định nghĩa lại cách lưu giữ kỷ niệm bằng công nghệ in đắp lớp chuẩn xác, kết hợp thủ công tinh xảo để mỗi sản phẩm là một câu chuyện riêng.
          </p>
        </div>

        {/* 4 Benefits Grid */}
        <Row gutter={[24, 24]}>
          {BENEFITS.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <div className="why-card">
                <div
                  className="why-icon-box"
                  style={{
                    color: item.accentColor,
                    background: `${item.accentColor}18`,
                    borderColor: `${item.accentColor}35`,
                  }}
                >
                  {item.icon}
                </div>

                <div className="why-badge-pill">{item.badge}</div>

                <h3 className="why-title">{item.title}</h3>
                <h4 className="why-subtitle">{item.subtitle}</h4>
                <p className="why-description">{item.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default WhyMemento3DSection;
