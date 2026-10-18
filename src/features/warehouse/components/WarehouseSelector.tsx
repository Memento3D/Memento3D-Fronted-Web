import React from 'react';
import { Select, Tag, Space, Typography, Tooltip } from 'antd';
import { HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useWarehouseContext } from '../context/WarehouseContext';

const { Text } = Typography;

export const WarehouseSelector: React.FC = () => {
  const { activeWarehouseId, myWarehouses, setActiveWarehouseId, isLoading } =
    useWarehouseContext();

  if (isLoading) {
    return (
      <Tag style={{ padding: '4px 8px', borderRadius: '6px' }}>
        <Space size={4}>
          <HomeOutlined spin />
          <span>Loading Hubs...</span>
        </Space>
      </Tag>
    );
  }

  if (myWarehouses.length === 0) {
    return (
      <Tag color="blue" style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(14, 165, 233, 0.1)', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
        <Space size={6}>
          <HomeOutlined style={{ color: '#38bdf8' }} />
          <Text strong style={{ color: '#38bdf8', fontSize: '0.785rem' }}>
            Facility: Memento3D Central
          </Text>
        </Space>
      </Tag>
    );
  }

  if (myWarehouses.length === 1) {
    const single = myWarehouses[0];
    return (
      <Tooltip title="Auto-selected warehouse facility (you have single warehouse membership scope)">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            padding: '4px 10px',
            borderRadius: '6px',
          }}
        >
          <HomeOutlined style={{ color: '#38bdf8' }} />
          <Text strong style={{ color: '#e0f2fe', fontSize: '0.825rem' }}>
            {single.code}
          </Text>
          <Text type="secondary" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            ({single.name})
          </Text>
          <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '12px' }} />
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tooltip title="Switch active warehouse facility context">
        <Select
          id="warehouse-scope-selector"
          value={activeWarehouseId || undefined}
          onChange={setActiveWarehouseId}
          style={{ minWidth: 240 }}
          placeholder="Select Warehouse Scope"
          popupMatchSelectWidth={false}
          options={myWarehouses.map((w) => ({
            value: w.id,
            label: (
              <Space>
                <Tag color="cyan" style={{ marginRight: 0, fontWeight: 700 }}>
                  {w.code}
                </Tag>
                <span style={{ fontSize: '0.85rem' }}>{w.name}</span>
              </Space>
            ),
          }))}
        />
      </Tooltip>
    </div>
  );
};
