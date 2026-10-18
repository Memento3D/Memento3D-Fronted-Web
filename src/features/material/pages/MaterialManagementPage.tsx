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
        message.success(`Material SKU: ${selectedMaterial.sku} updated successfully`);
      } else {
        await createMutation.mutateAsync(values as CreateMaterialPayload);
        message.success('New material registered successfully');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id: string, sku: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      message.success(`Material SKU: ${sku} marked as INACTIVE`);
    } catch (err: any) {
      message.error(err.message || 'Failed to deactivate material');
    }
  };

  const columns: ColumnsType<Material> = [
    {
      title: 'SKU / Code',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (sku: string, record) => (
        <Space orientation="vertical" size={2}>
          <Text
            strong
            copyable
            style={{ cursor: 'pointer', color: '#38bdf8' }}
            onClick={() => handleOpenDetail(record)}
          >
            {sku}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Polymer Type',
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
        let color = 'cyan';
        if (type === 'PETG') color = 'blue';
        if (type === 'ABS') color = 'volcano';
        if (type === 'RESIN') color = 'purple';
        if (type === 'TPU') color = 'green';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Color & Swatch',
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
      title: 'Print Temp',
      key: 'printTemp',
      responsive: ['md'],
      render: (_, record) => (
        <Space size={4}>
          <FireOutlined style={{ color: '#f97316' }} />
          <span>
            {record.printTempMin && record.printTempMax
              ? `${record.printTempMin}°C - ${record.printTempMax}°C`
              : 'Standard'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      sorter: (a, b) => a.unitCost - b.unitCost,
      render: (cost: number) => (
        <Text strong style={{ color: '#34d399' }}>
          {Number(cost).toLocaleString()} đ/g
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Detailed Profile">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Properties">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Deactivate Material"
              description={`Are you sure you want to disable SKU ${record.sku}?`}
              onConfirm={() => handleDeactivate(record.id, record.sku)}
              okText="Deactivate"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Deactivate">
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
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Materials Catalog (F01)
          </Title>
          <Text type="secondary">
            Master database of technical filaments, thermal extrusions, and unit cost profiles.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          New Material SKU
        </Button>
      </div>

      {/* KPI Statistic Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Material SKUs"
              value={materials.length}
              prefix={<ExperimentOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Profiles</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Printing Profiles"
              value={activeCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>In Production</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Unit Cost"
              value={avgCost}
              valueStyle={{ color: '#38bdf8' }}
              prefix={<DollarCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>VND / g</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar & Data Table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Input
              placeholder="Search by SKU, name, color..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              placeholder="Filter Polymer"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              style={{ width: 150 }}
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
            Showing {materials.length} records
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
