import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { AdminReconstructionStats } from '../../types/admin.types';

interface ReconstructionStatsChartProps {
  stats?: AdminReconstructionStats;
}

export const ReconstructionStatsChart: React.FC<ReconstructionStatsChartProps> = ({ stats }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const data = [
    { status: 'Chờ xử lý', count: stats?.queued || 0, color: '#f59e0b' },
    { status: 'Đang chạy', count: stats?.running || 0, color: '#3b82f6' },
    { status: 'Hoàn thành', count: stats?.completed || 0, color: '#10b981' },
    { status: 'Lỗi', count: stats?.failed || 0, color: '#ef4444' },
  ];

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    const themes: am5.Theme[] = [am5themes_Animated.new(root)];
    if (isDark) {
      themes.push(am5themes_Dark.new(root));
    }
    root.setThemes(themes);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
        paddingRight: 10,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'status',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.get('renderer').labels.template.setAll({
      fill: isDark ? am5.color('#94a3b8') : am5.color('#64748b'),
      fontSize: 12,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    yAxis.get('renderer').labels.template.setAll({
      fill: isDark ? am5.color('#94a3b8') : am5.color('#64748b'),
      fontSize: 12,
    });

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'count',
        categoryXField: 'status',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{categoryX}: [bold]{valueY} tác vụ[/]',
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 6,
      cornerRadiusTR: 6,
      strokeOpacity: 0,
    });

    series.columns.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const item = (dataItem.dataContext as any);
        if (item && item.color) {
          return am5.color(item.color);
        }
      }
      return fill;
    });

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [stats, isDark]);

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
