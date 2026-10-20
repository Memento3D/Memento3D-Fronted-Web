import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  CheckCircle2,
  TrendingUp,
  Truck,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { HomeGreeting } from '../../../components/home/HomeGreeting';
import { QuoteCard } from '../../../components/home/QuoteCard';
import { HomeStatCard } from '../../../components/home/HomeStatCard';
import { QuickActionCard } from '../../../components/home/QuickActionCard';
import '../../../components/home/actorHome.css';

export const ProviderHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="actor-home-container" id="provider-home-page">
        {/* 1. Hero Greeting */}
        <HomeGreeting
          user={user}
          subtitle="Hãy cùng hoàn thành những đơn hàng gia công tuyệt vời hôm nay. Duy trì độ chính xác cao nhất, tuân thủ tiêu chuẩn kỹ thuật và bàn giao đúng hạn cam kết."
          badgeLabel="Đối tác Sản xuất B2B"
          badgeColor="geekblue"
        />

        {/* 2. Motivational B2B Quote */}
        <QuoteCard role="PROVIDER" />

        {/* 3. Summary Stats */}
        <div className="stat-cards-grid">
          <HomeStatCard
            label="Đơn mới cần tiếp nhận"
            value="3"
            subtext="Chờ xưởng xác nhận hợp đồng"
            icon={<Package size={18} />}
            iconBg="rgba(245, 158, 11, 0.15)"
            iconColor="#f59e0b"
            onClick={() => navigate('/provider/orders')}
          />
          <HomeStatCard
            label="Đơn đang gia công"
            value="2"
            subtext="Đang in 3D & xử lý hậu kỳ"
            icon={<Layers size={18} />}
            iconBg="rgba(14, 165, 233, 0.15)"
            iconColor="#0ea5e9"
            onClick={() => navigate('/provider/orders')}
          />
          <HomeStatCard
            label="QC Đạt & Chờ bàn giao"
            value="1"
            subtext="Sẵn sàng cho tài xế nhận"
            icon={<CheckCircle2 size={18} />}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#10b981"
            onClick={() => navigate('/provider/orders')}
          />
          <HomeStatCard
            label="Doanh thu dự kiến"
            value="18.5M đ"
            subtext="Các đơn trong kỳ quyết toán"
            icon={<TrendingUp size={18} />}
            iconBg="rgba(139, 92, 246, 0.15)"
            iconColor="#8b5cf6"
            onClick={() => navigate('/provider/orders')}
          />
        </div>

        {/* 4. Quick Actions */}
        <div className="quick-actions-section">
          <h3 className="section-title">
            <span>Nghiệp vụ đối tác gia công</span>
          </h3>
          <div className="quick-actions-grid">
            <QuickActionCard
              title="Xem danh sách đơn gia công"
              description="Theo dõi toàn bộ đơn hàng hợp đồng"
              icon={<Package size={20} />}
              iconBg="rgba(59, 130, 246, 0.15)"
              iconColor="#3b82f6"
              onClick={() => navigate('/provider/orders')}
            />
            <QuickActionCard
              title="Tiếp nhận đơn mới"
              description="Xác nhận file STL và nhận vật liệu"
              icon={<Flame size={20} />}
              iconBg="rgba(245, 158, 11, 0.15)"
              iconColor="#f59e0b"
              badge="Mới"
              onClick={() => navigate('/provider/orders')}
            />
            <QuickActionCard
              title="Cập nhật tiến độ QC"
              description="Báo cáo kiểm tra chất lượng sản phẩm"
              icon={<CheckCircle2 size={20} />}
              iconBg="rgba(16, 185, 129, 0.15)"
              iconColor="#10b981"
              onClick={() => navigate('/provider/orders')}
            />
            <QuickActionCard
              title="Bàn giao tài xế vận chuyển"
              description="Ký xác nhận bàn giao hàng hỏa tốc"
              icon={<Truck size={20} />}
              iconBg="rgba(139, 92, 246, 0.15)"
              iconColor="#8b5cf6"
              onClick={() => navigate('/provider/orders')}
            />
          </div>
        </div>
    </div>
  );
};

export default ProviderHomePage;
