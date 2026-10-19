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
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
          <Calendar size={14} />
          <span>Thời gian:</span>
        </div>

        {timeOptions.map((opt) => {
          const isActive = timeRange === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onTimeRangeChange(opt.key)}
              style={{
                background: isActive ? '#0ea5e9' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Đồng bộ lúc: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{lastUpdated}</span>
          </div>
        )}

        {isRealTimeConnected && (
          <Tooltip title="Kết nối máy chủ thời gian thực SSE (Server-Sent Events) đang hoạt động ổn định">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '5px 10px',
                borderRadius: 8,
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Radio size={13} className="animate-pulse" />
              <span>SSE Đồng bộ</span>
            </div>
          </Tooltip>
        )}

        <Button
          icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            borderRadius: 8,
            fontWeight: 600,
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
              background: '#0ea5e9',
              borderColor: '#0ea5e9',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Trình xem 3D
          </Button>
        )}
      </div>
    </div>
  );
};
