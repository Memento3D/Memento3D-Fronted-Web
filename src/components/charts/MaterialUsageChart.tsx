import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import { useAmChart } from '../../hooks/useAmChart';
import { getChartThemeTokens } from '../../utils/chartTheme';
import type { MaterialUsageDataPoint } from '../../types/dashboard';
import { formatVndCurrency, formatGrams } from '../../utils/chartFormatter';
import { Card, Spin, Alert, Empty } from 'antd';
import { Box } from 'lucide-react';

export interface MaterialUsageChartProps {
  data: MaterialUsageDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
}

export const MaterialUsageChart: React.FC<MaterialUsageChartProps> = ({
  data,
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
          innerRadius: am5.percent(55),
          layout: root.verticalLayout,
        })
      );

      // 2. Series
      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: 'usageGram',
          categoryField: 'material',
          alignLabels: false,
        })
      );

      series.labels.template.set('visible', false);
      series.ticks.template.set('visible', false);

      series.slices.template.setAll({
        templateField: 'sliceSettings',
        stroke: tokens.sliceStroke,
        strokeWidth: 2,
        cornerRadius: 6,
        tooltipText:
          '[bold]{category} ({materialType})[/]\nTiêu hao: [bold]{value}g[/] ({percentage}%)\nChi phí: [bold]{costFormatted}[/]',
      });

      series.slices.template.states.create('hover', {
        scale: 1.05,
      });

      // 3. Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 12,
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

      // Enrich with formatted fields
      const chartData = data.map((d) => ({
        ...d,
        costFormatted: formatVndCurrency(d.costVnd),
        sliceSettings: {
          fill: am5.color(d.color ? parseInt(d.color.replace('#', '0x'), 16) : 0x0ea5e9),
        },
      }));

      series.data.setAll(chartData);
      series.appear(1000, 100);
      chart.appear(1000, 100);
    },
    [data]
  );

  const totalGrams = data.reduce((acc, curr) => acc + curr.usageGram, 0);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box size={18} color="var(--tertiary)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
              Tiêu thụ Vật liệu In 3D
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
            Sản lượng nhựa đùn (FDM) và mực quang hóa (SLA/DLP)
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Tổng tiêu thụ</div>
          <div style={{ color: 'var(--tertiary)', fontWeight: 800, fontSize: '1.1rem' }}>
            {formatGrams(totalGrams)}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 300, position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <Spin tip="Đang tải dữ liệu vật liệu..." />
          </div>
        )}

        {error && (
          <Alert
            type="error"
            message="Không thể tải phân tích vật liệu"
            description={error.message}
            showIcon
          />
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Empty description="Chưa có dữ liệu tiêu hao vật liệu" />
          </div>
        )}

        <div ref={containerRef} style={{ width: '100%', height: '300px' }} />
      </div>
    </Card>
  );
};
