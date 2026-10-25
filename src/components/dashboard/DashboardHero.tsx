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
        borderRadius: 'var(--radius-feature, 12px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 20,
      }}
    >
      <Row gutter={[20, 20]} align="middle" style={{ padding: '24px 28px', position: 'relative', zIndex: 1 }}>
        {/* Left: Titles & Operational Highlights */}
        <Col xs={24} lg={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--primary, #7C5CFC)',
                fontSize: '0.725rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              <Cpu size={14} />
              Giám sát Sản xuất
            </span>

            {isRealTimeConnected && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--success-bg, #C9E8D5)',
                  border: '1px solid var(--success-border, #A5D7B7)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  color: 'var(--text-on-success, #1E3B2C)',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                }}
              >
                <Radio size={12} color="var(--tertiary, #466253)" />
                Trực tuyến
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              lineHeight: 1.25,
            }}
          >
            Trung tâm Điều hành Sản xuất 3D
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              maxWidth: 600,
              margin: '0 0 20px',
              lineHeight: 1.5,
            }}
          >
            Giám sát trạng thái máy in 3D, tiến độ tác vụ tái tạo và quản lý vận hành xưởng in theo thời gian thực.
          </p>

          {/* Quick Telemetry Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Activity size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Tác vụ đang chạy
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {activeJobsCount} Tác vụ
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Printer size={18} color="var(--primary-system)" />
              <div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Máy in trực tuyến
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {onlinePrintersCount} Máy in
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                border: '1px solid var(--border-color, #E2D9F7)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle2 size={18} color="var(--tertiary)" />
              <div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Tỷ lệ thành công
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {successRate}% Tỷ lệ
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
                  height: 40,
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontWeight: 600,
                  padding: '0 18px',
                  boxShadow: 'none',
                }}
              >
                Xem mô hình 3D
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
              height: 260,
              background: 'var(--bg-viewport-3d, #F3EEFF)',
              border: '1px solid var(--border-color, #E2D9F7)',
              borderRadius: 'var(--radius-card, 10px)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            <DashboardScene />
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 12,
                fontSize: '0.675rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                pointerEvents: 'none',
                background: 'var(--surface-lowest, #FFFFFF)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm, 4px)',
                border: '1px solid var(--border-color)',
              }}
            >
              Mô phỏng 3D
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
