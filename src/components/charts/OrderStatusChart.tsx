import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import { useAmChart } from '../../hooks/useAmChart';
import { getChartThemeTokens } from '../../utils/chartTheme';
import type { OrderStatusDataPoint } from '../../types/dashboard';
import { Card, Spin, Alert, Empty } from 'antd';
import { PieChart as PieIcon } from 'lucide-react';

export interface OrderStatusChartProps {
  data: OrderStatusDataPoint[];
  totalOrders: number;
  isLoading?: boolean;
  error?: Error | null;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  data,
  totalOrders,
  isLoading,
  error,
}) => {
  const { containerRef } = useAmChart(
    (root, isDark) => {
      if (!data || data.length === 0) return;
      const tokens = getChartThemeTokens(isDark);

      // 1. Create Pie Chart
      const chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          innerRadius: am5.percent(68),
          layout: root.verticalLayout,
        })
      );

      // 2. Series
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: 'count',
          categoryField: 'statusLabel',
          alignLabels: false,
        })
      );

      series.labels.template.set('visible', false);
      series.ticks.template.set('visible', false);

      // Custom slice colors & hover effects
      series.slices.template.setAll({
        templateField: 'sliceSettings',
        stroke: tokens.sliceStroke,
        strokeWidth: 2,
        cornerRadius: 4,
        tooltipText: '[bold]{category}:[/] {value} đơn ({valuePercentTotal.formatNumber("0.0")}%)',
      });

      series.slices.template.states.create('hover', {
        scale: 1.05,
      });

      // 3. Center Text Label in the donut hole
      chart.seriesContainer.children.push(
        am5.Label.new(root, {
          textAlign: 'center',
          centerY: am5.p50,
          centerX: am5.p50,
          text: `[fontSize: 28px; fontWeight: 800; fill: ${tokens.textHex}]${totalOrders}[/]\n[fontSize: 11px; fill: ${tokens.textSecondaryHex}; letterSpacing: 0.05em; textTransform: uppercase]Tổng đơn hàng[/]`,
        })
      );

      // 4. Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 14,
        })
      );

      legend.labels.template.setAll({
        fill: tokens.textSecondary,
        fontSize: 11,
      });

      legend.valueLabels.template.setAll({
        fill: tokens.textColor,
        fontSize: 11,
        fontWeight: 'bold',
      });

      legend.data.setAll(series.dataItems);

      // Map color settings
      const chartData = data.map((d) => ({
        ...d,
        sliceSettings: {
          fill: am5.color(d.color ? parseInt(d.color.replace('#', '0x'), 16) : 0x0ea5e9),
        },
      }));

      series.data.setAll(chartData);
      series.appear(1000, 100);
      chart.appear(1000, 100);
    },
    [data, totalOrders]
  );

  return (
    <Card
      bordered={false}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        height: '100%',
      }}
      styles={{
        body: { padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' },
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PieIcon size={18} color="var(--primary)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
            Phân bổ Trạng thái Đơn hàng
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
          Tiến độ quy trình từ xác nhận, in 3D đến giao nhận thành công
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 320, position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <Spin tip="Đang tính toán phân bổ trạng thái..." />
          </div>
        )}

        {error && (
          <Alert
            type="error"
            message="Không thể tải trạng thái đơn hàng"
            description={error.message}
            showIcon
          />
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Empty description="Chưa có dữ liệu đơn hàng" />
          </div>
        )}

        <div ref={containerRef} style={{ width: '100%', height: '320px' }} />
      </div>
    </Card>
  );
};
