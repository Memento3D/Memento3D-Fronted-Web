import React from 'react';
import { Badge } from 'antd';
import { Activity } from 'lucide-react';

export interface HealthNode {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency?: string;
  note?: string;
}

export interface SystemHealthProps {
  nodes?: HealthNode[];
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ nodes }) => {
  const defaultNodes: HealthNode[] = [
    { name: 'Backend Core API', status: 'healthy', latency: '24ms', note: 'Spring Boot 3.3.x' },
    { name: 'PostgreSQL DB', status: 'healthy', latency: '4ms', note: 'ACID Pool Connected' },
    { name: 'Redis Cache', status: 'healthy', latency: '1ms', note: 'Session & Auth Store' },
    { name: 'Realtime WebSocket', status: 'healthy', latency: '12ms', note: 'STOMP / SockJS Active' },
    { name: 'GPU 3D Worker', status: 'healthy', latency: '45ms', note: 'Meshroom / NeRF Online' },
    { name: 'Cloud Storage S3', status: 'healthy', latency: '35ms', note: 'Assets & STL Bucket Ready' },
  ];

  const currentNodes = nodes || defaultNodes;

  return (
    <div className="tasks-attention-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 className="section-title">
          <Activity size={18} color="var(--primary)" />
          <span>Trạng thái Hệ thống & Cơ sở hạ tầng</span>
        </h3>
        <Badge status="processing" text={<span style={{ color: 'var(--success)', fontWeight: 600 }}>Tất cả dịch vụ Sẵn sàng</span>} />
      </div>

      <div className="system-health-grid">
        {currentNodes.map((node) => {
          const badgeStatus =
            node.status === 'healthy' ? 'success' : node.status === 'warning' ? 'warning' : 'error';
          const statusText =
            node.status === 'healthy' ? 'Hoạt động' : node.status === 'warning' ? 'Chậm' : 'Mất kết nối';

          return (
            <div key={node.name} className="system-health-card">
              <div>
                <div className="system-health-name">{node.name}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {node.note || node.latency}
                </div>
              </div>
              <Badge status={badgeStatus} text={<span style={{ fontSize: '0.75rem' }}>{statusText}</span>} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
