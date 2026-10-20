import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Popconfirm,
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
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  EyeOutlined,
  ExperimentOutlined,
  FireOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMaterials, useMaterialMutations } from '../hooks/useMaterials';
import type { Material, MaterialType, CreateMaterialPayload, UpdateMaterialPayload } from '../types/material.types';
import { MaterialFormModal } from '../components/MaterialFormModal';
import { MaterialDetailDrawer } from '../components/MaterialDetailDrawer';
import { getStatusLabel } from '../../../locales/i18n';

const { Title, Text } = Typography;

export const MaterialManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | undefined>(undefined);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useMaterials({
    search: search || undefined,
    type: typeFilter,
    limit: 100,
  });

  const { createMutation, updateMutation, deactivateMutation } = useMaterialMutations();

  const materials = data?.content || [];
  const activeCount = materials.filter((m) => m.status === 'ACTIVE').length;
  const totalCostSum = materials.reduce((acc, m) => acc + (Number(m.unitCost) || 0), 0);
  const avgCost = materials.length > 0 ? Math.round(totalCostSum / materials.length) : 0;

  const handleOpenCreate = () => {
    setSelectedMaterial(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (material: Material) => {
    setDetailMaterial(material);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (values: CreateMaterialPayload | UpdateMaterialPayload) => {
    try {
      if (selectedMaterial) {
        await updateMutation.mutateAsync({ id: selectedMaterial.id, payload: values });
        message.success(`Đã cập nhật vật liệu SKU: ${selectedMaterial.sku} thành công`);
      } else {
        await createMutation.mutateAsync(values as CreateMaterialPayload);
        message.success('Đã thêm mới vật liệu thành công');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Thao tác không thành công');
    }
  };

  const handleDeactivate = async (id: string, sku: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      message.success(`Vật liệu SKU: ${sku} đã chuyển sang Tạm ngưng`);
    } catch (err: any) {
      message.error(err.message || 'Ngừng kích hoạt vật liệu thất bại');
    }
  };

  const columns: ColumnsType<Material> = [
    {
      title: 'Mã SKU / Tên',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (sku: string, record) => (
        <Space orientation="vertical" size={2}>
          <Text
            strong
            copyable
            style={{ cursor: 'pointer', color: 'var(--primary, #7C5CFC)' }}
            onClick={() => handleOpenDetail(record)}
          >
            {sku}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, color: 'var(--text-secondary, #6A6282)' }}>
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Loại vật liệu',
      dataIndex: 'materialType',
      key: 'materialType',
      filters: [
        { text: 'PLA', value: 'PLA' },
        { text: 'PETG', value: 'PETG' },
        { text: 'ABS', value: 'ABS' },
        { text: 'RESIN', value: 'RESIN' },
        { text: 'TPU', value: 'TPU' },
        { text: 'NYLON', value: 'NYLON' },
      ],
      onFilter: (value, record) => record.materialType === value,
      render: (type: MaterialType) => {
        return (
          <Tag
            style={{
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'var(--surface-container, #F1EBFF)',
              color: 'var(--primary, #7C5CFC)',
              border: '1px solid var(--border-default, #E2D9F7)',
              fontWeight: 600,
              padding: '2px 10px',
            }}
          >
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Màu sắc',
      key: 'color',
      render: (_, record) => (
        <Space>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: record.colorHex || '#64748b',
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          />
          <span>{record.color}</span>
        </Space>
      ),
    },
    {
      title: 'Nhiệt độ in',
      key: 'printTemp',
      responsive: ['md'],
      render: (_, record) => (
        <Space size={4}>
          <FireOutlined style={{ color: '#f97316' }} />
          <span>
            {record.printTempMin && record.printTempMax
              ? `${record.printTempMin}°C - ${record.printTempMax}°C`
              : 'Tiêu chuẩn'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Đơn giá (đ/g)',
      dataIndex: 'unitCost',
      key: 'unitCost',
      sorter: (a, b) => a.unitCost - b.unitCost,
      render: (cost: number) => (
        <Text strong style={{ color: 'var(--tertiary, #466253)' }}>
          {Number(cost).toLocaleString()} đ/g
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag style={{ borderRadius: 'var(--radius-full, 9999px)', background: status === 'ACTIVE' ? 'var(--mint-accent, #C9E8D5)' : 'var(--surface-container, #F1EBFF)', color: status === 'ACTIVE' ? 'var(--tertiary, #466253)' : 'var(--text-secondary, #6A6282)', border: 'none', fontWeight: 600 }}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết hồ sơ vật liệu">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông số">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Ngừng kích hoạt vật liệu"
              description={`Bạn có chắc chắn muốn ngừng kích hoạt SKU ${record.sku}?`}
              onConfirm={() => handleDeactivate(record.id, record.sku)}
              okText="Ngừng kích hoạt"
              cancelText="Hủy"
              okButtonProps={{ danger: true, style: { borderRadius: 'var(--radius-full, 9999px)' } }}
            >
              <Tooltip title="Ngừng kích hoạt">
                <Button type="text" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary, #28243D)' }}>
            Danh mục Vật liệu In 3D
          </Title>
          <Text type="secondary" style={{ color: 'var(--text-secondary, #6A6282)' }}>
            Cơ sở dữ liệu vật liệu in, thông số nhiệt độ đùn và biểu phí đơn giá.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
          style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--primary, #7C5CFC)' }}
        >
          Thêm vật liệu mới
        </Button>
      </div>

      {/* KPI Statistic Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card-standard, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)' }}>Tổng số mã vật liệu</span>}
              value={materials.length}
              valueStyle={{ color: 'var(--text-primary, #28243D)', fontWeight: 800 }}
              prefix={<ExperimentOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>Loại</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card-standard, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)' }}>Vật liệu đang kích hoạt</span>}
              value={activeCount}
              valueStyle={{ color: 'var(--tertiary, #466253)', fontWeight: 800 }}
              prefix={<CheckCircleOutlined style={{ color: 'var(--mint-accent, #C9E8D5)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>Sản xuất</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card-standard, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)' }}>Đơn giá trung bình</span>}
              value={avgCost}
              valueStyle={{ color: 'var(--primary, #7C5CFC)', fontWeight: 800 }}
              prefix={<DollarCircleOutlined style={{ color: 'var(--peach-accent, #FFBFAE)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>VND / g</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar & Data Table */}
      <Card style={{ borderRadius: 'var(--radius-card-standard, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm theo mã SKU, tên, màu sắc..."
              prefix={<SearchOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280, borderRadius: 'var(--radius-input, 20px)' }}
              allowClear
            />
            <Select
              placeholder="Lọc loại nhựa"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              style={{ width: 160 }}
              allowClear
            >
              <Select.Option value="PLA">PLA</Select.Option>
              <Select.Option value="PETG">PETG</Select.Option>
              <Select.Option value="ABS">ABS</Select.Option>
              <Select.Option value="RESIN">RESIN</Select.Option>
              <Select.Option value="TPU">TPU</Select.Option>
              <Select.Option value="NYLON">NYLON</Select.Option>
            </Select>
          </Space>
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Hiển thị {materials.length} vật liệu
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={materials}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered={false}
        />
      </Card>

      {/* Form Modal for Create & Edit */}
      <MaterialFormModal
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        material={selectedMaterial}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Material Detail Drawer */}
      <MaterialDetailDrawer
        material={detailMaterial}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(mat) => {
          setSelectedMaterial(mat);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};
