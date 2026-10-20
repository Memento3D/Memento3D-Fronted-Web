import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getStatusLabel } from '../../../../locales/i18n';
import type { AdminOrderStats } from '../../types/admin.types';

interface OrderStatusDonutChartProps {
  stats?: AdminOrderStats;
}

export const OrderStatusDonutChart: React.FC<OrderStatusDonutChartProps> = ({ stats }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const chartData = [
    { status: 'PENDING', label: getStatusLabel('PENDING'), count: stats?.pending || 0 },
    { status: 'PROCESSING', label: getStatusLabel('PROCESSING'), count: stats?.processing || 0 },
    { status: 'PRINTING', label: getStatusLabel('PRINTING'), count: stats?.printing || 0 },
    { status: 'COMPLETED', label: getStatusLabel('COMPLETED'), count: stats?.completed || 0 },
    { status: 'CANCELLED', label: getStatusLabel('CANCELLED'), count: stats?.cancelled || 0 },
  ].filter((d) => d.count > 0);

  useLayoutEffect(() => {
    if (!chartRef.current) return;
    if (chartData.length === 0) return;

    const root = am5.Root.new(chartRef.current);

    const themes: am5.Theme[] = [am5themes_Animated.new(root)];
    if (isDark) {
      themes.push(am5themes_Dark.new(root));
    }
    root.setThemes(themes);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(60),
        layout: root.verticalLayout,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'count',
        categoryField: 'label',
        alignLabels: false,
      })
    );

    series.labels.template.set('visible', false);
    series.ticks.template.set('visible', false);

    series.slices.template.setAll({
      stroke: isDark ? am5.color('#1D192B') : am5.color('#ffffff'),
      strokeWidth: 2,
      cornerRadius: 6,
      tooltipText: '{category}: [bold]{value} đơn ({valuePercentTotal.formatNumber("0.0")}%) [/]',
    });

    // Custom colors matching Atelier Forge status colors
    series.get('colors')?.set('colors', [
      am5.color('#ECE3FF'), // PENDING (Lavender)
      am5.color('#FFBFAE'), // PROCESSING (Peach)
      am5.color('#7C5CFC'), // PRINTING (Primary Violet)
      am5.color('#C9E8D5'), // COMPLETED (Mint)
      am5.color('#FFDAD6'), // CANCELLED (Error Container)
    ]);

    series.data.setAll(chartData);

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 5,
      })
    );

    legend.labels.template.setAll({
      fill: isDark ? am5.color('#cbd5e1') : am5.color('#475569'),
      fontSize: 12,
    });

    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [stats, isDark]);

  return (
    <div style={{ width: '100%', height: '350px' }}>
      {chartData.length === 0 ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          Chưa có đơn hàng nào trong hệ thống.
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};
