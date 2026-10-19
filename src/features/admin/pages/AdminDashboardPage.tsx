import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Switch, 
  message, 
  Tabs 
} from 'antd';
import { 
  Users, 
  FileText, 
  RefreshCw, 
  Search, 
  UserCog, 
  Warehouse as WarehouseIcon 
} from 'lucide-react';
import { 
  wmsEnterpriseApi, 
  type AdminDashboardData, 
  type UserSummary 
} from '../../inventory/api/wmsEnterpriseApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { getRoleLabel } from '../../../locales/i18n';

const { Title, Text } = Typography;

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [userPage, setUserPage] = useState<number>(0);

  // Modals state
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserSummary | null>(null);
  const [selectedUserForWh, setSelectedUserForWh] = useState<UserSummary | null>(null);
  const [roleForm] = Form.useForm();
  const [whForm] = Form.useForm();

  // Queries
  const { data: dashboard, refetch: refetchDashboard } = useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: wmsEnterpriseApi.getAdminDashboard,
    refetchInterval: 15000,
  });

  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', userSearch, roleFilter, userPage],
    queryFn: () => wmsEnterpriseApi.getUsers({ search: userSearch, role: roleFilter, page: userPage, size: 10 }),
  });

  const { data: auditLogsData, isLoading: loadingAudit } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => wmsEnterpriseApi.getAuditLogs({ size: 50 }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['all-warehouses'],
    queryFn: () => warehouseApi.list({ limit: 100 }),
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => wmsEnterpriseApi.updateUserRole(userId, role),
    onSuccess: () => {
      message.success('Cập nhật vai trò người dùng thành công');
      setSelectedUserForRole(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) => wmsEnterpriseApi.updateUserStatus(userId, active),
    onSuccess: () => {
      message.success('Đã thay đổi trạng thái hoạt động của người dùng');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const assignWarehousesMutation = useMutation({
    mutationFn: ({ userId, warehouseIds }: { userId: string; warehouseIds: string[] }) => wmsEnterpriseApi.assignWarehouses(userId, warehouseIds),
    onSuccess: () => {
      message.success('Đã lưu phân quyền kho cho người dùng');
      setSelectedUserForWh(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const userColumns = [
    {
      title: 'Họ và tên / Email',
      key: 'nameEmail',
      render: (_: any, r: UserSummary) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{r.fullName || 'Người dùng'}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'ROLE_ADMIN') color = 'magenta';
        else if (role === 'ROLE_MANAGER') color = 'gold';
        else if (role === 'ROLE_WAREHOUSE' || role === 'ROLE_WAREHOUSE_STAFF') color = 'blue';
        else if (role === 'ROLE_OPERATOR') color = 'cyan';
        return <Tag color={color} style={{ fontWeight: 700 }}>{getRoleLabel(role)}</Tag>;
      },
    },
    {
      title: 'Kho được phân quyền',
      dataIndex: 'assignedWarehouseIds',
      key: 'warehouses',
      render: (ids: string[]) => {
        if (!ids || ids.length === 0) return <Text style={{ color: '#64748b' }}>Chưa phân quyền kho</Text>;
        return (
          <Space wrap size={[4, 4]}>
            {ids.map((id) => {
              const wh = warehousesData?.content?.find((w: any) => w.id === id);
              return <Tag key={id} color="purple">{wh ? wh.code : id.substring(0, 8)}</Tag>;
            })}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, r: UserSummary) => (
        <Switch 
          checked={active} 
          checkedChildren="Hoạt động" 
          unCheckedChildren="Khóa" 
          onChange={(checked) => updateStatusMutation.mutate({ userId: r.id, active: checked })}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: UserSummary) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<UserCog size={13} />} 
            onClick={() => {
              setSelectedUserForRole(r);
              roleForm.setFieldsValue({ role: r.role });
            }}
          >
            Vai trò
          </Button>
          <Button 
            size="small" 
            icon={<WarehouseIcon size={13} />} 
            onClick={() => {
              setSelectedUserForWh(r);
              whForm.setFieldsValue({ warehouseIds: r.assignedWarehouseIds || [] });
            }}
          >
            Phân quyền kho
          </Button>
        </Space>
      ),
    },
  ];

  const auditColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'time',
      render: (val: string) => <Text style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(val).toLocaleString()}</Text>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'actorEmail',
      key: 'actor',
      render: (val: string) => <Text strong style={{ color: '#38bdf8' }}>{val || 'HỆ THỐNG'}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (val: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{val}</Tag>,
    },
    {
      title: 'Loại đối tượng',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (val: string) => <Tag color="cyan">{val}</Tag>,
    },
    {
      title: 'Mã đối tượng',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (val: string) => <Text code style={{ fontSize: '0.75rem' }}>{val || '—'}</Text>,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Quản trị hệ thống & Phân quyền RBAC
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Quản lý phân quyền tài khoản toàn hệ thống, gán quyền kho và theo dõi lịch sử kiểm toán tuân thủ
          </Text>
        </div>
        <Button 
          icon={<RefreshCw size={14} />} 
          onClick={() => { refetchDashboard(); refetchUsers(); }}
        >
          Làm mới tất cả
        </Button>
      </div>

      {/* Admin KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Tổng tài khoản</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>{dashboard?.totalUsers ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Quản lý</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>{dashboard?.totalManagers ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Nhân viên kho</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{dashboard?.totalWarehouseStaff ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Kho hàng</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: 4 }}>{dashboard?.totalWarehouses ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Vật liệu trong danh mục</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>{dashboard?.totalMaterials ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Chờ phê duyệt</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e', marginTop: 4 }}>{dashboard?.pendingApprovals ?? 0}</div>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs: Users vs Audit Log */}
      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'users',
              label: (
                <Space>
                  <Users size={16} />
                  <span>Quản trị người dùng & Phân quyền</span>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Input 
                      placeholder="Tìm người dùng theo email hoặc họ tên..." 
                      prefix={<Search size={14} color="#94a3b8" />}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ maxWidth: 320 }}
                      allowClear
                    />
                    <Select
                      placeholder="Lọc theo vai trò"
                      allowClear
                      value={roleFilter}
                      onChange={(v) => setRoleFilter(v)}
                      style={{ width: 200 }}
                    >
                      <Select.Option value="ROLE_ADMIN">Quản trị viên</Select.Option>
                      <Select.Option value="ROLE_MANAGER">Quản lý</Select.Option>
                      <Select.Option value="ROLE_WAREHOUSE">Nhân viên kho</Select.Option>
                      <Select.Option value="ROLE_OPERATOR">Vận hành máy in</Select.Option>
                      <Select.Option value="ROLE_PROVIDER">Nhà cung cấp</Select.Option>
                      <Select.Option value="ROLE_DRIVER">Tài xế giao hàng</Select.Option>
                      <Select.Option value="ROLE_CUSTOMER">Khách hàng</Select.Option>
                    </Select>
                  </div>

                  <Table 
                    columns={userColumns} 
                    dataSource={usersData?.content || []} 
                    rowKey="id"
                    loading={loadingUsers}
                    pagination={{
                      current: userPage + 1,
                      pageSize: 10,
                      total: usersData?.totalElements || 0,
                      onChange: (p) => setUserPage(p - 1),
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'audit',
              label: (
                <Space>
                  <FileText size={16} />
                  <span>Nhật ký kiểm toán hệ thống</span>
                </Space>
              ),
              children: (
                <Table 
                  columns={auditColumns} 
                  dataSource={auditLogsData?.content || []} 
                  rowKey="id" 
                  loading={loadingAudit}
                  pagination={{ pageSize: 15 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Role Assignment Modal */}
      <Modal
        title={`Thay đổi vai trò người dùng: ${selectedUserForRole?.email}`}
        open={!!selectedUserForRole}
        onCancel={() => setSelectedUserForRole(null)}
        footer={null}
        width={500}
      >
        <Form 
          form={roleForm} 
          layout="vertical" 
          onFinish={(values) => {
            if (selectedUserForRole) {
              updateRoleMutation.mutate({ userId: selectedUserForRole.id, role: values.role });
            }
          }}
        >
          <Form.Item name="role" label="Gán vai trò mới" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select>
              <Select.Option value="ROLE_ADMIN">ROLE_ADMIN (Toàn quyền quản trị hệ thống)</Select.Option>
              <Select.Option value="ROLE_MANAGER">ROLE_MANAGER (Quản lý phê duyệt & vận hành kho)</Select.Option>
              <Select.Option value="ROLE_WAREHOUSE">ROLE_WAREHOUSE (Nhân viên nhập/xuất/kiểm kê kho)</Select.Option>
              <Select.Option value="ROLE_OPERATOR">ROLE_OPERATOR (Kỹ thuật viên vận hành máy in 3D)</Select.Option>
              <Select.Option value="ROLE_PROVIDER">ROLE_PROVIDER (Đối tác sản xuất / gia công)</Select.Option>
              <Select.Option value="ROLE_DRIVER">ROLE_DRIVER (Tài xế giao vận hậu cần)</Select.Option>
              <Select.Option value="ROLE_CUSTOMER">ROLE_CUSTOMER (Khách hàng tiêu chuẩn)</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setSelectedUserForRole(null)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={updateRoleMutation.isPending}>
              Cập nhật phân quyền
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Warehouse Assignment Modal */}
      <Modal
        title={`Phân quyền kho cho: ${selectedUserForWh?.email}`}
        open={!!selectedUserForWh}
        onCancel={() => setSelectedUserForWh(null)}
        footer={null}
        width={500}
      >
        <Form 
          form={whForm} 
          layout="vertical" 
          onFinish={(values) => {
            if (selectedUserForWh) {
              assignWarehousesMutation.mutate({ userId: selectedUserForWh.id, warehouseIds: values.warehouseIds || [] });
            }
          }}
        >
          <Form.Item name="warehouseIds" label="Danh sách kho được phân quyền (Chọn nhiều kho)">
            <Select mode="multiple" placeholder="Chọn các kho hàng" style={{ width: '100%' }}>
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setSelectedUserForWh(null)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={assignWarehousesMutation.isPending}>
              Lưu phân quyền kho
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
