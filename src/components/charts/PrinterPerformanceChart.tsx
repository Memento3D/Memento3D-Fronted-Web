import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5radar from '@amcharts/amcharts5/radar';
import * as am5xy from '@amcharts/amcharts5/xy';
import { useAmChart } from '../../hooks/useAmChart';
import type { FleetMetrics } from '../../types/dashboard';
import { Card, Row, Col, Typography } from 'antd';
import { Gauge, CheckCircle2, Clock, AlertOctagon, Layers } from 'lucide-react';
import { formatGrams } from '../../utils/chartFormatter';

const { Text } = Typography;

export interface PrinterPerformanceChartProps {
  metrics: FleetMetrics;
  onlineCount: number;
  totalPrinters: number;
}

export const PrinterPerformanceChart: React.FC<PrinterPerformanceChartProps> = ({
  metrics,
  onlineCount,
  totalPrinters,
}) => {
  const { containerRef } = useAmChart(
    (root) => {
      // 1. Radar Chart as Gauge
      const chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          startAngle: 180,
          endAngle: 360,
          radius: am5.percent(95),
          innerRadius: am5.percent(65),
        })
      );

      // 2. Axis Renderer
      const axisRenderer = am5radar.AxisRendererCircular.new(root, {
        innerRadius: -10,
        strokeOpacity: 0.1,
      });

      axisRenderer.labels.template.set('visible', false);
      axisRenderer.ticks.template.set('visible', false);
      axisRenderer.grid.template.setAll({
        stroke: am5.color(0xffffff),
        strokeOpacity: 0.05,
      });

      // 3. X Axis (0 to 100)
      const xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 0,
          min: 0,
          max: 100,
          strictMinMax: true,
          renderer: axisRenderer,
        })
      );

      // 4. Background Track
      const axisDataItem = xAxis.makeDataItem({
        value: 0,
        endValue: 100,
      });

      xAxis.createAxisRange(axisDataItem);
      axisDataItem.get('axisFill')?.setAll({
        visible: true,
        fill: am5.color(0x1e293b),
        fillOpacity: 0.8,
      });

      // 5. Active Gauge Value Range (Cyan to Emerald gradient)
      const valueDataItem = xAxis.makeDataItem({
        value: 0,
        endValue: metrics.overallUtilization || 84,
      });

      xAxis.createAxisRange(valueDataItem);
      valueDataItem.get('axisFill')?.setAll({
        visible: true,
        fill: am5.color(0x0ea5e9),
        fillOpacity: 0.95,
      });

      // 6. Center Big Percentage Label
      chart.radarContainer.children.push(
        am5.Label.new(root, {
          centerX: am5.p50,
          centerY: am5.p100,
          textAlign: 'center',
          text: `[fontSize: 32px; fontWeight: 800; fill: #f8fafc]${metrics.overallUtilization || 84}%[/]\n[fontSize: 11px; fill: #94a3b8; textTransform: uppercase; letterSpacing: 0.05em]Công suất máy in[/]`,
        })
      );

      chart.appear(1000, 100);
    },
    [metrics.overallUtilization]
  );

  return (
    <Card
      bordered={false}
      style={{
        background: '#0d1322',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Gauge size={20} color="#0ea5e9" />
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
          Hiệu suất & Trạng thái Đội máy in 3D (Fleet Telemetry)
        </span>
      </div>

      <Row gutter={[24, 24]} align="middle">
        {/* Left: amCharts Gauge Meter */}
        <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div ref={containerRef} style={{ width: '100%', height: '190px' }} />
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              {onlineCount} / {totalPrinters} máy in đang hoạt động trực tuyến
            </Text>
          </div>
        </Col>

        {/* Right: Telemetry KPI Badges */}
        <Col xs={24} md={14}>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                  <CheckCircle2 size={14} />
                  <span>TỶ LỆ IN THÀNH CÔNG</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  {metrics.successRate}%
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                  Mục tiêu công nghiệp &gt; 97.5%
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>
                  <AlertOctagon size={14} />
                  <span>TỶ LỆ LỖI KẸT NHỰA</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f87171', marginTop: 4 }}>
                  {metrics.failureRate}%
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                  Tự động dừng khi đứt sợi
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Clock size={14} />
                  <span>THỜI GIAN IN TB</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                  {Math.round(metrics.avgPrintMinutes / 60)}h {metrics.avgPrintMinutes % 60}p
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                  Trên mỗi lệnh chế tác
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Layers size={14} />
                  <span>VẬT LIỆU ĐÃ TIÊU HAO</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                  {formatGrams(metrics.totalGramsUsed)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                  Đã kiểm kê hao hụt
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};
