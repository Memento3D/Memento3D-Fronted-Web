import React from 'react';
import { Row, Col, Button } from 'antd';
import { DashboardScene } from '../three/DashboardScene';
import { Cpu, Activity, Printer, CheckCircle2, Eye, Radio } from 'lucide-react';

export interface DashboardHeroProps {
  activeJobsCount: number;
  onlinePrintersCount: number;
  successRate: number;
  isRealTimeConnected?: boolean;
  onOpen3DViewer?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  activeJobsCount,
  onlinePrintersCount,
  successRate,
  isRealTimeConnected = true,
  onOpen3DViewer,
}) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.95) 0%, rgba(8, 12, 20, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: 24,
      }}
    >
      {/* Decorative ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '350px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '25%',
          width: '300px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Row gutter={[24, 24]} align="middle" style={{ padding: '28px 32px', position: 'relative', zIndex: 1 }}>
        {/* Left: Titles & Operational Highlights */}
        <Col xs={24} lg={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                padding: '4px 12px',
                borderRadius: 20,
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <Cpu size={14} />
              MEMENTO3D PRODUCTION OVERVIEW
            </span>

            {isRealTimeConnected && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  color: '#10b981',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <Radio size={12} className="animate-pulse" />
                TELEMETRY LIVE
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.03em',
              margin: '0 0 8px',
              lineHeight: 1.2,
            }}
          >
            Digital Manufacturing Control Center
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.925rem',
              maxWidth: 620,
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            Hệ thống giám sát đa tầng tích hợp dây chuyền máy in 3D công nghiệp, cụm xử lý GPU
            tái tạo ảnh chụp Gaussian Splatting và quản trị lưu chuyển tồn kho thời gian thực.
          </p>

          {/* Quick Telemetry Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Activity size={18} color="#0ea5e9" />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tác vụ đang chạy
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {activeJobsCount} Active Jobs
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Printer size={18} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Máy in trực tuyến
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {onlinePrintersCount} Printers Online
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 16px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle2 size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tỷ lệ in thành công
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                  {successRate}% Success Rate
                </div>
              </div>
            </div>

            {onOpen3DViewer && (
              <Button
                type="primary"
                icon={<Eye size={15} />}
                onClick={onOpen3DViewer}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                  borderColor: 'transparent',
                  height: 44,
                  borderRadius: 10,
                  fontWeight: 700,
                  padding: '0 18px',
                  boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
                }}
              >
                Mở 3D Studio Preview
              </Button>
            )}
          </div>
        </Col>

        {/* Right: Interactive 3D Digital Twin Canvas */}
        <Col xs={24} lg={10} style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 380,
              height: 280,
              background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.6) 0%, rgba(8, 12, 20, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: 'inset 0 0 30px rgba(14, 165, 233, 0.1)',
              position: 'relative',
            }}
          >
            <DashboardScene />
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 12,
                fontSize: '0.65rem',
                color: '#64748b',
                letterSpacing: '0.04em',
                pointerEvents: 'none',
              }}
            >
              3D DIGITAL TWIN • THREE.JS
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
