import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { UserGrowthDataPoint } from '../../types/admin.types';

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

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
        panX: true,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 10,
      })
    );

    const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
    cursor.lineY.set('visible', false);

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'date',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 40,
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

    // 1. Column series for daily new users
    const barSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Đăng ký mới',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'count',
        categoryXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{categoryX}: [bold]+{valueY} thành viên mới[/]',
        }),
      })
    );

    barSeries.columns.template.setAll({
      fill: am5.color('#06b6d4'),
      stroke: am5.color('#0891b2'),
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
    });

    // 2. Line series for cumulative user growth
    const lineSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Tích lũy',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'cumulativeCount',
        categoryXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: 'Tổng tích lũy: [bold]{valueY}[/]',
        }),
      })
    );

    lineSeries.strokes.template.setAll({
      strokeWidth: 2,
      stroke: am5.color('#3b82f6'),
    });

    xAxis.data.setAll(data || []);
    barSeries.data.setAll(data || []);
    lineSeries.data.setAll(data || []);

    barSeries.appear(1000);
    lineSeries.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, isDark]);

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
          Chưa có dữ liệu tăng trưởng người dùng trong kỳ này.
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};
