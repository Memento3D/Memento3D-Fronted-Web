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
      title: 'Kho',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Mã SKU vật liệu',
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
      title: 'Tồn khả dụng hiện tại',
      dataIndex: 'availableGram',
      key: 'availableGram',
      sorter: (a, b) => a.availableGram - b.availableGram,
      render: (gram: number) => {
        const isCritical = gram <= 500;
        return (
          <Tag color={isCritical ? 'error' : 'warning'} style={{ fontWeight: 600 }}>
            {gram} g ({(gram / 1000).toFixed(2)} cuộn)
          </Tag>
        );
      },
    },
    {
      title: 'Đề xuất nhập thêm',
      key: 'recommendation',
      render: (_, record) => {
        const neededGram = Math.max(0, 5000 - Number(record.availableGram));
        const spools = Math.ceil(neededGram / 1000);
        return (
          <Space>
            <ShoppingCartOutlined style={{ color: '#f59e0b' }} />
            <Text strong style={{ color: '#fbbf24' }}>
              +{spools} cuộn ({spools} kg)
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác nhanh',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusCircleOutlined />}
          onClick={() => onOpenReceipt(record.materialId, record.warehouseId)}
        >
          Nhập kho
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
            <span>Cảnh báo Thiếu hụt & Tồn kho Thấp</span>
          </Space>
        }
      >
        <Alert
          message="Tất cả định mức tồn kho vật liệu đang nằm trong ngưỡng đệm an toàn (> 1.5kg khả dụng mỗi SKU)."
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
          <span>Cảnh báo Tồn kho Thấp & Đề xuất Nhập thêm ({lowStockItems.length})</span>
        </Space>
      }
      extra={
        <Tag color="error">Cần xử lý: {lowStockItems.length} mã SKU sắp hết</Tag>
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
