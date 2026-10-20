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
      <Tag style={{ padding: '6px 14px', borderRadius: '9999px', background: 'var(--surface-container)', border: '1px solid var(--border-color)' }}>
        <Space size={6}>
          <HomeOutlined spin style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Đang tải cơ sở kho...</span>
        </Space>
      </Tag>
    );
  }

  if (myWarehouses.length === 0) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'var(--surface-container, #F1EBFF)',
          border: '1px solid var(--border-color, #E2D9F7)',
        }}
      >
        <HomeOutlined style={{ color: 'var(--primary)' }} />
        <Text strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
          Kho: Trung tâm Memento3D
        </Text>
      </div>
    );
  }

  if (myWarehouses.length === 1) {
    const single = myWarehouses[0];
    return (
      <Tooltip title="Kho tự động kích hoạt (Bạn có quyền hạn tại 1 cơ sở kho)">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface-container, #F1EBFF)',
            border: '1px solid var(--border-color, #E2D9F7)',
            padding: '6px 14px',
            borderRadius: '9999px',
          }}
        >
          <HomeOutlined style={{ color: 'var(--primary)' }} />
          <Text strong style={{ color: 'var(--text-primary)', fontSize: '0.825rem' }}>
            {single.code}
          </Text>
          <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ({single.name})
          </Text>
          <CheckCircleOutlined style={{ color: 'var(--tertiary, #466253)', fontSize: '13px' }} />
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tooltip title="Chuyển đổi cơ sở kho làm việc">
        <Select
          id="warehouse-scope-selector"
          value={activeWarehouseId || undefined}
          onChange={setActiveWarehouseId}
          style={{ minWidth: 240 }}
          placeholder="Chọn cơ sở kho làm việc"
          popupMatchSelectWidth={false}
          options={myWarehouses.map((w) => ({
            value: w.id,
            label: (
              <Space>
                <Tag color="purple" style={{ marginRight: 0, fontWeight: 700, borderRadius: 9999 }}>
                  {w.code}
                </Tag>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{w.name}</span>
              </Space>
            ),
          }))}
        />
      </Tooltip>
    </div>
  );
};
