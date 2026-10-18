import React from 'react';
import {
  Drawer,
  Table,
  Button,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  App,
  Typography,
  Card,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserAddOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { warehouseApi } from '../api/warehouseApi';
import type {
  Warehouse,
  WarehouseMember,
  WarehouseRole,
  AssignMemberPayload,
} from '../types/warehouse.types';

const { Title, Text, Paragraph } = Typography;

interface WarehouseMembersDrawerProps {
  open: boolean;
  warehouse: Warehouse | null;
  onClose: () => void;
}

export const WarehouseMembersDrawer: React.FC<WarehouseMembersDrawerProps> = ({
  open,
  warehouse,
  onClose,
}) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<AssignMemberPayload>();

  const warehouseId = warehouse?.id;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['warehouse-members', warehouseId],
    queryFn: () => (warehouseId ? warehouseApi.getMembers(warehouseId) : Promise.resolve([])),
    enabled: open && !!warehouseId,
  });

  const assignMutation = useMutation({
    mutationFn: (payload: AssignMemberPayload) => {
      if (!warehouseId) throw new Error('Warehouse not selected');
      return warehouseApi.assignMember(warehouseId, payload);
    },
    onSuccess: (newMember) => {
      message.success(`Assigned ${newMember.userEmail} as ${newMember.role}`);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['warehouse-members', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['my-warehouses'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to assign warehouse member');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId: string) => {
      if (!warehouseId) throw new Error('Warehouse not selected');
      return warehouseApi.revokeMember(warehouseId, targetUserId);
    },
    onSuccess: () => {
      message.success('Member access revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouse-members', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['my-warehouses'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Failed to revoke warehouse member');
    },
  });

  const handleAssignSubmit = (values: AssignMemberPayload) => {
    assignMutation.mutate(values);
  };

  const columns: ColumnsType<WarehouseMember> = [
    {
      title: 'Staff Member',
      key: 'user',
      render: (_, record) => (
        <div>
          <Text strong style={{ color: '#f8fafc' }}>
            {record.userFullName || 'Staff User'}
          </Text>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Warehouse Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: WarehouseRole) => {
        let color = 'blue';
        if (role === 'MANAGER') color = 'gold';
        if (role === 'WAREHOUSE_STAFF') color = 'cyan';
        if (role === 'PRINT_OPERATOR') color = 'purple';
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          icon={status === 'ACTIVE' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={status === 'ACTIVE' ? 'success' : 'error'}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => (
        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          {dayjs(date).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'REVOKED') {
          return <Text type="secondary" style={{ fontSize: '0.75rem' }}>Revoked</Text>;
        }
        return (
          <Popconfirm
            title="Revoke Warehouse Access"
            description={`Revoke access for ${record.userEmail}? Even with an active JWT, access will be blocked immediately.`}
            onConfirm={() => revokeMutation.mutate(record.userId)}
            okText="Revoke Access"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: revokeMutation.isPending }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<StopOutlined />}
            >
              Revoke
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#0ea5e9' }} />
          <span>Warehouse Access Control – {warehouse?.code}</span>
        </Space>
      }
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
    >
      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
        Role-based warehouse membership scoping (F01). Staff only have visibility and operational rights over warehouses they are actively assigned to.
      </Paragraph>

      <Card
        size="small"
        title={<span style={{ fontSize: '0.875rem' }}>Assign Staff to Facility</span>}
        style={{ marginBottom: 24, background: 'rgba(15, 23, 42, 0.6)' }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleAssignSubmit}
          initialValues={{ role: 'WAREHOUSE_STAFF' }}
          style={{ rowGap: 12 }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'User email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
            style={{ flex: 1, minWidth: 220 }}
          >
            <Input placeholder="Staff email (e.g. operator@memento3d.vn)" />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Select role' }]}
            style={{ width: 170 }}
          >
            <Select
              options={[
                { value: 'WAREHOUSE_STAFF', label: 'Warehouse Staff' },
                { value: 'MANAGER', label: 'Warehouse Manager' },
                { value: 'PRINT_OPERATOR', label: 'Print Operator' },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UserAddOutlined />}
              loading={assignMutation.isPending}
            >
              Assign Scope
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider style={{ margin: '16px 0' }} />

      <Title level={5} style={{ marginBottom: 12 }}>
        Active & Revoked Memberships ({members.length})
      </Title>

      <Table
        dataSource={members}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 6 }}
        size="middle"
      />
    </Drawer>
  );
};
