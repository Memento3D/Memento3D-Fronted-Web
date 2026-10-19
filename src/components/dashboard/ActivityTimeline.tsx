import React from 'react';
import { Card, Timeline, Tag } from 'antd';
import { 
  History, 
  Printer, 
  ShoppingBag, 
  Cpu, 
  Layers 
} from 'lucide-react';
import type { ActivityTimelineItem } from '../../types/dashboard';

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
              background: severity === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
              color: severity === 'success' ? '#10b981' : '#38bdf8',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Printer size={14} />
          </div>
        );
      case 'order':
        return (
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a855f7',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={14} />
          </div>
        );
      case 'reconstruction':
        return (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
      <div style={{ paddingBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.875rem' }}>
            {act.title}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
            {act.timeFormatted}
          </span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          {act.description}
        </div>
      </div>
    ),
  }));

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
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} color="#0ea5e9" />
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>
            Nhật ký Hoạt động Thời gian thực
          </span>
        </div>
        <Tag color="cyan">Live Feed</Tag>
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
        <Timeline items={timelineItems} />
      </div>
    </Card>
  );
};
