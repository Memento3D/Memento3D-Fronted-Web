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
  type GoodsReceipt, 
  type GoodsReceiptStatus 
} from '../api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import { materialApi } from '../../material/api/materialApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { useAuth } from '../../auth/hooks/useAuth';

const { Title, Text } = Typography;

export const GoodsReceiptsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewReceipt, setViewReceipt] = useState<GoodsReceipt | null>(null);

  const [form] = Form.useForm();

  // Queries
  const { data: receiptsData, isLoading } = useQuery({
    queryKey: ['goods-receipts', activeWarehouse?.id, statusFilter, page],
    queryFn: () => wmsEnterpriseApi.getGoodsReceipts({ 
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
    mutationFn: wmsEnterpriseApi.createGoodsReceipt,
    onSuccess: () => {
      message.success('Goods receipt draft created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Failed to create receipt'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitGoodsReceipt,
    onSuccess: () => {
      message.success('Receipt submitted for manager approval');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveGoodsReceipt,
    onSuccess: () => {
      message.success('Receipt approved! Ready for completion.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: wmsEnterpriseApi.completeGoodsReceipt,
    onSuccess: () => {
      message.success('Receipt completed! Inventory increased and ledger updated.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelGoodsReceipt,
    onSuccess: () => {
      message.warning('Receipt cancelled');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate({
      warehouseId: values.warehouseId || activeWarehouse?.id,
      supplierName: values.supplierName,
      referenceNumber: values.referenceNumber,
      notes: values.notes,
      items: values.items.map((i: any) => ({
        materialId: i.materialId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        batchNumber: i.batchNumber,
        notes: i.notes,
      })),
    });
  };

  const getStatusTag = (status: GoodsReceiptStatus) => {
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
      title: 'Receipt Code',
      dataIndex: 'receiptCode',
      key: 'receiptCode',
      render: (code: string, r: GoodsReceipt) => (
        <a onClick={() => setViewReceipt(r)} style={{ fontWeight: 700, color: '#38bdf8' }}>
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
      title: 'Supplier / Ref',
      key: 'supplierRef',
      render: (_: any, r: GoodsReceipt) => (
        <div>
          <div style={{ color: '#cbd5e1' }}>{r.supplierName || '—'}</div>
          {r.referenceNumber && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ref: {r.referenceNumber}</div>}
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
      render: (status: GoodsReceiptStatus) => getStatusTag(status),
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
      render: (_: any, r: GoodsReceipt) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewReceipt(r)}>
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
              title="Complete Receipt?" 
              description="This will atomically increase inventory balances and write to the stock ledger."
              onConfirm={() => completeMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Complete (Stock In)
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || (r.status === 'SUBMITTED' && isManager)) && (
            <Popconfirm title="Cancel Receipt?" onConfirm={() => cancelMutation.mutate(r.id)}>
              <Button size="small" danger icon={<XCircle size={13} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Goods Receipts (Stock In)
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Receiving workflow: DRAFT → SUBMITTED → APPROVED → COMPLETED (Atomic Inventory Addition)
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
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Receipt
          </Button>
        </Space>
      </div>

      {/* Receipts Table */}
      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table 
          columns={columns} 
          dataSource={receiptsData?.content || []} 
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 15,
            total: receiptsData?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Goods Receipt"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id, items: [{}] }}>
          <Form.Item name="warehouseId" label="Target Warehouse" rules={[{ required: true, message: 'Please select warehouse' }]}>
            <Select placeholder="Select warehouse">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="supplierName" label="Supplier / Vendor">
              <Input placeholder="e.g. Polymaker Official" />
            </Form.Item>
            <Form.Item name="referenceNumber" label="PO / Invoice Ref #">
              <Input placeholder="e.g. PO-2026-081" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Delivery conditions, batch inspection details..." />
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
                      style={{ flex: 3, margin: 0 }}
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
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Qty' }]}
                      style={{ flex: 1.5, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="Quantity" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'unitCost']}
                      style={{ flex: 1.5, margin: 0 }}
                    >
                      <InputNumber min={0} placeholder="Cost" style={{ width: '100%' }} />
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
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Create Draft Receipt
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Goods Receipt: ${viewReceipt?.receiptCode}`}
        open={!!viewReceipt}
        onCancel={() => setViewReceipt(null)}
        footer={[
          <Button key="close" onClick={() => setViewReceipt(null)}>Close</Button>,
          viewReceipt?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Submit for Approval
            </Button>
          ),
          viewReceipt?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Approve
            </Button>
          ),
          viewReceipt?.status === 'APPROVED' && (
            <Button key="complete" type="primary" style={{ background: '#10b981' }} onClick={() => { completeMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Complete Receipt (Stock In)
            </Button>
          )
        ]}
        width={700}
      >
        {viewReceipt && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">{getStatusTag(viewReceipt.status)}</Descriptions.Item>
              <Descriptions.Item label="Warehouse">{viewReceipt.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Supplier">{viewReceipt.supplierName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Reference">{viewReceipt.referenceNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{viewReceipt.submittedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{viewReceipt.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(viewReceipt.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Completed At">{viewReceipt.completedAt ? new Date(viewReceipt.completedAt).toLocaleString() : '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: '#e2e8f0', marginTop: 16 }}>Receipt Items</Title>
            <Table
              dataSource={viewReceipt.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Material Name', dataIndex: 'materialName', key: 'name' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <Text strong style={{ color: '#10b981' }}>+{q}</Text> },
                { title: 'Unit Cost', dataIndex: 'unitCost', key: 'cost', render: (c: number) => c ? `$${c.toFixed(2)}` : '—' },
                { title: 'Batch #', dataIndex: 'batchNumber', key: 'batch' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GoodsReceiptsManagementPage;
