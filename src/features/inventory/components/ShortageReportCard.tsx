import React from 'react';
import { Card, Table, Tag, Typography, Space, Button, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AlertOutlined, PlusCircleOutlined, CheckCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { InventoryBalance } from '../types/inventory.types';

const { Text } = Typography;

interface ShortageReportCardProps {
  balances: InventoryBalance[];
  onOpenReceipt: (materialId?: string, warehouseId?: string) => void;
}

const LOW_STOCK_THRESHOLD_GRAM = 1500; // < 1.5 spool

export const ShortageReportCard: React.FC<ShortageReportCardProps> = ({
  balances,
  onOpenReceipt,
}) => {
  const lowStockItems = balances.filter((b) => Number(b.availableGram) < LOW_STOCK_THRESHOLD_GRAM);

  const columns: ColumnsType<InventoryBalance> = [
    {
      title: 'Warehouse',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Material SKU',
      dataIndex: 'materialSku',
      key: 'materialSku',
      render: (sku: string, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ color: '#38bdf8' }}>{sku}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Current Available',
      dataIndex: 'availableGram',
      key: 'availableGram',
      sorter: (a, b) => a.availableGram - b.availableGram,
      render: (gram: number) => {
        const isCritical = gram <= 500;
        return (
          <Tag color={isCritical ? 'error' : 'warning'} style={{ fontWeight: 600 }}>
            {gram} g ({(gram / 1000).toFixed(2)} spool)
          </Tag>
        );
      },
    },
    {
      title: 'Replenishment Rec.',
      key: 'recommendation',
      render: (_, record) => {
        const neededGram = Math.max(0, 5000 - Number(record.availableGram));
        const spools = Math.ceil(neededGram / 1000);
        return (
          <Space>
            <ShoppingCartOutlined style={{ color: '#f59e0b' }} />
            <Text strong style={{ color: '#fbbf24' }}>
              +{spools} Spools ({spools} kg)
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Quick Order',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusCircleOutlined />}
          onClick={() => onOpenReceipt(record.materialId, record.warehouseId)}
        >
          Receive Stock
        </Button>
      ),
    },
  ];

  if (lowStockItems.length === 0) {
    return (
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <span>Shortage & Low Stock Warning</span>
          </Space>
        }
      >
        <Alert
          message="All material stock levels are within safe operating buffers (> 1.5kg available per SKU)."
          type="success"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <AlertOutlined style={{ color: '#ef4444' }} />
          <span>Low Stock Warnings & Replenishment Recommendations ({lowStockItems.length})</span>
        </Space>
      }
      extra={
        <Tag color="error">Action Required: {lowStockItems.length} SKUs Low</Tag>
      }
    >
      <Table
        columns={columns}
        dataSource={lowStockItems}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};
