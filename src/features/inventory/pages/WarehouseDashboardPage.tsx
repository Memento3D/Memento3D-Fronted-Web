import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Select,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  App,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  ExportOutlined,
  FilterOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useInventoryBalances, useInventoryMutations } from '../hooks/useInventory';
import { useWarehouses } from '../../warehouse/hooks/useWarehouses';
import { useMaterials } from '../../material/hooks/useMaterials';
import type { InventoryBalance, CreateStockReceiptPayload, CreateStockIssuePayload } from '../types/inventory.types';
import { InventoryHealthCard } from '../components/InventoryHealthCard';
import { ShortageReportCard } from '../components/ShortageReportCard';
import { StockReceiptModal } from '../components/StockReceiptModal';
import { ManualIssueModal } from '../components/ManualIssueModal';

const { Title, Text } = Typography;

export const WarehouseDashboardPage: React.FC = () => {
  const { message } = App.useApp();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [actionMaterialId, setActionMaterialId] = useState<string | undefined>(undefined);
  const [actionWarehouseId, setActionWarehouseId] = useState<string | undefined>(undefined);

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });

  const {
    data: balancesData,
    isLoading,
    refetch,
    isFetching,
  } = useInventoryBalances({
    warehouseId: selectedWarehouseId || undefined,
    limit: 100,
  });

  const { receiptMutation, issueMutation } = useInventoryMutations();

  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];
  const balances = balancesData?.content || [];

  const totalOnHand = balances.reduce((sum, b) => sum + Number(b.onHandGram), 0);
  const totalReserved = balances.reduce((sum, b) => sum + Number(b.reservedGram), 0);
  const totalAvailable = balances.reduce((sum, b) => sum + Number(b.availableGram), 0);

  const handleOpenReceipt = (matId?: string, whId?: string) => {
    setActionMaterialId(matId);
    setActionWarehouseId(whId || selectedWarehouseId || undefined);
    setIsReceiptOpen(true);
  };

  const handleOpenIssue = (matId?: string, whId?: string) => {
    setActionMaterialId(matId);
    setActionWarehouseId(whId || selectedWarehouseId || undefined);
    setIsIssueOpen(true);
  };

  const handleReceiptSubmit = async (payload: CreateStockReceiptPayload) => {
    try {
      const res = await receiptMutation.mutateAsync(payload);
      message.success(`Đã ghi nhận phiếu nhập #${res.receiptNumber}! Cộng thêm ${payload.quantityGram}g.`);
      setIsReceiptOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Ghi nhận phiếu nhập thất bại');
    }
  };

  const handleIssueSubmit = async (payload: CreateStockIssuePayload) => {
    try {
      const res = await issueMutation.mutateAsync(payload);
      message.success(`Đã ghi nhận phiếu xuất #${res.issueNumber}! Khấu trừ ${payload.quantityGram}g.`);
      setIsIssueOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Ghi nhận phiếu xuất thất bại');
    }
  };

  const columns: ColumnsType<InventoryBalance> = [
    {
      title: 'Kho lưu trữ',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      sorter: (a, b) => a.warehouseCode.localeCompare(b.warehouseCode),
      render: (code: string, record) => (
        <Space orientation="vertical" size={2}>
          <Tag color="blue">{code}</Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.warehouseName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Mã SKU vật liệu',
      dataIndex: 'materialSku',
      key: 'materialSku',
      sorter: (a, b) => a.materialSku.localeCompare(b.materialSku),
      render: (sku: string, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong style={{ color: '#38bdf8' }}>{sku}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Loại vật liệu / Màu sắc',
      key: 'typeColor',
      render: (_, record) => (
        <Space>
          <Tag color="cyan">{record.materialType}</Tag>
          <span>{record.materialColor}</span>
        </Space>
      ),
    },
    {
      title: 'Tồn kho thực tế',
      dataIndex: 'onHandGram',
      key: 'onHandGram',
      sorter: (a, b) => a.onHandGram - b.onHandGram,
      render: (val: number) => (
        <Text strong>
          {(val / 1000).toFixed(2)} kg{' '}
          <Text type="secondary" style={{ fontSize: 11 }}>
            ({val.toLocaleString()}g)
          </Text>
        </Text>
      ),
    },
    {
      title: 'Đã giữ trước',
      dataIndex: 'reservedGram',
      key: 'reservedGram',
      sorter: (a, b) => a.reservedGram - b.reservedGram,
      render: (val: number) => (
        <Text style={{ color: '#fbbf24' }}>
          {(val / 1000).toFixed(2)} kg
        </Text>
      ),
    },
    {
      title: 'Tồn khả dụng',
      dataIndex: 'availableGram',
      key: 'availableGram',
      sorter: (a, b) => a.availableGram - b.availableGram,
      render: (val: number) => {
        const isLow = val < 1500;
        return (
          <Space>
            <Text strong style={{ color: isLow ? '#ef4444' : '#34d399', fontSize: 14 }}>
              {(val / 1000).toFixed(2)} kg
            </Text>
            {isLow && <Tag color="error">Sắp hết</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Nhập kho vật tư">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenReceipt(record.materialId, record.warehouseId)}
            >
              Nhập kho
            </Button>
          </Tooltip>
          <Tooltip title="Xuất hao hụt / Xuất kho">
            <Button
              size="small"
              danger
              icon={<ExportOutlined />}
              onClick={() => handleOpenIssue(record.materialId, record.warehouseId)}
            >
              Xuất kho
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Tổng quan Tồn kho & Quản lý Kho
          </Title>
          <Text type="secondary">
            Giám sát tồn kho đa cơ sở. Quy tắc ACID: Khả dụng = Tồn thực tế - Đã giữ trước.
          </Text>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => handleOpenReceipt()}
          >
            Nhập kho
          </Button>
          <Button
            danger
            icon={<ExportOutlined />}
            size="large"
            onClick={() => handleOpenIssue()}
          >
            Xuất kho thủ công
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng tồn kho thực tế"
              value={(totalOnHand / 1000).toFixed(2)}
              prefix={<DatabaseOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 14 }}>kg</Text>}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Trên {balances.length} bản ghi vật liệu tại các kho
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã giữ trước cho sản xuất"
              value={(totalReserved / 1000).toFixed(2)}
              valueStyle={{ color: '#fbbf24' }}
              prefix={<ClockCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 14 }}>kg</Text>}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phân bổ cho các hàng đợi lệnh in 3D
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng tồn kho khả dụng"
              value={(totalAvailable / 1000).toFixed(2)}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 14 }}>kg</Text>}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sẵn sàng xếp lịch và phân bổ lệnh in
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Visual Inventory Health & Shortage Report Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <InventoryHealthCard balances={balances} />
        </Col>
        <Col xs={24} lg={12}>
          <ShortageReportCard
            balances={balances}
            onOpenReceipt={(matId, whId) => handleOpenReceipt(matId, whId)}
          />
        </Col>
      </Row>

      {/* Main Stock Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <FilterOutlined style={{ color: '#0ea5e9' }} />
            <Text strong>Lọc theo cơ sở kho:</Text>
            <Select
              placeholder="Tất cả cơ sở kho"
              value={selectedWarehouseId}
              onChange={(val) => setSelectedWarehouseId(val)}
              style={{ width: 280 }}
            >
              <Select.Option value="">Tất cả cơ sở kho</Select.Option>
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Hiển thị {balances.length} bản ghi tồn kho
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={balances}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>

      {/* Receipt Modal */}
      <StockReceiptModal
        open={isReceiptOpen}
        onCancel={() => setIsReceiptOpen(false)}
        onSubmit={handleReceiptSubmit}
        warehouses={warehouses}
        materials={materials}
        initialWarehouseId={actionWarehouseId}
        initialMaterialId={actionMaterialId}
        loading={receiptMutation.isPending}
      />

      {/* Manual Issue Modal */}
      <ManualIssueModal
        open={isIssueOpen}
        onCancel={() => setIsIssueOpen(false)}
        onSubmit={handleIssueSubmit}
        warehouses={warehouses}
        materials={materials}
        initialWarehouseId={actionWarehouseId}
        initialMaterialId={actionMaterialId}
        loading={issueMutation.isPending}
      />
    </div>
  );
};
