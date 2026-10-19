import React from 'react';
import { Tag } from 'antd';
import { Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  statusText?: string;
  statusColor?: string;
}

export interface RecentActivityProps {
  title?: string;
  activities: ActivityItem[];
  emptyMessage?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  title = 'Hoạt động gần đây',
  activities,
  emptyMessage = 'Chưa có hoạt động mới ghi nhận.',
}) => {
  return (
    <div className="tasks-attention-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 className="section-title">
          <Clock size={18} color="var(--primary)" />
          <span>{title}</span>
        </h3>
      </div>

      {activities.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div>{emptyMessage}</div>
        </div>
      ) : (
        activities.map((item) => (
          <div key={item.id} className="task-attention-item">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {item.subtitle}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.statusText && (
                <Tag color={item.statusColor || 'blue'} style={{ borderRadius: 4, margin: 0 }}>
                  {item.statusText}
                </Tag>
              )}
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{item.timeAgo}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
