import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  Button, 
  Tag, 
  Card, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message, 
  Typography, 
  Popconfirm,
  Descriptions,
  Divider
} from 'antd';
import { 
  Plus, 
  Check, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { 
  wmsEnterpriseApi, 
  type StockIssue, 
  type StockIssueStatus 
} from '../api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import { materialApi } from '../../material/api/materialApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { useAuth } from '../../auth/hooks/useAuth';

const { Title, Text } = Typography;

export const StockIssuesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewIssue, setViewIssue] = useState<StockIssue | null>(null);

  const [form] = Form.useForm();

  // Queries
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['stock-issues', activeWarehouse?.id, statusFilter, page],
    queryFn: () => wmsEnterpriseApi.getStockIssues({ 
      warehouseId: activeWarehouse?.id, 
      status: statusFilter, 
      page, 
      size: 15 
    }),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials-active'],
    queryFn: () => materialApi.list({ status: 'ACTIVE', limit: 100 }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-active'],
    queryFn: () => warehouseApi.list({ status: 'ACTIVE', limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: wmsEnterpriseApi.createStockIssue,
    onSuccess: () => {
      message.success('Stock issue draft created');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Failed to create issue'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitStockIssue,
    onSuccess: () => {
      message.success('Stock issue submitted for manager approval');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveStockIssue,
    onSuccess: () => {
      message.success('Stock issue approved');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: wmsEnterpriseApi.completeStockIssue,
    onSuccess: () => {
      message.success('Stock issue completed! Stock deducted and ledger updated.');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelStockIssue,
    onSuccess: () => {
      message.warning('Stock issue cancelled');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate({
      warehouseId: values.warehouseId || activeWarehouse?.id,
      referenceType: values.referenceType,
      referenceId: values.referenceId,
      reason: values.reason,
      items: values.items.map((i: any) => ({
        materialId: i.materialId,
        requestedQuantity: i.requestedQuantity,
        notes: i.notes,
      })),
    });
  };

  const getStatusTag = (status: StockIssueStatus) => {
    switch (status) {
      case 'DRAFT': return <Tag color="default">DRAFT</Tag>;
      case 'SUBMITTED': return <Tag color="blue">SUBMITTED</Tag>;
      case 'APPROVED': return <Tag color="gold">APPROVED</Tag>;
      case 'COMPLETED': return <Tag color="green">COMPLETED</Tag>;
      case 'CANCELLED': return <Tag color="red">CANCELLED</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Issue Code',
      dataIndex: 'issueCode',
      key: 'issueCode',
      render: (code: string, r: StockIssue) => (
        <a onClick={() => setViewIssue(r)} style={{ fontWeight: 700, color: '#f43f5e' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (name: string) => <Text strong style={{ color: '#e2e8f0' }}>{name || 'Warehouse'}</Text>,
    },
    {
      title: 'Ref / Purpose',
      key: 'ref',
      render: (_: any, r: StockIssue) => (
        <div>
          <Tag color="cyan">{r.referenceType || 'MANUAL'}</Tag>
          {r.reason && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.reason}</div>}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => <Text style={{ color: '#94a3b8' }}>{items?.length || 0} line items</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockIssueStatus) => getStatusTag(status),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => <Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(val).toLocaleDateString()}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: StockIssue) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewIssue(r)}>
            View
          </Button>

          {r.status === 'DRAFT' && (
            <Button 
              size="small" 
              type="primary" 
              icon={<Send size={13} />} 
              onClick={() => submitMutation.mutate(r.id)}
            >
              Submit
            </Button>
          )}

          {r.status === 'SUBMITTED' && isManager && (
            <Button 
              size="small" 
              style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }} 
              icon={<Check size={13} />} 
              onClick={() => approveMutation.mutate(r.id)}
            >
              Approve
            </Button>
          )}

          {r.status === 'APPROVED' && (
            <Popconfirm 
              title="Complete Issue?" 
              description="This will atomically deduct inventory balances and check against available stock."
              onConfirm={() => completeMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Complete (Stock Out)
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || (r.status === 'SUBMITTED' && isManager)) && (
            <Popconfirm title="Cancel Issue?" onConfirm={() => cancelMutation.mutate(r.id)}>
              <Button size="small" danger icon={<XCircle size={13} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Stock Issues (Stock Out)
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Issuing workflow: DRAFT → SUBMITTED → APPROVED → COMPLETED (Atomic Inventory Deduction with Negative-Stock Guard)
          </Text>
        </div>
        <Space>
          <Select
            placeholder="Filter by Status"
            allowClear
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 160 }}
          >
            <Select.Option value="DRAFT">Draft</Select.Option>
            <Select.Option value="SUBMITTED">Submitted</Select.Option>
            <Select.Option value="APPROVED">Approved</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#f43f5e', borderColor: '#f43f5e', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Issue Request
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table 
          columns={columns} 
          dataSource={issuesData?.content || []} 
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 15,
            total: issuesData?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Stock Issue"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id, referenceType: 'PRINT_JOB', items: [{}] }}>
          <Form.Item name="warehouseId" label="Source Warehouse" rules={[{ required: true, message: 'Please select warehouse' }]}>
            <Select placeholder="Select warehouse">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="referenceType" label="Issue Category" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="PRINT_JOB">Print Job Production</Select.Option>
                <Select.Option value="PACKAGING">Packaging / Dispatch</Select.Option>
                <Select.Option value="DAMAGED">Damaged / Expired</Select.Option>
                <Select.Option value="WASTE">Purge / Prototype Waste</Select.Option>
                <Select.Option value="MANUAL">Manual Issue</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="referenceId" label="Reference ID / Job Code">
              <Input placeholder="e.g. PJ-9842" />
            </Form.Item>
          </div>

          <Form.Item name="reason" label="Reason & Details" rules={[{ required: true, message: 'Please specify reason' }]}>
            <Input.TextArea rows={2} placeholder="Reason for issuing materials..." />
          </Form.Item>

          <Divider style={{ color: '#94a3b8' }}>Line Items</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'materialId']}
                      rules={[{ required: true, message: 'Select material' }]}
                      style={{ flex: 4, margin: 0 }}
                    >
                      <Select placeholder="Material SKU / Name" showSearch optionFilterProp="children">
                        {materialsData?.content?.map((m: any) => (
                          <Select.Option key={m.id} value={m.id}>
                            [{m.sku}] {m.name} ({m.color || 'Standard'})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'requestedQuantity']}
                      rules={[{ required: true, message: 'Qty' }]}
                      style={{ flex: 2, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="Requested Qty" style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => remove(name)} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                  + Add Item
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ background: '#f43f5e', borderColor: '#f43f5e' }}>
              Create Draft Issue
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Stock Issue: ${viewIssue?.issueCode}`}
        open={!!viewIssue}
        onCancel={() => setViewIssue(null)}
        footer={[
          <Button key="close" onClick={() => setViewIssue(null)}>Close</Button>,
          viewIssue?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Submit for Approval
            </Button>
          ),
          viewIssue?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Approve
            </Button>
          ),
          viewIssue?.status === 'APPROVED' && (
            <Button key="complete" type="primary" style={{ background: '#10b981' }} onClick={() => { completeMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Complete Issue (Stock Out)
            </Button>
          )
        ]}
        width={700}
      >
        {viewIssue && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">{getStatusTag(viewIssue.status)}</Descriptions.Item>
              <Descriptions.Item label="Warehouse">{viewIssue.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Category">{viewIssue.referenceType || 'MANUAL'}</Descriptions.Item>
              <Descriptions.Item label="Reference ID">{viewIssue.referenceId || '—'}</Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>{viewIssue.reason || '—'}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{viewIssue.submittedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{viewIssue.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(viewIssue.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Completed At">{viewIssue.completedAt ? new Date(viewIssue.completedAt).toLocaleString() : '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: '#e2e8f0', marginTop: 16 }}>Items Issued</Title>
            <Table
              dataSource={viewIssue.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Material Name', dataIndex: 'materialName', key: 'name' },
                { title: 'Requested Qty', dataIndex: 'requestedQuantity', key: 'rq', render: (q: number) => <Text strong style={{ color: '#f43f5e' }}>-{q}</Text> },
                { title: 'Issued Qty', dataIndex: 'issuedQuantity', key: 'iq' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StockIssuesManagementPage;
