import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { useAmChart } from '../../hooks/useAmChart';
import type { ReconstructionTierDataPoint } from '../../types/dashboard';
import { Card, Spin, Alert, Empty } from 'antd';
import { Cpu } from 'lucide-react';

export interface ReconstructionChartProps {
  data: ReconstructionTierDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
}

export const ReconstructionChart: React.FC<ReconstructionChartProps> = ({
  data,
  isLoading,
  error,
}) => {
  const { containerRef } = useAmChart(
    (root) => {
      if (!data || data.length === 0) return;

      // 1. Create XY Chart (Horizontal Stacked Bar)
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          layout: root.verticalLayout,
        })
      );

      // 2. Y Axis: Category Axis (Statuses)
      const yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'statusLabel',
          renderer: am5xy.AxisRendererY.new(root, {
            inversed: true,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
          }),
        })
      );

      yAxis.get('renderer').labels.template.setAll({
        fill: am5.color(0xf8fafc),
        fontSize: 12,
        fontWeight: '600',
      });
      yAxis.get('renderer').grid.template.set('visible', false);

      // 3. X Axis: Value Axis (Job Count)
      const xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererX.new(root, {
            strokeOpacity: 0.1,
          }),
        })
      );

      xAxis.get('renderer').labels.template.setAll({
        fill: am5.color(0x94a3b8),
        fontSize: 11,
      });

      xAxis.get('renderer').grid.template.setAll({
        stroke: am5.color(0xffffff),
        strokeOpacity: 0.05,
      });

      // 4. Series 1: PREVIEW Tier
      const previewSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Bản dựng sơ bộ (PREVIEW)',
          xAxis,
          yAxis,
          valueXField: 'preview',
          categoryYField: 'statusLabel',
          stacked: true,
          fill: am5.color(0x0ea5e9),
          stroke: am5.color(0x0ea5e9),
          tooltip: am5.Tooltip.new(root, {
            labelText: '[bold]PREVIEW:[/] {valueX} jobs',
          }),
        })
      );

      previewSeries.columns.template.setAll({
        cornerRadiusTR: 4,
        cornerRadiusBR: 4,
        height: am5.percent(60),
      });

      // 5. Series 2: HIGH_QUALITY Tier
      const hqSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Chất lượng cao 4K (HIGH_QUALITY)',
          xAxis,
          yAxis,
          valueXField: 'highQuality',
          categoryYField: 'statusLabel',
          stacked: true,
          fill: am5.color(0x8b5cf6),
          stroke: am5.color(0x8b5cf6),
          tooltip: am5.Tooltip.new(root, {
            labelText: '[bold]HIGH_QUALITY:[/] {valueX} jobs\n[bold]Tổng trạng thái:[/] {total}',
          }),
        })
      );

      hqSeries.columns.template.setAll({
        cornerRadiusTR: 4,
        cornerRadiusBR: 4,
        height: am5.percent(60),
      });

      // 6. Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 12,
        })
      );

      legend.labels.template.setAll({
        fill: am5.color(0x94a3b8),
        fontSize: 11,
      });

      legend.data.setAll(chart.series.values);

      // Feed data
      yAxis.data.setAll(data);
      previewSeries.data.setAll(data);
      hqSeries.data.setAll(data);

      previewSeries.appear(1000);
      hqSeries.appear(1000);
      chart.appear(1000, 100);
    },
    [data]
  );

  return (
    <Card
      bordered={false}
      style={{
        background: '#0d1322',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        height: '100%',
      }}
      styles={{
        body: { padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' },
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={18} color="#a855f7" />
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
            Tiến độ Tái tạo 3D & Cụm GPU
          </span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
          Phân bố tác vụ giữa gói Xem trước miễn phí & Bản dựng 4K công nghiệp
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 300, position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 19, 34, 0.7)', zIndex: 10 }}>
            <Spin tip="Đang tải dữ liệu cụm GPU..." />
          </div>
        )}

        {error && (
          <Alert
            type="error"
            message="Không thể tải tác vụ tái tạo 3D"
            description={error.message}
            showIcon
          />
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Empty description="Không có tác vụ tái tạo nào" />
          </div>
        )}

        <div ref={containerRef} style={{ width: '100%', height: '300px' }} />
      </div>
    </Card>
  );
};
