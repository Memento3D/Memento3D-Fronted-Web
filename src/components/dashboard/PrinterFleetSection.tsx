import React from 'react';
import { Card, Row, Col, Tag, Progress } from 'antd';
import { Printer } from 'lucide-react';
import type { PrinterFleetItem } from '../../types/dashboard';

export interface PrinterFleetSectionProps {
  printers: PrinterFleetItem[];
}

export const PrinterFleetSection: React.FC<PrinterFleetSectionProps> = ({ printers }) => {
  const getStatusBadge = (status: PrinterFleetItem['status']) => {
    switch (status) {
      case 'PRINTING':
        return (
          <Tag color="cyan" style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9' }} className="animate-pulse" />
            ĐANG IN 3D
          </Tag>
        );
      case 'PREPARING':
        return (
          <Tag color="purple" style={{ fontWeight: 700 }}>
            CHUẨN BỊ BÀN NHIỆT
          </Tag>
        );
      case 'IDLE':
        return (
          <Tag color="green" style={{ fontWeight: 700 }}>
            SẴN SÀNG (IDLE)
          </Tag>
        );
      case 'MAINTENANCE':
        return (
          <Tag color="orange" style={{ fontWeight: 700 }}>
            BẢO TRÌ ĐỊNH KỲ
          </Tag>
        );
      case 'ERROR':
        return (
          <Tag color="red" style={{ fontWeight: 700 }}>
            BÁO LỖI KẸT NHỰA
          </Tag>
        );
      case 'OFFLINE':
      default:
        return (
          <Tag color="default" style={{ fontWeight: 700 }}>
            OFFLINE
          </Tag>
        );
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={20} color="#0ea5e9" />
            <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.25rem' }}>
              Dây chuyền Chế tác In 3D (3D Printer Fleet)
            </span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>
            Giám sát trạng thái hoạt động máy in, nhiệt độ đầu đùn và tải trọng theo thời gian thực
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Tag color="cyan">
            {printers.filter((p) => p.status === 'PRINTING').length} Đang in
          </Tag>
          <Tag color="green">
            {printers.filter((p) => p.status === 'IDLE').length} Sẵn sàng
          </Tag>
          <Tag color="orange">
            {printers.filter((p) => p.status === 'MAINTENANCE').length} Bảo trì
          </Tag>
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
                  background: 'linear-gradient(145deg, #0d1322 0%, #0a0f1d 100%)',
                  borderRadius: 14,
                  border: isBusy
                    ? '1px solid rgba(14, 165, 233, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isBusy
                    ? '0 6px 20px rgba(14, 165, 233, 0.12)'
                    : '0 4px 16px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: '18px' } }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                      {printer.name}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {printer.model}
                    </div>
                  </div>
                  {getStatusBadge(printer.status)}
                </div>

                {/* Utilization Progress Bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8' }}>Công suất hoạt động</span>
                    <span style={{ color: isBusy ? '#38bdf8' : '#94a3b8', fontWeight: 700 }}>
                      {printer.utilizationRate}%
                    </span>
                  </div>
                  <Progress
                    percent={printer.utilizationRate}
                    showInfo={false}
                    strokeColor={isBusy ? { '0%': '#0ea5e9', '100%': '#8b5cf6' } : '#64748b'}
                    trailColor="rgba(255, 255, 255, 0.06)"
                    size={['100%', 6]}
                  />
                </div>

                {/* Telemetry details */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 12,
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#64748b' }}>Lệnh hôm nay</div>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{printer.jobsToday} lệnh</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Tỷ lệ thành công</div>
                    <div style={{ color: '#10b981', fontWeight: 700 }}>{printer.successRate}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Vật liệu nạp</div>
                    <div style={{ color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {printer.currentMaterial || 'PLA+'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>Nhiệt độ đùn / bàn</div>
                    <div style={{ color: isBusy ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>
                      {printer.nozzleTemp}°C / {printer.bedTemp}°C
                    </div>
                  </div>
                </div>

                {/* Current Active Job or Idle status */}
                <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Trạng thái:</span>
                  {printer.currentJobNumber ? (
                    <span style={{ color: '#0ea5e9', fontWeight: 700 }}>
                      Job #{printer.currentJobNumber}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>
                      {printer.status === 'OFFLINE' ? 'Mất tín hiệu OctoPrint' : 'Sẵn sàng nhận lệnh'}
                    </span>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
