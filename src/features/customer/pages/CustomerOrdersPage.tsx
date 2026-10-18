import React from 'react';
import { Card, Button, Typography, Tag, Row, Col, Steps } from 'antd';
import {
  CodeSandboxOutlined,
  PlusOutlined,
  HomeOutlined,
  LogoutOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const { Title, Text, Paragraph } = Typography;

interface CustomerOrder {
  id: string;
  orderCode: string;
  memoryTitle: string;
  productType: string;
  material: string;
  currentStep: number;
  status: 'PROCESSING' | 'PRINTING' | 'DISPATCHED' | 'DELIVERED';
  createdAt: string;
  estimatedDelivery: string;
  thumbnailUrl?: string;
}

const SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-101',
    orderCode: 'MEM-2026-8941',
    memoryTitle: 'Graduation Ceremony Honor Bust',
    productType: 'Standard Desk Sculpture (15cm)',
    material: 'Silk Bronze Bio-PLA with Walnut Base',
    currentStep: 2,
    status: 'PRINTING',
    createdAt: '2026-10-16',
    estimatedDelivery: '2026-10-21',
  },
  {
    id: 'ord-102',
    orderCode: 'MEM-2026-7812',
    memoryTitle: 'Golden Retriever Companion Charm',
    productType: 'Mini Keepsake & Charm (5cm)',
    material: 'Tough Polymer Resin (Arctic White)',
    currentStep: 3,
    status: 'DELIVERED',
    createdAt: '2026-10-08',
    estimatedDelivery: '2026-10-12',
  },
];

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050811',
        color: '#f8fafc',
        padding: '32px 24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 36,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              <CodeSandboxOutlined style={{ fontSize: 24, color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Memento<span style={{ color: '#06b6d4' }}>3D</span> Customer Portal
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Welcome back, {user?.fullName || user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                borderRadius: 8,
              }}
            >
              Homepage
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ borderRadius: 8 }}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Status Card */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={16}>
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 16,
                padding: 28,
              }}
            >
              <Tag color="blue" style={{ marginBottom: 12, fontWeight: 700 }}>
                Client Account Verified
              </Tag>
              <Title level={3} style={{ color: '#ffffff', margin: 0, marginBottom: 8 }}>
                Track Your Tangible 3D Keepsakes
              </Title>
              <Paragraph style={{ color: '#94a3b8', fontSize: '0.925rem', margin: 0, maxWidth: 600 }}>
                From AI neural reconstruction to micro-layer print farm dispatch and doorstep courier delivery, monitor every milestone of your personalized memories.
              </Paragraph>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Keepsakes
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>
                  {SAMPLE_ORDERS.length} Orders
                </div>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/#how-it-works')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  height: 40,
                  marginTop: 16,
                }}
              >
                Create New Keepsake
              </Button>
            </div>
          </Col>
        </Row>

        {/* Orders Section */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ color: '#ffffff', margin: 0, marginBottom: 16 }}>
            Recent 3D Keepsake Orders
          </Title>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SAMPLE_ORDERS.map((ord) => (
              <Card
                key={ord.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tag color="cyan" style={{ fontWeight: 800 }}>{ord.orderCode}</Tag>
                      <Text strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>
                        {ord.memoryTitle}
                      </Text>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                      {ord.productType} • <SkinOutlined /> {ord.material}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <Tag
                      color={
                        ord.status === 'PRINTING' ? 'processing' :
                        ord.status === 'DELIVERED' ? 'success' : 'default'
                      }
                      style={{ fontSize: '0.85rem', fontWeight: 700, padding: '3px 12px', borderRadius: 6 }}
                    >
                      {ord.status}
                    </Tag>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      Est. Arrival: {ord.estimatedDelivery}
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    padding: '20px 16px',
                    marginTop: 16,
                  }}
                >
                  <Steps
                    current={ord.currentStep}
                    size="small"
                    items={[
                      { title: 'Photos Ingested', description: 'Watertight Mesh' },
                      { title: 'AI Synthesis', description: 'Mesh Verified' },
                      { title: 'Print Farm Queue', description: '0.08mm Layers' },
                      { title: 'White-Glove Delivery', description: 'Heirloom Casket' },
                    ]}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
