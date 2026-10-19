import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { RevenueDataPoint } from '../../types/admin.types';

interface RevenueTrendChartProps {
  data: RevenueDataPoint[];
  period: string;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, period }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    // Apply themes
    const themes: am5.Theme[] = [am5themes_Animated.new(root)];
    if (isDark) {
      themes.push(am5themes_Dark.new(root));
    }
    root.setThemes(themes);

    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 10,
      })
    );

    // Add cursor
    const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
    cursor.lineY.set('visible', false);

    // Create X-Axis
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'period',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 40,
          minorGridEnabled: false,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.get('renderer').labels.template.setAll({
      fill: isDark ? am5.color('#94a3b8') : am5.color('#64748b'),
      fontSize: 12,
    });

    // Create Y-Axis
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    yAxis.get('renderer').labels.template.setAll({
      fill: isDark ? am5.color('#94a3b8') : am5.color('#64748b'),
      fontSize: 12,
    });

    // Create Series
    const series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: 'Doanh thu',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'revenue',
        categoryXField: 'period',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{categoryX}: [bold]{valueY.formatNumber("#,###.00")} đ[/]',
        }),
      })
    );

    series.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color('#6366f1'),
    });

    series.fills.template.setAll({
      fillOpacity: 0.15,
      visible: true,
      fill: am5.color('#6366f1'),
    });

    // Bullets
    series.bullets.push(() => {
      const circle = am5.Circle.new(root, {
        radius: 4,
        fill: am5.color('#6366f1'),
        stroke: am5.color('#ffffff'),
        strokeWidth: 2,
      });
      return am5.Bullet.new(root, {
        sprite: circle,
      });
    });

    // Set chart data
    xAxis.data.setAll(data || []);
    series.data.setAll(data || []);

    // Animate on load
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, isDark, period]);

  return (
    <div style={{ width: '100%', height: '350px' }}>
      {(!data || data.length === 0) ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          Chưa có dữ liệu biến động doanh thu trong kỳ này.
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};
