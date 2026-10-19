import React from 'react';
import { Tag, Button } from 'antd';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info' | 'success';
  count?: number;
  actionText?: string;
  onAction?: () => void;
}

export interface TodayTasksProps {
  title?: string;
  tasks: TaskItem[];
  emptyMessage?: string;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  title = 'Việc cần chú ý hôm nay',
  tasks,
  emptyMessage = 'Tất cả các tác vụ đang vận hành ổn định! Không có cảnh báo khẩn.',
}) => {
  return (
    <div className="tasks-attention-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 className="section-title">
          <AlertCircle size={18} color="var(--warning)" />
          <span>{title}</span>
        </h3>
        {tasks.length > 0 && (
          <Tag color="volcano" style={{ borderRadius: 6, fontWeight: 700 }}>
            {tasks.length} cần xử lý
          </Tag>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 8px' }} />
          <div>{emptyMessage}</div>
        </div>
      ) : (
        tasks.map((task) => {
          const colorMap = {
            warning: 'orange',
            danger: 'red',
            info: 'blue',
            success: 'green',
          };
          return (
            <div key={task.id} className="task-attention-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag color={colorMap[task.severity]} style={{ borderRadius: 6, fontWeight: 700 }}>
                  {task.count !== undefined ? `${task.count}` : '!'}
                </Tag>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {task.description}
                  </div>
                </div>
              </div>

              {task.onAction && (
                <Button
                  size="small"
                  type="text"
                  onClick={task.onAction}
                  style={{
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontWeight: 600,
                  }}
                >
                  <span>{task.actionText || 'Xử lý'}</span>
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
