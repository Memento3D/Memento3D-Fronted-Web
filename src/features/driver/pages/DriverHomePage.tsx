import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag } from 'antd';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import '../../../components/home/actorHome.css';

export const DriverHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="actor-home-container" id="driver-home-page">
        {/* 1. Hero Greeting */}
        <HomeGreeting
          user={user}
          subtitle="Chúc bạn có một hành trình an toàn hôm nay. Đảm bảo kiện hàng kỷ vật 3D được bao gói cẩn thận, đúng tuyến và giao tận tay khách hàng với nụ cười thân thiện."
          badgeLabel="Tài xế Vận chuyển"
          badgeColor="green"
        />

        {/* 2. Motivational Driver Safety Quote */}
        <QuoteCard role="DRIVER" />

        {/* 3. Primary Highlight: CHUYẾN GIAO TIẾP THEO */}
        <div className="next-task-card" style={{ borderColor: 'rgba(16, 185, 129, 0.35)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)' }}>
          <div className="next-task-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="next-task-badge" style={{ background: '#10b981' }}>
                  <Navigation size={12} style={{ fill: '#fff' }} />
                  CHUYẾN GIAO TIẾP THEO
                </span>
                <Tag color="cyan" style={{ margin: 0, fontWeight: 700 }}>
                  EXP-88842-VN &bull; HỎA TỐC
                </Tag>
              </div>
              <h2 style={{ margin: '8px 0 2px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Nguyễn Minh Khang &bull; 0912-345-678
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MapPin size={14} color="#10b981" />
                <span>Số 182 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/driver/deliveries')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: 'transparent',
                fontWeight: 700,
                height: 44,
                padding: '0 24px',
                borderRadius: 10,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              Xem chuyến tiếp theo
            </Button>
          </div>

          <div className="next-task-details-grid">
            <div className="next-task-detail-item">
              <span className="next-task-detail-label">Loại kỷ vật</span>
              <span className="next-task-detail-value">Mô hình chân dung pha lê 3D</span>
            </div>
            <div className="next-task-detail-item">
              <span className="next-task-detail-label">Trọng lượng</span>
              <span className="next-task-detail-value">350g (Đóng hộp chống sốc)</span>
            </div>
            <div className="next-task-detail-item">
              <span className="next-task-detail-label">Thanh toán</span>
              <span className="next-task-detail-value" style={{ color: '#10b981' }}>ĐÃ THANH TOÁN (PREPAID)</span>
            </div>
            <div className="next-task-detail-item">
              <span className="next-task-detail-label">Hạn giao dự kiến</span>
              <span className="next-task-detail-value">Trước 16:30 chiều nay</span>
            </div>
          </div>
        </div>

        {/* 4. Summary Stats */}
        <div className="stat-cards-grid">
          <HomeStatCard
            label="Chuyến hôm nay"
            value="4"
            subtext="Tuyến nội thành hỏa tốc"
            icon={<Truck size={18} />}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#10b981"
            onClick={() => navigate('/driver/deliveries')}
          />
          <HomeStatCard
            label="Đang vận chuyển"
            value="1"
            subtext="Kiện hàng đang trên xe"
            icon={<Navigation size={18} />}
            iconBg="rgba(14, 165, 233, 0.15)"
            iconColor="#0ea5e9"
            onClick={() => navigate('/driver/deliveries')}
          />
          <HomeStatCard
            label="Chuyến hoàn thành"
            value="1"
            subtext="Đã ký nhận thành công"
            icon={<CheckCircle2 size={18} />}
            iconBg="rgba(139, 92, 246, 0.15)"
            iconColor="#8b5cf6"
            onClick={() => navigate('/driver/deliveries')}
          />
          <HomeStatCard
            label="Khoảng cách dự kiến"
            value="24.8 km"
            subtext="Lộ trình tối ưu Google Maps"
            icon={<Clock size={18} />}
            iconBg="rgba(245, 158, 11, 0.15)"
            iconColor="#f59e0b"
            onClick={() => navigate('/driver/deliveries')}
          />
        </div>

        {/* 5. Quick Actions */}
        <div className="quick-actions-section">
          <h3 className="section-title">
            <span>Nghiệp vụ tài xế</span>
          </h3>
          <div className="quick-actions-grid">
            <QuickActionCard
              title="Danh sách chuyến giao vận"
              description="Theo dõi toàn bộ đơn hàng trong ca"
              icon={<Truck size={20} />}
              iconBg="rgba(16, 185, 129, 0.15)"
              iconColor="#10b981"
              onClick={() => navigate('/driver/deliveries')}
            />
            <QuickActionCard
              title="Lấy hàng tại kho"
              description="Quét mã QR kiện hàng tại kho WMS"
              icon={<Package size={20} />}
              iconBg="rgba(14, 165, 233, 0.15)"
              iconColor="#0ea5e9"
              onClick={() => navigate('/driver/deliveries')}
            />
            <QuickActionCard
              title="Xác nhận giao thành công"
              description="Chụp ảnh biên nhận và xác nhận mã OTP"
              icon={<ShieldCheck size={20} />}
              iconBg="rgba(139, 92, 246, 0.15)"
              iconColor="#8b5cf6"
              onClick={() => navigate('/driver/deliveries')}
            />
          </div>
        </div>
    </div>
  );
};

export default DriverHomePage;
