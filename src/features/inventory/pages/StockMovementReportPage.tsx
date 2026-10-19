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
      message.warning('Không có bản ghi giao dịch nào để xuất');
      return;
    }

    const headers = [
      'Thời gian',
      'Loại giao dịch',
      'Mã kho',
      'Mã SKU vật liệu',
      'Tên vật liệu',
      'Biến động tồn thực tế (g)',
      'Biến động tạm giữ (g)',
      'Tồn trước giao dịch (g)',
      'Tồn sau giao dịch (g)',
      'Mã tham chiếu / Lệnh in',
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
    link.setAttribute('download', `Memento3D_SoCaiTonKho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất sổ cái biến động kho sang CSV thành công');
  };

  const renderTypeTag = (type: InventoryTransactionType) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <Tag color="success" icon={<ArrowDownOutlined />}>
            NHẬP KHO
          </Tag>
        );
      case 'ISSUE':
        return (
          <Tag color="error" icon={<ArrowUpOutlined />}>
            XUẤT THỦ CÔNG
          </Tag>
        );
      case 'RESERVATION_HOLD':
        return (
          <Tag color="warning" icon={<LockOutlined />}>
            TẠM GIỮ THEO ĐƠN
          </Tag>
        );
      case 'RESERVATION_RELEASE':
        return (
          <Tag color="processing" icon={<UnlockOutlined />}>
            GIẢI PHÓNG TẠM GIỮ
          </Tag>
        );
      case 'PRINT_ISSUE':
        return (
          <Tag color="volcano" icon={<ArrowUpOutlined />}>
            XUẤT SẢN XUẤT IN
          </Tag>
        );
      case 'PRINT_RETURN':
        return (
          <Tag color="cyan" icon={<ArrowDownOutlined />}>
            HOÀN TRẢ SAU IN
          </Tag>
        );
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const columns: ColumnsType<InventoryTransaction> = [
    {
      title: 'Thời gian',
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
      title: 'Loại biến động',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: InventoryTransactionType) => renderTypeTag(type),
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Mã SKU / Vật liệu',
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
      title: 'Biến động tồn thực tế',
      dataIndex: 'deltaOnHandGram',
      key: 'deltaOnHandGram',
      render: (delta: number) => {
        if (delta > 0) return <Text strong style={{ color: '#10b981' }}>+{delta} g</Text>;
        if (delta < 0) return <Text strong style={{ color: '#ef4444' }}>{delta} g</Text>;
        return <Text type="secondary">0 g</Text>;
      },
    },
    {
      title: 'Biến động tạm giữ',
      dataIndex: 'deltaReservedGram',
      key: 'deltaReservedGram',
      render: (delta: number) => {
        if (delta > 0) return <Text style={{ color: '#fbbf24' }}>+{delta} g</Text>;
        if (delta < 0) return <Text style={{ color: '#38bdf8' }}>{delta} g</Text>;
        return <Text type="secondary">0 g</Text>;
      },
    },
    {
      title: 'Số dư sau giao dịch',
      key: 'balanceAfter',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>Tồn thực tế: {record.afterOnHandGram} g</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>Tạm giữ: {record.afterReservedGram} g</Text>
        </Space>
      ),
    },
    {
      title: 'Mã tham chiếu / Lệnh in',
      key: 'reference',
      render: (_, record) => (
        <Text copyable code style={{ fontSize: 11 }}>
          {record.printJobId ? `Lệnh in #${record.printJobId.slice(0, 8)}` : record.idempotencyKey?.slice(0, 12) || 'Trực tiếp'}
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
            Sổ cái biến động kho & Đối soát (F08)
          </Title>
          <Text type="secondary">
            Sổ cái tồn kho bất biến theo dõi toàn bộ hoạt động nhập kho, tạm giữ phân bổ và xuất kho.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Xuất file CSV
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số bản ghi sổ cái"
              value={transactions.length}
              prefix={<HistoryOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Bản ghi</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Lượt nhập kho đã ghi nhận"
              value={receiptCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<ArrowDownOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Lô hàng</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Lượt xuất kho & Sản xuất"
              value={issueCount}
              valueStyle={{ color: '#ef4444' }}
              prefix={<ArrowUpOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Lượt xuất</Text>}
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
              placeholder="Tất cả các kho"
              value={warehouseId}
              onChange={(val) => setWarehouseId(val)}
              style={{ width: 240 }}
              allowClear
            >
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Lọc loại biến động"
              value={txType}
              onChange={(val) => setTxType(val)}
              style={{ width: 260 }}
              allowClear
            >
              <Select.Option value="RECEIPT">NHẬP KHO (Tiếp nhận hàng)</Select.Option>
              <Select.Option value="ISSUE">XUẤT KHO (Xuất thủ công)</Select.Option>
              <Select.Option value="RESERVATION_HOLD">TẠM GIỮ (Theo lệnh in)</Select.Option>
              <Select.Option value="RESERVATION_RELEASE">GIẢI PHÓNG TẠM GIỮ (Hủy lệnh)</Select.Option>
              <Select.Option value="PRINT_ISSUE">XUẤT SẢN XUẤT (Bắt đầu in)</Select.Option>
              <Select.Option value="PRINT_RETURN">HOÀN TRẢ KHO (Dư sau in)</Select.Option>
            </Select>
          </Space>
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Hiển thị {transactions.length} giao dịch kiểm toán
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
