import React from 'react';
import { Button } from 'antd';
import {
  ArrowRightOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getDefaultRouteForRole } from '../../auth/utils/resolveActorRoute';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handlePrimaryCTA = () => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role));
    } else {
      navigate('/login');
    }
  };

  const handleSecondaryCTA = () => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role));
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="home-section" style={{ position: 'relative', paddingBottom: 120 }}>
      <div className="home-container">
        <div
          className="home-glass-card"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.95) 75%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2)',
            borderRadius: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            <StarOutlined />
            <span>Lưu giữ Những điều Quý giá nhất</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              marginBottom: 18,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Sẵn sàng Hiện thực hóa <span className="gradient-text-cyan">Kỷ niệm của Bạn?</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 580,
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 36,
            }}
          >
            Tải lên bức ảnh đầu tiên ngay hôm nay. Trải nghiệm cảm giác nâng niu khoảnh khắc quý giá trong lòng bàn tay bạn.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={handlePrimaryCTA}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '1.05rem',
                height: 52,
                padding: '0 32px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.45)',
              }}
            >
              {isAuthenticated ? 'Mở Không gian làm việc' : 'Bắt đầu Tạo kỷ vật'}
            </Button>

            {!isAuthenticated && (
              <Button
                size="large"
                onClick={handleSecondaryCTA}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  height: 52,
                  padding: '0 28px',
                }}
              >
                Đăng nhập tài khoản
              </Button>
            )}
          </div>

          {/* Guarantee Highlights */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 24,
              fontSize: '0.85rem',
              color: '#cbd5e1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Kiểm tra 3D Toàn diện trước khi in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Vật liệu Sinh học Không độc hại</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Đóng gói Hộp quà Bảo vệ Cao cấp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FinalCTA;
