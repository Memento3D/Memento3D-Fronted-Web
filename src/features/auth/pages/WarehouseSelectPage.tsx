import React from 'react';
import { Card, Button, Typography, Space, Row, Col, Tag, Spin, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HomeOutlined, ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import type { Warehouse } from '../../warehouse/types/warehouse.types';

const { Title, Paragraph } = Typography;

export const WarehouseSelectPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: myWarehouses = [], isLoading, error } = useQuery({
    queryKey: ['my-warehouses'],
    queryFn: warehouseApi.getMyWarehouses,
  });

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    localStorage.setItem('memento3d_active_warehouse_id', warehouse.id);
    navigate('/manager/inventory', { replace: true });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#090d16',
        }}
      >
        <Spin size="large" tip="Loading authorized warehouse facilities..." />
      </div>
    );
  }

  if (error || myWarehouses.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#090d16',
          padding: 24,
        }}
      >
        <Result
          status="warning"
          title="No Warehouse Facility Membership"
          subTitle="Your account has not been assigned to any regional warehouse hub. Contact an Administrator to grant facility membership."
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/manager/inventory')}>
              Go to Overview
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
        padding: '32px 16px',
      }}
    >
      <div style={{ maxWidth: 840, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
              marginBottom: 16,
            }}
          >
            <HomeOutlined style={{ fontSize: 28, color: '#ffffff' }} />
          </div>
          <Title level={2} style={{ color: '#f8fafc', margin: 0, fontWeight: 800 }}>
            Select Operating Warehouse
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 8 }}>
            You maintain active operational memberships across multiple 3D manufacturing hubs. Select the facility you are operating in today.
          </Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          {myWarehouses.map((wh) => (
            <Col xs={24} sm={12} key={wh.id}>
              <Card
                hoverable
                onClick={() => handleSelectWarehouse(wh)}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  transition: 'all 0.25s ease',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Tag color="cyan" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '2px 10px', borderRadius: 6 }}>
                    {wh.code}
                  </Tag>
                  <Tag color={wh.status === 'ACTIVE' ? 'success' : 'default'}>
                    {wh.status}
                  </Tag>
                </div>

                <Title level={4} style={{ color: '#ffffff', margin: '0 0 8px 0' }}>
                  {wh.name}
                </Title>

                {wh.location && (
                  <Space style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: 20 }}>
                    <EnvironmentOutlined />
                    <span>{wh.location}</span>
                  </Space>
                )}

                <Button
                  type="primary"
                  block
                  icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                    border: 'none',
                    marginTop: 12,
                  }}
                >
                  Enter Facility Terminal
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
