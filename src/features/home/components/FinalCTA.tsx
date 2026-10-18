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
            <span>Preserve What Matters Most</span>
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
            Ready to Bring Your <span className="gradient-text-cyan">Memories to Life?</span>
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
            Upload your first photo today. Experience the feeling of holding a cherished moment in the palm of your hand.
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
              {isAuthenticated ? 'Open Your Workspace' : 'Start Creating Now'}
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
                Sign In to Account
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
              <span>Full 3D Pre-Print Inspection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Non-Toxic Eco Polymers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span>Protective Presentation Packaging</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
