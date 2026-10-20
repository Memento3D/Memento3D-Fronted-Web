import React from 'react';
import { Button, Tooltip } from 'antd';
import { RefreshCw, Calendar, Box, Radio } from 'lucide-react';
import type { DashboardTimeRange } from '../../types/dashboard';

export interface DashboardFiltersProps {
  timeRange: DashboardTimeRange;
  onTimeRangeChange: (range: DashboardTimeRange) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isRealTimeConnected?: boolean;
  onOpen3DViewer?: () => void;
  lastUpdated?: string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isRefreshing = false,
  isRealTimeConnected = true,
  onOpen3DViewer,
  lastUpdated,
}) => {
  const timeOptions: Array<{ key: DashboardTimeRange; label: string }> = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7d', label: '7 Ngày qua' },
    { key: '30d', label: '30 Ngày qua' },
    { key: '3m', label: '3 Tháng qua' },
    { key: 'custom', label: 'Tùy chỉnh' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {/* Time Range Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--surface-container, #F1EBFF)',
          padding: '4px',
          borderRadius: 'var(--radius-full, 9999px)',
          border: '1px solid var(--border-color, #E2D9F7)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
          <Calendar size={14} color="var(--primary)" />
          <span>Thời gian:</span>
        </div>

        {timeOptions.map((opt) => {
          const isActive = timeRange === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onTimeRangeChange(opt.key)}
              style={{
                background: isActive ? 'var(--primary, #7C5CFC)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full, 9999px)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px var(--primary-glow)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {lastUpdated && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Đồng bộ lúc: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lastUpdated}</span>
          </div>
        )}

        {isRealTimeConnected && (
          <Tooltip title="Kết nối máy chủ thời gian thực SSE (Server-Sent Events) đang hoạt động ổn định">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--success-bg, #C9E8D5)',
                border: '1px solid var(--success-border, #A5D7B7)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full, 9999px)',
                color: 'var(--text-on-success, #1E3B2C)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Radio size={13} className="animate-pulse" color="var(--tertiary, #466253)" />
              <span>SSE Đồng bộ</span>
            </div>
          </Tooltip>
        )}

        <Button
          icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            background: 'var(--surface-container, #F1EBFF)',
            borderColor: 'var(--border-color, #E2D9F7)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-full, 9999px)',
            fontWeight: 600,
            padding: '0 18px',
            height: 38,
          }}
        >
          {isRefreshing ? 'Đang tải...' : 'Làm mới'}
        </Button>

        {onOpen3DViewer && (
          <Button
            type="primary"
            icon={<Box size={14} />}
            onClick={onOpen3DViewer}
            style={{
              background: 'var(--primary, #7C5CFC)',
              borderColor: 'var(--primary, #7C5CFC)',
              borderRadius: 'var(--radius-full, 9999px)',
              fontWeight: 600,
              padding: '0 20px',
              height: 38,
            }}
          >
            Trình xem 3D
          </Button>
        )}
      </div>
    </div>
  );
};
