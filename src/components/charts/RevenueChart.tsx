import React, { useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { useAmChart } from '../../hooks/useAmChart';
import type { RevenueChartDataPoint } from '../../types/dashboard';
import { Card, Spin, Alert, Empty } from 'antd';
import { TrendingUp } from 'lucide-react';

export interface RevenueChartProps {
  data: RevenueChartDataPoint[];
  isLoading?: boolean;
  error?: Error | null;
  onFilterChange?: (filter: '7d' | '30d' | '3m' | '6m' | '1y') => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  isLoading,
  error,
  onFilterChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');

  const handleFilterClick = (filter: '7d' | '30d' | '3m' | '6m' | '1y') => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const { containerRef } = useAmChart(
    (root) => {
      if (!data || data.length === 0) return;

      // 1. Create XY Chart
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: false,
          wheelX: 'panX',
          wheelY: 'zoomX',
          layout: root.verticalLayout,
        })
      );

      // 2. Cursor
      const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
        behavior: 'zoomX',
      }));
      cursor.lineY.set('visible', false);

      // 3. X Axis: Date Axis
      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: 'day', count: 1 },
          renderer: am5xy.AxisRendererX.new(root, {
            minorGridEnabled: false,
            minGridDistance: 50,
          }),
          tooltip: am5.Tooltip.new(root, {}),
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

      // 4. Y Axis 1 (Left): Revenue
      const yAxisRevenue = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );

      yAxisRevenue.get('renderer').labels.template.setAll({
        fill: am5.color(0x94a3b8),
        fontSize: 11,
      });

      yAxisRevenue.get('renderer').grid.template.setAll({
        stroke: am5.color(0xffffff),
        strokeOpacity: 0.05,
      });

      // 5. Y Axis 2 (Right): Order Count
      const yAxisOrders = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
            opposite: true,
          }),
        })
      );
      yAxisOrders.get('renderer').labels.template.setAll({
        fill: am5.color(0x38bdf8),
        fontSize: 11,
      });
      yAxisOrders.get('renderer').grid.template.set('visible', false);

      // 6. Series 1: Area / Line for Revenue
      const revenueSeries = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: 'Doanh thu (VND)',
          xAxis,
          yAxis: yAxisRevenue,
          valueYField: 'revenue',
          valueXField: 'date',
          stroke: am5.color(0x0ea5e9),
          fill: am5.color(0x0ea5e9),
          tooltip: am5.Tooltip.new(root, {
            labelText: '[bold]Doanh thu:[/] {valueY.formatNumber("#,###")} ₫',
          }),
        })
      );

      revenueSeries.strokes.template.setAll({
        strokeWidth: 2.5,
      });

      revenueSeries.fills.template.setAll({
        fillOpacity: 0.15,
        visible: true,
      });

      // 7. Series 2: Line for Orders
      const orderSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: 'Số lượng đơn hàng',
          xAxis,
          yAxis: yAxisOrders,
          valueYField: 'orders',
          valueXField: 'date',
          stroke: am5.color(0x8b5cf6),
          tooltip: am5.Tooltip.new(root, {
            labelText: '[bold]Đơn hàng:[/] {valueY} đơn\n[bold]AOV:[/] {aov.formatNumber("#,###")} ₫',
          }),
        })
      );

      orderSeries.strokes.template.setAll({
        strokeWidth: 2,
        strokeDasharray: [4, 4],
      });

      // Bullets on order points
      orderSeries.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 3.5,
            fill: am5.color(0x8b5cf6),
            stroke: am5.color(0x0f172a),
            strokeWidth: 1.5,
          }),
        });
      });

      // 8. Legend
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 12,
        })
      );
      legend.labels.template.setAll({
        fill: am5.color(0x94a3b8),
        fontSize: 12,
      });
      legend.data.setAll(chart.series.values);

      // Feed data
      revenueSeries.data.setAll(data);
      orderSeries.data.setAll(data);

      revenueSeries.appear(1000);
      orderSeries.appear(1000);
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
      {/* Chart Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#0ea5e9" />
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
              Phân tích Doanh thu & Đơn hàng
            </span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
            Theo dõi dòng tiền, quy mô đơn và giá trị trung bình (AOV)
          </div>
        </div>

        {/* Time Filters */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {(['7d', '30d', '3m', '6m', '1y'] as const).map((filter) => {
            const labels: Record<string, string> = {
              '7d': '7 Ngày',
              '30d': '30 Ngày',
              '3m': '3 Tháng',
              '6m': '6 Tháng',
              '1y': '1 Năm',
            };
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                style={{
                  background: isActive ? '#0ea5e9' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Body */}
      <div style={{ flex: 1, minHeight: 320, position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 19, 34, 0.7)', zIndex: 10 }}>
            <Spin tip="Đang tải dữ liệu biểu đồ..." />
          </div>
        )}

        {error && (
          <Alert
            type="error"
            message="Không thể tải số liệu doanh thu"
            description={error.message}
            showIcon
            style={{ marginTop: 24 }}
          />
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Empty description="Chưa có dữ liệu sản xuất cho khoảng thời gian này" />
          </div>
        )}

        <div ref={containerRef} style={{ width: '100%', height: '320px' }} />
      </div>
    </Card>
  );
};
