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

  let healthStatus: { label: string; bg: string; color: string; icon: React.ReactNode } = {
    label: 'Dung lượng tồn kho tối ưu',
    bg: 'var(--tertiary-mint, #C9E8D5)',
    color: 'var(--tertiary, #466253)',
    icon: <CheckCircleOutlined />,
  };

  if (availablePercentage < 30) {
    healthStatus = {
      label: 'Cảnh báo: Tồn khả dụng ở mức thấp',
      bg: 'var(--error-container, #FFDAD6)',
      color: 'var(--on-error-container, #93000A)',
      icon: <AlertOutlined />,
    };
  } else if (availablePercentage < 60) {
    healthStatus = {
      label: 'Tồn kho ổn định: Đang sản xuất',
      bg: 'var(--secondary-peach, #FFBFAE)',
      color: '#7C3F2E',
      icon: <WarningOutlined />,
    };
  }

  return (
    <Card
      style={{ borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}
      title={
        <Space>
          <DashboardOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #28243D)' }}>Độ ổn định & Ma trận Phân bổ Tồn kho</span>
        </Space>
      }
      extra={
        <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: healthStatus.bg, color: healthStatus.color, border: 'none', fontWeight: 600 }} icon={healthStatus.icon}>
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
              '0%': 'var(--primary, #7C5CFC)',
              '100%': 'var(--tertiary-mint, #C9E8D5)',
            }}
            format={(percent) => (
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary, #28243D)' }}>{percent}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary, #6A6282)' }}>Tồn khả dụng</div>
              </div>
            )}
          />
        </Col>

        <Col xs={24} md={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Khả dụng cho lệnh in mới:</Text>
                <Text strong style={{ color: 'var(--tertiary, #466253)' }}>
                  {(totalAvailable / 1000).toFixed(2)} kg ({availablePercentage}%)
                </Text>
              </div>
              <Progress percent={availablePercentage} strokeColor="var(--tertiary, #466253)" showInfo={false} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Đã giữ cho các lệnh in 3D:</Text>
                <Text strong style={{ color: '#E07A5F' }}>
                  {(totalReserved / 1000).toFixed(2)} kg ({reservedPercentage}%)
                </Text>
              </div>
              <Progress percent={reservedPercentage} strokeColor="#FFBFAE" showInfo={false} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default, #E2D9F7)', paddingTop: 10 }}>
              <Text type="secondary">Tổng tồn kho vật lý đang lưu trữ:</Text>
              <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>
                {(totalOnHand / 1000).toFixed(2)} kg (100%)
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
