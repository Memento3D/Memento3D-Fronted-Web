import React from 'react';
import { Card, Timeline } from 'antd';
import { 
  History, 
  Printer, 
  ShoppingBag, 
  Cpu, 
  Layers 
} from 'lucide-react';
import type { ActivityTimelineItem } from '../../types/dashboard';
import { StatusBadge } from '../common/StatusBadge';

export interface ActivityTimelineProps {
  activities: ActivityTimelineItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: ActivityTimelineItem['type'], severity: ActivityTimelineItem['severity']) => {
    switch (type) {
      case 'print_job':
        return (
          <div
            style={{
              background: severity === 'success' ? 'var(--success-bg, #C9E8D5)' : 'var(--surface-container, #F1EBFF)',
              color: severity === 'success' ? 'var(--tertiary, #466253)' : 'var(--primary, #7C5CFC)',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            <Printer size={14} />
          </div>
        );
      case 'order':
        return (
          <div
            style={{
              background: 'var(--secondary-container, #FFE5DF)',
              color: '#7A3E2D',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--secondary)',
            }}
          >
            <ShoppingBag size={14} />
          </div>
        );
      case 'reconstruction':
        return (
          <div
            style={{
              background: 'var(--surface-container, #F1EBFF)',
              color: 'var(--primary, #7C5CFC)',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            <Cpu size={14} />
          </div>
        );
      case 'inventory':
      default:
        return (
          <div
            style={{
              background: 'var(--surface-high, #EBE4FF)',
              color: 'var(--primary-system, #5F3ADD)',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            <Layers size={14} />
          </div>
        );
    }
  };

  const timelineItems = activities.map((act) => ({
    dot: getIcon(act.type, act.severity),
    children: (
      <div style={{ paddingBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            {act.title}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            {act.timeFormatted}
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {act.description}
        </div>
      </div>
    ),
  }));

  return (
    <Card
      bordered={false}
      style={{
        background: 'var(--bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-color, #E2D9F7)',
        boxShadow: 'var(--shadow-card)',
        height: '100%',
      }}
      styles={{ body: { padding: '28px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: 'var(--surface-container, #F1EBFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <History size={18} color="var(--primary)" />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.15rem' }}>
            Nhật ký Hoạt động Thời gian thực
          </span>
        </div>
        <StatusBadge status="ACTIVE" label="Live Feed" variant="mint" />
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
        <Timeline items={timelineItems} />
      </div>
    </Card>
  );
};
