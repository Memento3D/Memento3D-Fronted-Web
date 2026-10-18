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
      message.success('User role updated successfully');
      setSelectedUserForRole(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) => wmsEnterpriseApi.updateUserStatus(userId, active),
    onSuccess: () => {
      message.success('User active status toggled');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const assignWarehousesMutation = useMutation({
    mutationFn: ({ userId, warehouseIds }: { userId: string; warehouseIds: string[] }) => wmsEnterpriseApi.assignWarehouses(userId, warehouseIds),
    onSuccess: () => {
      message.success('Warehouse assignments saved');
      setSelectedUserForWh(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const userColumns = [
    {
      title: 'Full Name / Email',
      key: 'nameEmail',
      render: (_: any, r: UserSummary) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{r.fullName || 'User'}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'ROLE_ADMIN') color = 'magenta';
        else if (role === 'ROLE_MANAGER') color = 'gold';
        else if (role === 'ROLE_WAREHOUSE' || role === 'ROLE_WAREHOUSE_STAFF') color = 'blue';
        else if (role === 'ROLE_OPERATOR') color = 'cyan';
        return <Tag color={color} style={{ fontWeight: 700 }}>{role}</Tag>;
      },
    },
    {
      title: 'Assigned Warehouses',
      dataIndex: 'assignedWarehouseIds',
      key: 'warehouses',
      render: (ids: string[]) => {
        if (!ids || ids.length === 0) return <Text style={{ color: '#64748b' }}>None assigned</Text>;
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
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, r: UserSummary) => (
        <Switch 
          checked={active} 
          checkedChildren="Active" 
          unCheckedChildren="Inactive" 
          onChange={(checked) => updateStatusMutation.mutate({ userId: r.id, active: checked })}
        />
      ),
    },
    {
      title: 'Actions',
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
            Role
          </Button>
          <Button 
            size="small" 
            icon={<WarehouseIcon size={13} />} 
            onClick={() => {
              setSelectedUserForWh(r);
              whForm.setFieldsValue({ warehouseIds: r.assignedWarehouseIds || [] });
            }}
          >
            Warehouses
          </Button>
        </Space>
      ),
    },
  ];

  const auditColumns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      render: (val: string) => <Text style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(val).toLocaleString()}</Text>,
    },
    {
      title: 'Actor',
      dataIndex: 'actorEmail',
      key: 'actor',
      render: (val: string) => <Text strong style={{ color: '#38bdf8' }}>{val || 'SYSTEM'}</Text>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (val: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{val}</Tag>,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (val: string) => <Tag color="cyan">{val}</Tag>,
    },
    {
      title: 'Entity ID',
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
            Enterprise Administration & RBAC
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            System-wide user authority, warehouse allocations, and immutable compliance audit trail
          </Text>
        </div>
        <Button 
          icon={<RefreshCw size={14} />} 
          onClick={() => { refetchDashboard(); refetchUsers(); }}
        >
          Refresh All
        </Button>
      </div>

      {/* Admin KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Users</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>{dashboard?.totalUsers ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Managers</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>{dashboard?.totalManagers ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse Staff</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{dashboard?.totalWarehouseStaff ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Warehouses</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: 4 }}>{dashboard?.totalWarehouses ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Catalog Materials</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>{dashboard?.totalMaterials ?? 0}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Pending Approvals</div>
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
                  <span>User & Role Governance</span>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Input 
                      placeholder="Search users by email or name..." 
                      prefix={<Search size={14} color="#94a3b8" />}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ maxWidth: 300 }}
                      allowClear
                    />
                    <Select
                      placeholder="Filter Role"
                      allowClear
                      value={roleFilter}
                      onChange={(v) => setRoleFilter(v)}
                      style={{ width: 180 }}
                    >
                      <Select.Option value="ROLE_ADMIN">Admin</Select.Option>
                      <Select.Option value="ROLE_MANAGER">Manager</Select.Option>
                      <Select.Option value="ROLE_WAREHOUSE">Warehouse Staff</Select.Option>
                      <Select.Option value="ROLE_OPERATOR">Operator</Select.Option>
                      <Select.Option value="ROLE_PROVIDER">Provider</Select.Option>
                      <Select.Option value="ROLE_DRIVER">Driver</Select.Option>
                      <Select.Option value="ROLE_CUSTOMER">Customer</Select.Option>
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
                  <span>Immutable System Audit Trail</span>
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
        title={`Change Authority Role: ${selectedUserForRole?.email}`}
        open={!!selectedUserForRole}
        onCancel={() => setSelectedUserForRole(null)}
        footer={null}
        width={450}
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
          <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ROLE_ADMIN">ROLE_ADMIN (Full Global Control)</Select.Option>
              <Select.Option value="ROLE_MANAGER">ROLE_MANAGER (Warehouse Approvals & Operations)</Select.Option>
              <Select.Option value="ROLE_WAREHOUSE">ROLE_WAREHOUSE (Receipt, Issue, Count Operations)</Select.Option>
              <Select.Option value="ROLE_OPERATOR">ROLE_OPERATOR (3D Printing Machinery)</Select.Option>
              <Select.Option value="ROLE_PROVIDER">ROLE_PROVIDER (Manufacturing Partner)</Select.Option>
              <Select.Option value="ROLE_DRIVER">ROLE_DRIVER (Logistics & Delivery)</Select.Option>
              <Select.Option value="ROLE_CUSTOMER">ROLE_CUSTOMER (Standard Client)</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setSelectedUserForRole(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updateRoleMutation.isPending}>
              Update Authority
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Warehouse Assignment Modal */}
      <Modal
        title={`Assign Warehouses for: ${selectedUserForWh?.email}`}
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
          <Form.Item name="warehouseIds" label="Assigned Warehouses (Multi-selection)">
            <Select mode="multiple" placeholder="Select warehouses" style={{ width: '100%' }}>
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setSelectedUserForWh(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={assignWarehousesMutation.isPending}>
              Save Scoped Access
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
