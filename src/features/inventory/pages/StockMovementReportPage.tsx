import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  LockOutlined,
  UnlockOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useWarehouses } from '../../warehouse/hooks/useWarehouses';
import { useInventoryTransactions } from '../hooks/useInventory';
import type { InventoryTransaction, InventoryTransactionType } from '../types/inventory.types';

const { Title, Text } = Typography;

export const StockMovementReportPage: React.FC = () => {
  const { message } = App.useApp();
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [txType, setTxType] = useState<InventoryTransactionType | undefined>(undefined);

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: txData, isLoading } = useInventoryTransactions({
    warehouseId: warehouseId || undefined,
    type: txType,
    limit: 100,
  });

  const warehouses = warehousesData?.content || [];
  const transactions = txData?.content || [];

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      message.warning('No transaction records available to export');
      return;
    }

    const headers = [
      'Timestamp',
      'Transaction Type',
      'Warehouse Code',
      'Material SKU',
      'Material Name',
      'Delta On-Hand (g)',
      'Delta Reserved (g)',
      'Before On-Hand (g)',
      'After On-Hand (g)',
      'Reference / Job ID',
    ];

    const rows = transactions.map((t) => [
      `"${new Date(t.createdAt).toLocaleString()}"`,
      `"${t.transactionType}"`,
      `"${t.warehouseCode}"`,
      `"${t.materialSku}"`,
      `"${t.materialName}"`,
      t.deltaOnHandGram,
      t.deltaReservedGram,
      t.beforeOnHandGram,
      t.afterOnHandGram,
      `"${t.printJobId || t.referenceId || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Memento3D_Inventory_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Stock movement audit ledger exported to CSV successfully');
  };

  const renderTypeTag = (type: InventoryTransactionType) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <Tag color="success" icon={<ArrowDownOutlined />}>
            RECEIPT
          </Tag>
        );
      case 'ISSUE':
        return (
          <Tag color="error" icon={<ArrowUpOutlined />}>
            MANUAL ISSUE
          </Tag>
        );
      case 'RESERVATION_HOLD':
        return (
          <Tag color="warning" icon={<LockOutlined />}>
            RESERVATION HOLD
          </Tag>
        );
      case 'RESERVATION_RELEASE':
        return (
          <Tag color="processing" icon={<UnlockOutlined />}>
            RELEASE RESERVATION
          </Tag>
        );
      case 'PRINT_ISSUE':
        return (
          <Tag color="volcano" icon={<ArrowUpOutlined />}>
            PRINT ISSUE
          </Tag>
        );
      case 'PRINT_RETURN':
        return (
          <Tag color="cyan" icon={<ArrowDownOutlined />}>
            PRINT RETURN
          </Tag>
        );
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns: ColumnsType<InventoryTransaction> = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (val: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(val).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: InventoryTransactionType) => renderTypeTag(type),
    },
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
          <Text strong>{sku}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Delta On-Hand',
      dataIndex: 'deltaOnHandGram',
      key: 'deltaOnHandGram',
      render: (delta: number) => {
        if (delta > 0) return <Text strong style={{ color: '#10b981' }}>+{delta} g</Text>;
        if (delta < 0) return <Text strong style={{ color: '#ef4444' }}>{delta} g</Text>;
        return <Text type="secondary">0 g</Text>;
      },
    },
    {
      title: 'Delta Reserved',
      dataIndex: 'deltaReservedGram',
      key: 'deltaReservedGram',
      render: (delta: number) => {
        if (delta > 0) return <Text style={{ color: '#fbbf24' }}>+{delta} g</Text>;
        if (delta < 0) return <Text style={{ color: '#38bdf8' }}>{delta} g</Text>;
        return <Text type="secondary">0 g</Text>;
      },
    },
    {
      title: 'Balance After',
      key: 'balanceAfter',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>On-Hand: {record.afterOnHandGram} g</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>Reserved: {record.afterReservedGram} g</Text>
        </Space>
      ),
    },
    {
      title: 'Reference / Job',
      key: 'reference',
      render: (_, record) => (
        <Text copyable code style={{ fontSize: 11 }}>
          {record.printJobId ? `Job #${record.printJobId.slice(0, 8)}` : record.idempotencyKey?.slice(0, 12) || 'Direct'}
        </Text>
      ),
    },
  ];

  const receiptCount = transactions.filter((t) => t.transactionType === 'RECEIPT').length;
  const issueCount = transactions.filter((t) => t.transactionType === 'ISSUE' || t.transactionType === 'PRINT_ISSUE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Inventory Movement & Audit Ledger (F08)
          </Title>
          <Text type="secondary">
            Immutable, double-entry inventory ledger tracking every stock inbound, allocation hold, and issue.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            Print Report
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Ledger Records"
              value={transactions.length}
              prefix={<HistoryOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Audit entries</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inbound Receipts Logged"
              value={receiptCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<ArrowDownOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Shipments</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Outbound & Production Issues"
              value={issueCount}
              valueStyle={{ color: '#ef4444' }}
              prefix={<ArrowUpOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Deductions</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <FilterOutlined style={{ color: '#0ea5e9' }} />
            <Select
              placeholder="All Warehouses"
              value={warehouseId}
              onChange={(val) => setWarehouseId(val)}
              style={{ width: 220 }}
              allowClear
            >
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Filter Transaction Type"
              value={txType}
              onChange={(val) => setTxType(val)}
              style={{ width: 220 }}
              allowClear
            >
              <Select.Option value="RECEIPT">RECEIPT (Goods In)</Select.Option>
              <Select.Option value="ISSUE">ISSUE (Manual Deduction)</Select.Option>
              <Select.Option value="RESERVATION_HOLD">RESERVATION_HOLD (Job Hold)</Select.Option>
              <Select.Option value="RESERVATION_RELEASE">RESERVATION_RELEASE (Canceled)</Select.Option>
              <Select.Option value="PRINT_ISSUE">PRINT_ISSUE (Sent to Bed)</Select.Option>
              <Select.Option value="PRINT_RETURN">PRINT_RETURN (Unused Returned)</Select.Option>
            </Select>
          </Space>
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Showing {transactions.length} audit transactions
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};
