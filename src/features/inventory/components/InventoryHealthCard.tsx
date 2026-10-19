import React from 'react';
import { Card, Progress, Row, Col, Typography, Space, Tag } from 'antd';
import { CheckCircleOutlined, WarningOutlined, AlertOutlined, DashboardOutlined } from '@ant-design/icons';
import type { InventoryBalance } from '../types/inventory.types';

const { Text } = Typography;

interface InventoryHealthCardProps {
  balances: InventoryBalance[];
}

export const InventoryHealthCard: React.FC<InventoryHealthCardProps> = ({ balances }) => {
  const totalOnHand = balances.reduce((sum, b) => sum + Number(b.onHandGram), 0);
  const totalReserved = balances.reduce((sum, b) => sum + Number(b.reservedGram), 0);
  const totalAvailable = balances.reduce((sum, b) => sum + Number(b.availableGram), 0);

  const availablePercentage = totalOnHand > 0 ? Math.round((totalAvailable / totalOnHand) * 100) : 100;
  const reservedPercentage = totalOnHand > 0 ? Math.round((totalReserved / totalOnHand) * 100) : 0;

  let healthStatus: { label: string; color: string; icon: React.ReactNode } = {
    label: 'Dung lượng tồn kho tối ưu',
    color: 'success',
    icon: <CheckCircleOutlined />,
  };

  if (availablePercentage < 30) {
    healthStatus = {
      label: 'Cảnh báo: Tồn khả dụng ở mức thấp',
      color: 'error',
      icon: <AlertOutlined />,
    };
  } else if (availablePercentage < 60) {
    healthStatus = {
      label: 'Tồn kho ổn định: Đang sản xuất',
      color: 'warning',
      icon: <WarningOutlined />,
    };
  }

  return (
    <Card
      title={
        <Space>
          <DashboardOutlined style={{ color: '#0ea5e9' }} />
          <span>Độ ổn định & Ma trận Phân bổ Tồn kho</span>
        </Space>
      }
      extra={
        <Tag color={healthStatus.color} icon={healthStatus.icon}>
          {healthStatus.label}
        </Tag>
      }
    >
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Progress
            type="dashboard"
            percent={availablePercentage}
            strokeColor={{
              '0%': '#0ea5e9',
              '100%': '#10b981',
            }}
            format={(percent) => (
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>{percent}%</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Tồn khả dụng</div>
              </div>
            )}
          />
        </Col>

        <Col xs={24} md={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Khả dụng cho lệnh in mới:</Text>
                <Text strong style={{ color: '#34d399' }}>
                  {(totalAvailable / 1000).toFixed(2)} kg ({availablePercentage}%)
                </Text>
              </div>
              <Progress percent={availablePercentage} strokeColor="#10b981" showInfo={false} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Đã giữ cho các lệnh in 3D:</Text>
                <Text strong style={{ color: '#fbbf24' }}>
                  {(totalReserved / 1000).toFixed(2)} kg ({reservedPercentage}%)
                </Text>
              </div>
              <Progress percent={reservedPercentage} strokeColor="#f59e0b" showInfo={false} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
              <Text type="secondary">Tổng tồn kho vật lý đang lưu trữ:</Text>
              <Text strong style={{ color: '#38bdf8' }}>
                {(totalOnHand / 1000).toFixed(2)} kg (100%)
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
