import React from 'react';
import { Tag } from 'antd';
import {
  RocketOutlined,
  MobileOutlined,
  HeartOutlined,
  ToolOutlined,
  SafetyOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';

export const BenefitsSection: React.FC = () => {
  return (
    <section id="benefits" className="home-section" style={{ position: 'relative' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-badge">
            <DeploymentUnitOutlined />
            <span>Tại sao chọn Memento3D</span>
          </div>
          <h2 className="section-title">
            Kiến tạo cho <span className="gradient-text-indigo">Giá trị Cảm xúc Bền vững</span>
          </h2>
          <p className="section-subtitle">
            Chúng tôi kết hợp công nghệ tái tạo AI 3D tiên tiến với quy trình in đắp lớp chính xác để tạo ra những kỷ vật mà bức ảnh 2D thông thường không thể lưu giữ trọn vẹn.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          {/* Card 1: Large Bento Feature (Span 8) */}
          <div
            className="home-glass-card bento-col-8"
            style={{
              padding: 36,
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 320,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <RocketOutlined style={{ fontSize: 26, color: '#818cf8' }} />
              </div>

              <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Thị giác Máy tính Neural
              </Tag>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: 12, lineHeight: 1.25 }}>
                Quy trình Tái tạo Mô hình 3D tự động bằng AI
              </h3>

              <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 640 }}>
                Điêu khắc 3D truyền thống đòi hỏi hàng trăm giờ tạo hình thủ công bởi họa sĩ 3D. Memento3D tự động hóa việc ước lượng thể tích và lưới đa giác, tạo ra file 3D khép kín sẵn sàng in trực tiếp từ những bức ảnh chụp đa góc.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                paddingTop: 24,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginTop: 20,
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Hình học</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Lưới khép kín 100%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Xử lý</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>GPU Đám mây tốc độ cao</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Dựng CAD thủ công</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>0 Giờ thao tác</div>
              </div>
            </div>
          </div>

          {/* Card 2: Mobile Photo Simplicity (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 320,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <MobileOutlined style={{ fontSize: 26, color: '#06b6d4' }} />
              </div>

              <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Tải ảnh dễ dàng
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Mọi bức ảnh từ Điện thoại
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Bạn không cần máy quét LiDAR hay camera 3D đắt tiền. Chỉ cần tải lên những bức ảnh chân dung, ảnh đời thường hoặc thú cưng ngay từ thư viện điện thoại của bạn.
              </p>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
              Hỗ trợ iOS, Android và máy tính
            </div>
          </div>

          {/* Card 3: Personalized Keepsakes & Engraving (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <HeartOutlined style={{ fontSize: 26, color: '#f43f5e' }} />
              </div>

              <Tag color="magenta" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Cá nhân hóa
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Vật phẩm Lưu niệm Giàu cảm xúc
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Khắc laser tên, ngày kỷ niệm hoặc tọa độ ý nghĩa lên đế trưng bày gỗ Walnut hoặc đá tự nhiên sang trọng.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600 }}>
              Cá nhân hóa riêng biệt theo từng đơn hàng
            </div>
          </div>

          {/* Card 4: Precision 3D Print Farm (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <ToolOutlined style={{ fontSize: 26, color: '#10b981' }} />
              </div>

              <Tag color="green" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Xưởng in Công nghiệp
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Hệ thống Máy in Hiệu chuẩn Cao
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Vận hành qua hệ thống điều phối thông minh và buồng sấy kiểm soát độ ẩm khắt khe. Mỗi tác phẩm đều trải qua khâu kiểm tra chất lượng (QC) quang học trước khi xuất xưởng.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
              Nhựa quang hóa SLA & Vật liệu sinh học FDM
            </div>
          </div>

          {/* Card 5: Heirloom Durability (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <SafetyOutlined style={{ fontSize: 26, color: '#eab308' }} />
              </div>

              <Tag color="gold" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Chuẩn Lưu trữ Lâu dài
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Độ bền Vật liệu Vượt thời gian
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Được xử lý lớp phủ kháng tia UV và sáp bảo vệ không độc hại để chống ố vàng, bạc màu hay suy giảm chất lượng qua nhiều thập kỷ.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#eab308', fontWeight: 600 }}>
              Phủ bảo vệ kháng tia UV & chịu lực va đập
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BenefitsSection;
