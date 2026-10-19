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
import { getStatusLabel } from '../../../locales/i18n';

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
        message.success(`Đã cập nhật cơ sở kho ${selectedWarehouse.code} thành công`);
      } else {
        await createMutation.mutateAsync(values as CreateWarehousePayload);
        message.success('Đã thêm mới cơ sở kho thành công');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Thao tác không thành công');
    }
  };

  const handleDeactivate = async (id: string, code: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
      message.success(`Đã ngừng kích hoạt kho ${code}`);
    } catch (err: any) {
      message.error(err.message || 'Không thể ngừng kích hoạt kho. Vui lòng đảm bảo tồn kho bằng 0.');
    }
  };

  const handleOpenMembers = (warehouse: Warehouse) => {
    setMembersWarehouse(warehouse);
    setIsMembersDrawerOpen(true);
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Mã kho',
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
      title: 'Tên cơ sở kho',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Địa chỉ kho',
      dataIndex: 'location',
      key: 'location',
      render: (loc: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#94a3b8' }} />
          <span>{loc || 'Trung tâm Chế tác Chính'}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      responsive: ['md'],
      render: (val: string) => new Date(val).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Quản lý nhân viên & Phân quyền kho">
            <Button
              type="text"
              icon={<TeamOutlined style={{ color: '#38bdf8' }} />}
              onClick={() => handleOpenMembers(record)}
            >
              Nhân viên
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa kho">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="Ngừng kích hoạt kho"
              description={`Bạn có chắc chắn muốn ngừng kích hoạt kho ${record.code}?`}
              onConfirm={() => handleDeactivate(record.id, record.code)}
              okText="Ngừng kích hoạt"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Quản lý Cơ sở Kho & Trung tâm Chế tác
          </Title>
          <Text type="secondary">
            Quản lý các điểm lưu kho vật lý, xưởng in 3D khu vực và cơ sở vật tư.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenCreate}
        >
          Thêm kho mới
        </Button>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng số cơ sở kho"
              value={warehouses.length}
              prefix={<HomeOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Địa điểm</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kho đang hoạt động"
              value={activeCount}
              valueStyle={{ color: '#10b981' }}
              prefix={<CheckCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Sẵn sàng điều phối</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Input
            placeholder="Tìm kiếm theo mã kho hoặc tên cơ sở..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Text type="secondary" style={{ alignSelf: 'center' }}>
            Hiển thị {warehouses.length} cơ sở kho
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
