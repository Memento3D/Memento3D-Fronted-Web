import React from 'react';
import { Card, Row, Col, Progress } from 'antd';
import { Printer } from 'lucide-react';
import type { PrinterFleetItem } from '../../types/dashboard';
import { StatusBadge } from '../common/StatusBadge';

export interface PrinterFleetSectionProps {
  printers: PrinterFleetItem[];
}

export const PrinterFleetSection: React.FC<PrinterFleetSectionProps> = ({ printers }) => {
  const getStatusBadge = (status: PrinterFleetItem['status']) => {
    switch (status) {
      case 'PRINTING':
        return <StatusBadge status="PRINTING" label="Đang in 3D" variant="lavender" />;
      case 'PREPARING':
        return <StatusBadge status="PREPARING" label="Chuẩn bị bàn nhiệt" variant="peach" />;
      case 'IDLE':
        return <StatusBadge status="IDLE" label="Sẵn sàng" variant="mint" />;
      case 'MAINTENANCE':
        return <StatusBadge status="MAINTENANCE" label="Bảo trì định kỳ" variant="peach" />;
      case 'ERROR':
        return <StatusBadge status="ERROR" label="Báo lỗi kẹt nhựa" variant="error" />;
      case 'OFFLINE':
      default:
        return <StatusBadge status="OFFLINE" label="Offline" variant="neutral" />;
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={20} color="var(--primary)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem' }}>
              Dây chuyền Chế tác In 3D (3D Printer Fleet)
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
            Giám sát trạng thái hoạt động máy in, nhiệt độ đầu đùn và tải trọng theo thời gian thực
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status="PRINTING" label={`${printers.filter((p) => p.status === 'PRINTING').length} Đang in`} variant="lavender" />
          <StatusBadge status="IDLE" label={`${printers.filter((p) => p.status === 'IDLE').length} Sẵn sàng`} variant="mint" />
          <StatusBadge status="MAINTENANCE" label={`${printers.filter((p) => p.status === 'MAINTENANCE').length} Bảo trì`} variant="peach" />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {printers.map((printer) => {
          const isBusy = printer.status === 'PRINTING' || printer.status === 'PREPARING';

          return (
            <Col xs={24} sm={12} lg={6} key={printer.id}>
              <Card
                bordered={false}
                style={{
                  background: 'var(--bg-card, #FFFFFF)',
                  borderRadius: 'var(--radius-card, 10px)',
                  border: isBusy
                    ? '1.5px solid var(--primary, #7C5CFC)'
                    : '1px solid var(--border-color, #E2D9F7)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.2s ease',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: '20px' } }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {printer.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
                      {printer.model}
                    </div>
                  </div>
                  {getStatusBadge(printer.status)}
                </div>

                {/* Utilization Progress Bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Công suất hoạt động</span>
                    <span style={{ color: isBusy ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                      {printer.utilizationRate}%
                    </span>
                  </div>
                  <Progress
                    percent={printer.utilizationRate}
                    showInfo={false}
                    strokeColor={isBusy ? 'var(--primary)' : 'var(--border-color)'}
                    trailColor="var(--surface-container, #F1EBFF)"
                    size={['100%', 8]}
                  />
                </div>

                {/* Telemetry details */}
                <div
                  style={{
                    background: 'var(--surface-container, #F1EBFF)',
                    borderRadius: 'var(--radius-sm, 8px)',
                    padding: '12px 14px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Nhiệt độ đùn
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {printer.nozzleTemp ? `${printer.nozzleTemp}°C` : '--'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Vật tư nạp
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {printer.currentMaterial || 'Chưa nạp'}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
