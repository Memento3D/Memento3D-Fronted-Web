import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
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
  HomeOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useWarehouses, useWarehouseMutations } from '../hooks/useWarehouses';
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload } from '../types/warehouse.types';
import { WarehouseFormModal } from '../components/WarehouseFormModal';
import { WarehouseMembersDrawer } from '../components/WarehouseMembersDrawer';

const { Title, Text } = Typography;

export const WarehouseManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membersWarehouse, setMembersWarehouse] = useState<Warehouse | null>(null);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  const { data, isLoading } = useWarehouses({
    search: search || undefined,
    limit: 50,
  });

  const { createMutation, updateMutation, deactivateMutation } = useWarehouseMutations();

  const warehouses = data?.content || [];
  const activeCount = warehouses.filter((w) => w.status === 'ACTIVE').length;

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CreateWarehousePayload | UpdateWarehousePayload) => {
    try {
      if (selectedWarehouse) {
        await updateMutation.mutateAsync({ id: selectedWarehouse.id, payload: values });
        message.success(`Warehouse ${selectedWarehouse.code} updated successfully`);
      } else {
        await createMutation.mutateAsync(values as CreateWarehousePayload);
        message.success('Warehouse hub registered successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id: string, code: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      message.success(`Warehouse ${code} deactivated`);
    } catch (err: any) {
      message.error(err.message || 'Cannot deactivate warehouse. Ensure inventory is zero.');
    }
  };

  const handleOpenMembers = (warehouse: Warehouse) => {
    setMembersWarehouse(warehouse);
    setIsMembersDrawerOpen(true);
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Warehouse Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code: string) => (
        <Space>
          <HomeOutlined style={{ color: '#0ea5e9' }} />
          <Text strong copyable style={{ color: '#38bdf8' }}>
            {code}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Facility Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Physical Address',
      dataIndex: 'location',
      key: 'location',
      render: (loc: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#94a3b8' }} />
          <span>{loc || 'Primary Manufacturing Facility'}</span>
        </Space>
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
      title: 'Last Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      responsive: ['md'],
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Manage Warehouse Staff & Role Permissions (F01)">
            <Button
              type="text"
              icon={<TeamOutlined style={{ color: '#38bdf8' }} />}
              onClick={() => handleOpenMembers(record)}
            >
              Staff
            </Button>
          </Tooltip>
          <Tooltip title="Edit Facility">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Deactivate Warehouse Hub"
              description={`Are you sure you want to deactivate ${record.code}?`}
              onConfirm={() => handleDeactivate(record.id, record.code)}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Warehouses & Manufacturing Hubs (F02)
          </Title>
          <Text type="secondary">
            Manage physical inventory locations, regional printing hubs, and storage facilities.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          Add Warehouse Hub
        </Button>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Warehouse Facilities"
              value={warehouses.length}
              prefix={<HomeOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Locations</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Operational Hubs"
              value={activeCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Active for Fulfillment</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            placeholder="Search warehouse code or facility name..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Showing {warehouses.length} locations
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <WarehouseFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        warehouse={selectedWarehouse}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Warehouse Staff / Members Drawer (F01) */}
      <WarehouseMembersDrawer
        open={isMembersDrawerOpen}
        warehouse={membersWarehouse}
        onClose={() => setIsMembersDrawerOpen(false)}
      />
    </div>
  );
};
