import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5radar from '@amcharts/amcharts5/radar';
import * as am5xy from '@amcharts/amcharts5/xy';
import { useAmChart } from '../../hooks/useAmChart';
import { getChartThemeTokens } from '../../utils/chartTheme';
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
    (root, isDark) => {
      const tokens = getChartThemeTokens(isDark);

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
        stroke: tokens.gridColor,
        strokeOpacity: tokens.gridOpacity,
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
        fill: tokens.trackColor,
        fillOpacity: 0.85,
      });

      // 5. Active Gauge Value Range (Primary Violet)
      const valueDataItem = xAxis.makeDataItem({
        value: 0,
        endValue: metrics.overallUtilization || 84,
      });

      xAxis.createAxisRange(valueDataItem);
      valueDataItem.get('axisFill')?.setAll({
        visible: true,
        fill: am5.color(0x7C5CFC),
        fillOpacity: 0.95,
      });

      // 6. Center Big Percentage Label
      chart.radarContainer.children.push(
        am5.Label.new(root, {
          centerX: am5.p50,
          centerY: am5.p100,
          textAlign: 'center',
          text: `[fontSize: 32px; fontWeight: 800; fill: ${tokens.textHex}]${metrics.overallUtilization || 84}%[/]\n[fontSize: 11px; fill: ${tokens.textSecondaryHex}; textTransform: uppercase; letterSpacing: 0.05em]Công suất máy in[/]`,
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
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Gauge size={20} color="var(--primary)" />
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
          Hiệu suất & Trạng thái Đội máy in 3D (Fleet Telemetry)
        </span>
      </div>

      <Row gutter={[24, 24]} align="middle">
        {/* Left: amCharts Gauge Meter */}
        <Col xs={24} md={10} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div ref={containerRef} style={{ width: '100%', height: '190px' }} />
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
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
                  background: 'var(--mint-subtle)',
                  border: '1px solid var(--mint)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tertiary)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <CheckCircle2 size={14} />
                  <span>TỶ LỆ IN THÀNH CÔNG</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--tertiary)', marginTop: 4 }}>
                  {metrics.successRate}%
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
                  Mục tiêu công nghiệp &gt; 97.5%
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <AlertOctagon size={14} />
                  <span>TỶ LỆ LỖI KẸT NHỰA</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--error)', marginTop: 4 }}>
                  {metrics.failureRate}%
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
                  Tự động dừng khi đứt sợi
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Clock size={14} />
                  <span>THỜI GIAN IN TB</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {Math.round(metrics.avgPrintMinutes / 60)}h {metrics.avgPrintMinutes % 60}p
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
                  Trên mỗi lệnh chế tác
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  background: 'var(--secondary-container)',
                  border: '1px solid var(--secondary)',
                  borderRadius: 12,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--secondary-active)', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Layers size={14} />
                  <span>VẬT LIỆU ĐÃ TIÊU HAO</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {formatGrams(metrics.totalGramsUsed)}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
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
