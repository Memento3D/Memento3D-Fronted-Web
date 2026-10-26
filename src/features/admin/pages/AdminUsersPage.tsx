import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  Avatar,
  message,
  Popconfirm,
  Card,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  UserPlus,
  RefreshCw,
  Eye,
  Edit2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Trash2,
  User,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { getRoleLabel } from '../../../locales/i18n';
import type { AdminUserDetail, AdminCreateUserRequest, AdminUpdateUserRequest } from '../types/admin.types';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
  // Server-driven table state (page/size/sort). Default sort: createdAt DESC.
  const { sorting, pagination, setSorting, setPagination, resetPage, params } = useServerTableState();

  // Stable identity is required: SearchBox re-arms its debounce when onChange changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch((prev) => {
        if (prev !== value) resetPage();
        return value;
      });
    },
    [resetPage],
  );

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Query: Users with server pagination & filters
  const usersFilters = {
    ...params,
    search: search.trim() || undefined,
    role: roleFilter,
    status: statusFilter,
    provider: providerFilter,
  };

  const { data: usersPage, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.users(usersFilters),
    queryFn: ({ signal }) => adminApi.getUsers(usersFilters, signal),
    placeholderData: keepPreviousData,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: AdminCreateUserRequest) => adminApi.createUser(payload),
    onSuccess: () => {
      message.success('Tạo tài khoản người dùng thành công');
      setCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể tạo tài khoản'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateUserRequest }) =>
      adminApi.updateUser(id, payload),
    onSuccess: () => {
      message.success('Cập nhật thông tin tài khoản thành công');
      setEditModalOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
    },
    onError: (err: any) => message.error(err.message || 'Không thể cập nhật tài khoản'),
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => adminApi.lockUser(id),
    onSuccess: () => {
      message.success('Đã khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể khóa tài khoản'),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: string) => adminApi.unlockUser(id),
    onSuccess: () => {
      message.success('Đã mở khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể mở khóa tài khoản'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      message.success('Đã kích hoạt tài khoản');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
    },
    onError: (err: any) => message.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      message.success('Đã tạm ngưng tài khoản');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
    },
    onError: (err: any) => message.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      message.success('Đã xử lý xóa tài khoản an toàn');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersAll });
    },
    onError: (err: any) => message.error(err.message || 'Không thể xóa tài khoản'),
  });

  // Action Guards (Rule 1, 2, 3: Admin cannot lock, deactivate, or delete self)
  const isSelf = (targetUser: AdminUserDetail) => currentUser?.id === targetUser.id;

  const legacyColumns: LegacyColumn<AdminUserDetail>[] = [
    {
      title: 'Tài khoản',
      key: 'user',
      render: (_: any, r: AdminUserDetail) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={r.avatarUrl}
            icon={!r.avatarUrl ? <User size={16} /> : undefined}
            style={{ background: '#6366f1', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {r.fullName || 'Người dùng'}
              {isSelf(r) && (
                <Tag color="volcano" style={{ marginLeft: 6, fontSize: '0.65rem' }}>
                  Bạn
                </Tag>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (val: string) => val || <span style={{ color: 'var(--text-muted)' }}>Chưa cập nhật</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'ROLE_ADMIN') color = 'magenta';
        else if (role === 'ROLE_MANAGER') color = 'gold';
        else if (role === 'ROLE_WAREHOUSE') color = 'blue';
        else if (role === 'ROLE_OPERATOR') color = 'cyan';
        else if (role === 'ROLE_PROVIDER') color = 'purple';
        else if (role === 'ROLE_DRIVER') color = 'orange';
        else if (role === 'ROLE_CUSTOMER') color = 'green';
        return <Tag color={color} style={{ fontWeight: 600 }}>{getRoleLabel(role)}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = status;
        if (status === 'ACTIVE') {
          color = 'success';
          label = 'Hoạt động';
        } else if (status === 'INACTIVE') {
          color = 'warning';
          label = 'Tạm dừng';
        } else if (status === 'LOCKED') {
          color = 'error';
          label = 'Bị khóa';
        } else if (status === 'DELETED') {
          color = 'default';
          label = 'Đã xóa';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Phương thức',
      dataIndex: 'authProvider',
      key: 'authProvider',
      render: (p: string) => (
        <Tag color={p === 'GOOGLE' ? 'geekblue' : 'blue'}>
          {p || 'LOCAL'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (d: string) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (d: string) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {d ? dayjs(d).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      hideable: false,
      render: (_: any, r: AdminUserDetail) => (
        <Space size="small">
          {/* View detail */}
          <Tooltip title="Xem chi tiết hồ sơ & thống kê">
            <Button
              size="small"
              icon={<Eye size={13} />}
              onClick={() => navigate(`/admin/users/${r.id}`)}
            />
          </Tooltip>

          {/* Edit user */}
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              size="small"
              icon={<Edit2 size={13} />}
              onClick={() => {
                setSelectedUser(r);
                editForm.setFieldsValue({
                  fullName: r.fullName,
                  phone: r.phone,
                  role: r.role,
                  status: r.status,
                });
                setEditModalOpen(true);
              }}
            />
          </Tooltip>

          {/* Lock / Unlock */}
          {r.status === 'LOCKED' ? (
            <Tooltip title="Mở khóa tài khoản">
              <Button
                size="small"
                icon={<Unlock size={13} color="#10b981" />}
                onClick={() => unlockMutation.mutate(r.id)}
                loading={unlockMutation.isPending}
              />
            </Tooltip>
          ) : (
            <Popconfirm
              title="Khóa tài khoản người dùng"
              description={`Bạn có chắc chắn muốn khóa tài khoản "${r.email}"? Người dùng này sẽ bị từ chối đăng nhập ngay lập tức.`}
              okText="Khóa tài khoản"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={isSelf(r)}
              onConfirm={() => lockMutation.mutate(r.id)}
            >
              <Tooltip title={isSelf(r) ? 'Không thể tự khóa tài khoản của chính mình' : 'Khóa tài khoản'}>
                <Button
                  size="small"
                  danger
                  icon={<Lock size={13} />}
                  disabled={isSelf(r)}
                  loading={lockMutation.isPending}
                />
              </Tooltip>
            </Popconfirm>
          )}

          {/* Activate / Deactivate */}
          {r.status === 'ACTIVE' ? (
            <Popconfirm
              title="Tạm ngưng tài khoản"
              description={`Xác nhận tạm ngưng hoạt động của tài khoản "${r.email}"?`}
              disabled={isSelf(r)}
              onConfirm={() => deactivateMutation.mutate(r.id)}
            >
              <Tooltip title={isSelf(r) ? 'Không thể tạm ngưng chính mình' : 'Tạm ngưng hoạt động'}>
                <Button size="small" icon={<XCircle size={13} />} disabled={isSelf(r)} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Kích hoạt hoạt động">
              <Button
                size="small"
                icon={<CheckCircle size={13} color="#10b981" />}
                onClick={() => activateMutation.mutate(r.id)}
              />
            </Tooltip>
          )}

          {/* Delete User */}
          <Popconfirm
            title="Xóa tài khoản người dùng"
            description={`Bạn có chắc muốn xóa tài khoản "${r.email}"? Hệ thống sẽ tự động chuyển sang soft-delete an toàn nếu tài khoản có dữ liệu đơn hàng hoặc tác vụ liên quan.`}
            okText="Xóa tài khoản"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={isSelf(r)}
            onConfirm={() => deleteMutation.mutate(r.id)}
          >
            <Tooltip title={isSelf(r) ? 'Không thể xóa tài khoản của chính mình' : 'Xóa tài khoản'}>
              <Button size="small" danger icon={<Trash2 size={13} />} disabled={isSelf(r)} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { table } = useServerTable<AdminUserDetail>({
    data: usersPage?.content ?? [],
    columns: toServerColumns(legacyColumns),
    rowCount: usersPage?.totalElements ?? 0,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
    getRowId: (u) => u.id,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-users-view">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản trị Tài khoản & Phân quyền RBAC
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Toàn quyền quản lý tài khoản khách hàng, nhân viên, gán vai trò và giám sát bảo mật
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <ColumnVisibilityMenu table={table} />
          <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<UserPlus size={15} />}
            onClick={() => {
              createForm.resetFields();
              setCreateModalOpen(true);
            }}
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              fontWeight: 600,
            }}
          >
            Thêm tài khoản mới
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBox
            placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
            value={search}
            onChange={handleSearchChange}
            debounceMs={350}
            width="100%"
            style={{ minWidth: 280, flex: 1 }}
          />

          <Select
            placeholder="Tất cả vai trò"
            allowClear
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v);
              resetPage();
            }}
            style={{ width: 170 }}
          >
            <Select.Option value="ROLE_ADMIN">Quản trị viên (ADMIN)</Select.Option>
            <Select.Option value="ROLE_MANAGER">Quản lý (MANAGER)</Select.Option>
            <Select.Option value="ROLE_WAREHOUSE">Thủ kho (WAREHOUSE)</Select.Option>
            <Select.Option value="ROLE_OPERATOR">Vận hành in 3D (OPERATOR)</Select.Option>
            <Select.Option value="ROLE_PROVIDER">Nhà cung cấp (PROVIDER)</Select.Option>
            <Select.Option value="ROLE_DRIVER">Tài xế (DRIVER)</Select.Option>
            <Select.Option value="ROLE_CUSTOMER">Khách hàng (CUSTOMER)</Select.Option>
          </Select>

          <Select
            placeholder="Trạng thái"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 150 }}
          >
            <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
            <Select.Option value="INACTIVE">Tạm ngưng (INACTIVE)</Select.Option>
            <Select.Option value="LOCKED">Bị khóa (LOCKED)</Select.Option>
            <Select.Option value="DELETED">Đã xóa (DELETED)</Select.Option>
          </Select>

          <Select
            placeholder="Xác thực"
            allowClear
            value={providerFilter}
            onChange={(v) => {
              setProviderFilter(v);
              resetPage();
            }}
            style={{ width: 130 }}
          >
            <Select.Option value="LOCAL">LOCAL</Select.Option>
            <Select.Option value="GOOGLE">GOOGLE</Select.Option>
          </Select>
        </div>
      </Card>

      {/* Users Data Table with Server Pagination */}
      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<AdminUserDetail>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Thêm tài khoản người dùng mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
        width={540}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ role: 'ROLE_CUSTOMER', status: 'ACTIVE' }}
          onFinish={(values) => createMutation.mutate(values)}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn An" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng hợp lệ' },
            ]}
          >
            <Input placeholder="example@memento3d.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                pattern: /^[0-9+() -]{8,15}$/,
                message: 'Số điện thoại không hợp lệ',
              },
            ]}
          >
            <Input placeholder="Ví dụ: 0912345678" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu khởi tạo"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu an toàn..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Vai trò (Role)" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="ROLE_CUSTOMER">Khách hàng (CUSTOMER)</Select.Option>
                  <Select.Option value="ROLE_OPERATOR">Kỹ thuật viên (OPERATOR)</Select.Option>
                  <Select.Option value="ROLE_WAREHOUSE">Thủ kho (WAREHOUSE)</Select.Option>
                  <Select.Option value="ROLE_MANAGER">Quản lý (MANAGER)</Select.Option>
                  <Select.Option value="ROLE_PROVIDER">Nhà cung cấp (PROVIDER)</Select.Option>
                  <Select.Option value="ROLE_DRIVER">Tài xế (DRIVER)</Select.Option>
                  <Select.Option value="ROLE_ADMIN">Quản trị viên (ADMIN)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái khởi tạo" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
                  <Select.Option value="INACTIVE">Tạm ngưng (INACTIVE)</Select.Option>
                  <Select.Option value="LOCKED">Bị khóa (LOCKED)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={`Chỉnh sửa tài khoản: ${selectedUser?.email}`}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedUser) {
              updateMutation.mutate({ id: selectedUser.id, payload: values });
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Vai trò người dùng" rules={[{ required: true }]}>
            <Select disabled={selectedUser ? isSelf(selectedUser) : false}>
              <Select.Option value="ROLE_CUSTOMER">Khách hàng (CUSTOMER)</Select.Option>
              <Select.Option value="ROLE_OPERATOR">Kỹ thuật viên (OPERATOR)</Select.Option>
              <Select.Option value="ROLE_WAREHOUSE">Thủ kho (WAREHOUSE)</Select.Option>
              <Select.Option value="ROLE_MANAGER">Quản lý (MANAGER)</Select.Option>
              <Select.Option value="ROLE_PROVIDER">Nhà cung cấp (PROVIDER)</Select.Option>
              <Select.Option value="ROLE_DRIVER">Tài xế (DRIVER)</Select.Option>
              <Select.Option value="ROLE_ADMIN">Quản trị viên (ADMIN)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select disabled={selectedUser ? isSelf(selectedUser) : false}>
              <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
              <Select.Option value="INACTIVE">Tạm ngưng (INACTIVE)</Select.Option>
              <Select.Option value="LOCKED">Bị khóa (LOCKED)</Select.Option>
              <Select.Option value="DELETED">Đã xóa (DELETED)</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
