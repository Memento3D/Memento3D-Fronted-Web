import React from 'react';
import { Card, Button, Typography, Space, Row, Col, Tag, Spin, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HomeOutlined, ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import type { Warehouse } from '../../warehouse/types/warehouse.types';
import { getStatusLabel } from '../../../locales/i18n';

const { Title, Paragraph } = Typography;

export const WarehouseSelectPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: myWarehouses = [], isLoading, error } = useQuery({
    queryKey: ['my-warehouses'],
    queryFn: warehouseApi.getMyWarehouses,
  });

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    localStorage.setItem('memento3d_active_warehouse_id', warehouse.id);
    navigate('/warehouse/home', { replace: true });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-app, #F8F5FF)',
        }}
      >
        <Spin size="large" tip="Đang tải danh sách cơ sở kho được ủy quyền..." />
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
          background: 'var(--bg-app, #F8F5FF)',
          padding: 24,
        }}
      >
        <Result
          status="warning"
          title="Chưa có quyền thành viên kho"
          subTitle="Tài khoản của bạn chưa được phân công vào bất kỳ trung tâm kho khu vực nào. Vui lòng liên hệ Quản trị viên để được cấp quyền."
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/manager/inventory')} style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--primary, #7C5CFC)' }}>
              Đến cổng tổng quan
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-app)',
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
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-default, #E2D9F7)',
              boxShadow: 'none',
              marginBottom: 16,
            }}
          >
            <HomeOutlined style={{ fontSize: 24, color: 'var(--primary, #7C5CFC)' }} />
          </div>
          <Title level={2} style={{ color: 'var(--text-primary, #28243D)', margin: 0, fontWeight: 800 }}>
            Chọn cơ sở kho làm việc
          </Title>
          <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.95rem', marginTop: 8 }}>
            Bạn đang phụ trách hoạt động tại nhiều trung tâm chế tác 3D. Vui lòng chọn cơ sở kho bạn làm việc hôm nay.
          </Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          {myWarehouses.map((wh) => (
            <Col xs={24} sm={12} key={wh.id}>
              <Card
                hoverable
                onClick={() => handleSelectWarehouse(wh)}
                style={{
                  background: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-default, #E2D9F7)',
                  borderRadius: 'var(--radius-card, 10px)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.2s ease',
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Tag style={{ fontSize: '0.85rem', fontWeight: 700, padding: '2px 12px', borderRadius: 'var(--radius-full, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary, #7C5CFC)', border: '1px solid var(--border-default, #E2D9F7)' }}>
                    {wh.code}
                  </Tag>
                  <Tag color={wh.status === 'ACTIVE' ? 'success' : 'default'} style={{ borderRadius: 'var(--radius-full, 9999px)' }}>
                    {getStatusLabel(wh.status)}
                  </Tag>
                </div>

                <Title level={4} style={{ color: 'var(--text-primary, #28243D)', margin: '0 0 8px 0' }}>
                  {wh.name}
                </Title>

                {wh.location && (
                  <Space style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.825rem', marginBottom: 20 }}>
                    <EnvironmentOutlined />
                    <span>{wh.location}</span>
                  </Space>
                )}

                <Button
                  type="primary"
                  block
                  icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 'var(--radius-full, 9999px)',
                    fontWeight: 700,
                    background: 'var(--primary, #7C5CFC)',
                    border: 'none',
                    marginTop: 12,
                    height: '42px',
                    boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.25)',
                  }}
                >
                  Vào không gian kho này
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
