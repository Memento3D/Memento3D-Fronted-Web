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
      render: (code: string) => (
        <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary-system, #5F3ADD)', border: '1px solid var(--border-default, #E2D9F7)', fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Mã SKU vật liệu',
      dataIndex: 'materialSku',
      key: 'materialSku',
      render: (sku: string, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>{sku}</Text>
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
          <Tag
            style={{
              borderRadius: 'var(--radius-pill, 9999px)',
              background: isCritical ? 'var(--error-container, #FFDAD6)' : 'var(--secondary-peach, #FFBFAE)',
              color: isCritical ? 'var(--on-error-container, #93000A)' : '#7C3F2E',
              border: 'none',
              fontWeight: 600,
            }}
          >
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
            <ShoppingCartOutlined style={{ color: '#E07A5F' }} />
            <Text strong style={{ color: '#E07A5F' }}>
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
          style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--primary, #7C5CFC)' }}
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
        style={{ borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}
        title={
          <Space>
            <CheckCircleOutlined style={{ color: 'var(--tertiary, #466253)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #28243D)' }}>Cảnh báo Thiếu hụt & Tồn kho Thấp</span>
          </Space>
        }
      >
        <Alert
          message="Tất cả định mức tồn kho vật liệu đang nằm trong ngưỡng đệm an toàn (> 1.5kg khả dụng mỗi SKU)."
          type="success"
          showIcon
          style={{ borderRadius: 'var(--radius-default, 16px)', background: 'var(--tertiary-mint, #C9E8D5)', border: 'none', color: 'var(--tertiary, #466253)' }}
        />
      </Card>
    );
  }

  return (
    <Card
      style={{ borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}
      title={
        <Space>
          <AlertOutlined style={{ color: 'var(--error, #BA1A1A)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #28243D)' }}>Cảnh báo Tồn kho Thấp & Đề xuất Nhập thêm ({lowStockItems.length})</span>
        </Space>
      }
      extra={
        <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--error-container, #FFDAD6)', color: 'var(--on-error-container, #93000A)', border: 'none', fontWeight: 600 }}>
          Cần xử lý: {lowStockItems.length} mã SKU sắp hết
        </Tag>
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
