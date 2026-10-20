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
import { getRoleLabel, getStatusLabel } from '../../../locales/i18n';

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
      if (!warehouseId) throw new Error('Chưa chọn cơ sở kho');
      return warehouseApi.assignMember(warehouseId, payload);
    },
    onSuccess: (newMember) => {
      message.success(`Đã phân công ${newMember.userEmail} vai trò ${getRoleLabel(newMember.role)}`);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['warehouse-members', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['my-warehouses'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Phân công nhân viên thất bại');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId: string) => {
      if (!warehouseId) throw new Error('Chưa chọn cơ sở kho');
      return warehouseApi.revokeMember(warehouseId, targetUserId);
    },
    onSuccess: () => {
      message.success('Đã thu hồi quyền truy cập kho thành công');
      queryClient.invalidateQueries({ queryKey: ['warehouse-members', warehouseId] });
      queryClient.invalidateQueries({ queryKey: ['my-warehouses'] });
    },
    onError: (err: any) => {
      message.error(err.message || 'Thu hồi quyền nhân viên thất bại');
    },
  });

  const handleAssignSubmit = (values: AssignMemberPayload) => {
    assignMutation.mutate(values);
  };

  const columns: ColumnsType<WarehouseMember> = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <div>
          <Text strong style={{ color: 'var(--text-primary, #28243D)' }}>
            {record.userFullName || 'Nhân viên'}
          </Text>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6A6282)' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò trong kho',
      dataIndex: 'role',
      key: 'role',
      render: (role: WarehouseRole) => {
        return (
          <Tag style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary, #7C5CFC)', border: '1px solid var(--border-default, #E2D9F7)', fontWeight: 600 }}>
            {getRoleLabel(role)}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          icon={status === 'ACTIVE' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ borderRadius: 'var(--radius-full, 9999px)', background: status === 'ACTIVE' ? 'var(--mint-accent, #C9E8D5)' : 'var(--error-container, #FFDAD6)', color: status === 'ACTIVE' ? 'var(--tertiary, #466253)' : 'var(--on-error-container, #93000A)', border: 'none', fontWeight: 600 }}
        >
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày phân công',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6A6282)' }}>
          {dayjs(date).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'REVOKED') {
          return <Text type="secondary" style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6A6282)' }}>Đã thu hồi</Text>;
        }
        return (
          <Popconfirm
            title="Thu hồi quyền truy cập kho"
            description={`Thu hồi quyền truy cập kho của ${record.userEmail}? Tài khoản sẽ bị ngắt quyền ngay lập tức.`}
            onConfirm={() => revokeMutation.mutate(record.userId)}
            okText="Thu hồi quyền"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: revokeMutation.isPending, style: { borderRadius: 'var(--radius-full, 9999px)' } }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<StopOutlined />}
            >
              Thu hồi
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
          <SafetyCertificateOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
          <span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700 }}>Kiểm soát Quyền Truy cập Kho – {warehouse?.code}</span>
        </Space>
      }
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
    >
      <Paragraph type="secondary" style={{ marginBottom: 20, color: 'var(--text-secondary, #6A6282)' }}>
        Phân quyền kho theo vai trò (RBAC). Nhân viên chỉ có quyền xem và thao tác trên cơ sở kho mà họ được phân công trực tiếp.
      </Paragraph>

      <Card
        size="small"
        title={<span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #28243D)' }}>Phân công Nhân viên vào Kho</span>}
        style={{ marginBottom: 24, background: 'var(--surface-container, #F1EBFF)', border: '1px solid var(--border-default, #E2D9F7)', borderRadius: 'var(--radius-default, 16px)' }}
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
              { required: true, message: 'Email nhân viên không được để trống' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
            style={{ flex: 1, minWidth: 220 }}
          >
            <Input placeholder="Email nhân viên (ví dụ: operator@memento3d.vn)" style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            style={{ width: 180 }}
          >
            <Select
              options={[
                { value: 'WAREHOUSE_STAFF', label: 'Nhân viên kho' },
                { value: 'MANAGER', label: 'Quản lý kho' },
                { value: 'PRINT_OPERATOR', label: 'Kỹ thuật viên in' },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UserAddOutlined />}
              loading={assignMutation.isPending}
              style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--primary, #7C5CFC)' }}
            >
              Phân công
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider style={{ margin: '16px 0', borderColor: 'var(--border-default, #E2D9F7)' }} />

      <Title level={5} style={{ marginBottom: 12, color: 'var(--text-primary, #28243D)', fontWeight: 700 }}>
        Danh sách Thành viên & Quyền truy cập ({members.length})
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
