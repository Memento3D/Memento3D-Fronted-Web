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
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-color, #E2D9F7)',
        borderRadius: 'var(--radius-feature, 28px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-floating)',
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
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(255, 191, 174, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Row gutter={[24, 24]} align="middle" style={{ padding: '32px 36px', position: 'relative', zIndex: 1 }}>
        {/* Left: Titles & Operational Highlights */}
        <Col xs={24} lg={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '5px 14px',
                borderRadius: 'var(--radius-full, 9999px)',
                color: 'var(--primary, #7C5CFC)',
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
                  background: 'var(--success-bg, #C9E8D5)',
                  border: '1px solid var(--success-border, #A5D7B7)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  color: 'var(--text-on-success, #1E3B2C)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                <Radio size={12} className="animate-pulse" color="var(--tertiary, #466253)" />
                TELEMETRY LIVE
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              margin: '0 0 10px',
              lineHeight: 1.2,
            }}
          >
            Digital Manufacturing Control Center
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
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
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-default, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Activity size={20} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tác vụ đang chạy
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {activeJobsCount} Active Jobs
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-default, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Printer size={20} color="var(--primary-system)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Máy in trực tuyến
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {onlinePrintersCount} Printers Online
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '10px 18px',
                borderRadius: 'var(--radius-default, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <CheckCircle2 size={20} color="var(--tertiary)" />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Tỷ lệ in thành công
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--tertiary)', fontFamily: 'var(--font-mono)' }}>
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
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  padding: '0 24px',
                  boxShadow: '0 4px 14px var(--primary-glow)',
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
              maxWidth: 400,
              height: 290,
              background: 'var(--bg-viewport-3d, #F3EEFF)',
              border: '1px solid var(--border-color, #E2D9F7)',
              borderRadius: 'var(--radius-card, 24px)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
            }}
          >
            <DashboardScene />
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 14,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.06em',
                pointerEvents: 'none',
                background: 'var(--surface-lowest, #FFFFFF)',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
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
