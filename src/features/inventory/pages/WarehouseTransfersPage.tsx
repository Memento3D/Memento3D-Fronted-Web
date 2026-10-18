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
  Truck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2 
} from 'lucide-react';
import { 
  wmsEnterpriseApi, 
  type WarehouseTransfer, 
  type WarehouseTransferStatus 
} from '../api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import { materialApi } from '../../material/api/materialApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { useAuth } from '../../auth/hooks/useAuth';

const { Title, Text } = Typography;

export const WarehouseTransfersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewTransfer, setViewTransfer] = useState<WarehouseTransfer | null>(null);

  const [form] = Form.useForm();

  const { data: transfersData, isLoading } = useQuery({
    queryKey: ['warehouse-transfers', activeWarehouse?.id, statusFilter, page],
    queryFn: () => wmsEnterpriseApi.getTransfers({ 
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

  const createMutation = useMutation({
    mutationFn: wmsEnterpriseApi.createTransfer,
    onSuccess: () => {
      message.success('Warehouse transfer draft created');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Failed to create transfer'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitTransfer,
    onSuccess: () => {
      message.success('Transfer submitted for manager approval');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveTransfer,
    onSuccess: () => {
      message.success('Transfer approved! Ready to ship.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const shipMutation = useMutation({
    mutationFn: wmsEnterpriseApi.shipTransfer,
    onSuccess: () => {
      message.success('Transfer marked IN_TRANSIT! Source stock deducted.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const receiveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.receiveTransfer,
    onSuccess: () => {
      message.success('Transfer received! Destination inventory credited.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelTransfer,
    onSuccess: () => {
      message.warning('Transfer cancelled');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    if (values.sourceWarehouseId === values.destinationWarehouseId) {
      message.error('Source and Destination warehouse must be different');
      return;
    }

    createMutation.mutate({
      sourceWarehouseId: values.sourceWarehouseId,
      destinationWarehouseId: values.destinationWarehouseId,
      notes: values.notes,
      items: values.items.map((i: any) => ({
        materialId: i.materialId,
        quantity: i.quantity,
        notes: i.notes,
      })),
    });
  };

  const getStatusTag = (status: WarehouseTransferStatus) => {
    switch (status) {
      case 'DRAFT': return <Tag color="default">DRAFT</Tag>;
      case 'SUBMITTED': return <Tag color="blue">SUBMITTED</Tag>;
      case 'APPROVED': return <Tag color="gold">APPROVED</Tag>;
      case 'IN_TRANSIT': return <Tag color="purple">IN TRANSIT</Tag>;
      case 'RECEIVED': return <Tag color="green">RECEIVED</Tag>;
      case 'CANCELLED': return <Tag color="red">CANCELLED</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Transfer Code',
      dataIndex: 'transferCode',
      key: 'transferCode',
      render: (code: string, r: WarehouseTransfer) => (
        <a onClick={() => setViewTransfer(r)} style={{ fontWeight: 700, color: '#a855f7' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Source Warehouse',
      dataIndex: 'sourceWarehouseName',
      key: 'sourceWarehouseName',
      render: (name: string) => <Text strong style={{ color: '#f87171' }}>{name}</Text>,
    },
    {
      title: 'Destination Warehouse',
      dataIndex: 'destinationWarehouseName',
      key: 'destinationWarehouseName',
      render: (name: string) => <Text strong style={{ color: '#34d399' }}>{name}</Text>,
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
      render: (status: WarehouseTransferStatus) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: WarehouseTransfer) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewTransfer(r)}>
            View
          </Button>

          {r.status === 'DRAFT' && (
            <Button size="small" type="primary" icon={<Send size={13} />} onClick={() => submitMutation.mutate(r.id)}>
              Submit
            </Button>
          )}

          {r.status === 'SUBMITTED' && isManager && (
            <Button size="small" style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }} icon={<Check size={13} />} onClick={() => approveMutation.mutate(r.id)}>
              Approve
            </Button>
          )}

          {r.status === 'APPROVED' && (
            <Popconfirm title="Dispatch & Ship Transfer?" description="This will deduct inventory from source warehouse." onConfirm={() => shipMutation.mutate(r.id)}>
              <Button size="small" type="primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }} icon={<Truck size={13} />}>
                Ship
              </Button>
            </Popconfirm>
          )}

          {r.status === 'IN_TRANSIT' && (
            <Popconfirm title="Confirm Goods Received?" description="This will add items to destination warehouse inventory." onConfirm={() => receiveMutation.mutate(r.id)}>
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Receive
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || r.status === 'SUBMITTED') && (
            <Popconfirm title="Cancel Transfer?" onConfirm={() => cancelMutation.mutate(r.id)}>
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
            Inter-Warehouse Transfers
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Transfer workflow: DRAFT → SUBMITTED → APPROVED → IN_TRANSIT (Ship) → RECEIVED (Destination Receive)
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
            <Select.Option value="IN_TRANSIT">In Transit</Select.Option>
            <Select.Option value="RECEIVED">Received</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#a855f7', borderColor: '#a855f7', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Transfer Request
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table 
          columns={columns} 
          dataSource={transfersData?.content || []} 
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 15,
            total: transfersData?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create Inter-Warehouse Transfer Request"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ sourceWarehouseId: activeWarehouse?.id, items: [{}] }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="sourceWarehouseId" label="Source Warehouse" rules={[{ required: true, message: 'Select source warehouse' }]}>
              <Select placeholder="Origin warehouse">
                {warehousesData?.content?.map((w: any) => (
                  <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="destinationWarehouseId" label="Destination Warehouse" rules={[{ required: true, message: 'Select destination warehouse' }]}>
              <Select placeholder="Target warehouse">
                {warehousesData?.content?.map((w: any) => (
                  <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notes / Transport Details">
            <Input.TextArea rows={2} placeholder="Carrier, driver contact, tracking notes..." />
          </Form.Item>

          <Divider style={{ color: '#94a3b8' }}>Materials to Transfer</Divider>

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
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Qty' }]}
                      style={{ flex: 2, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="Transfer Qty" style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => remove(name)} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                  + Add Material
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ background: '#a855f7', borderColor: '#a855f7' }}>
              Create Transfer Draft
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Warehouse Transfer: ${viewTransfer?.transferCode}`}
        open={!!viewTransfer}
        onCancel={() => setViewTransfer(null)}
        footer={[
          <Button key="close" onClick={() => setViewTransfer(null)}>Close</Button>,
          viewTransfer?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Submit for Approval
            </Button>
          ),
          viewTransfer?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Approve
            </Button>
          ),
          viewTransfer?.status === 'APPROVED' && (
            <Button key="ship" type="primary" style={{ background: '#8b5cf6' }} onClick={() => { shipMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Ship (In Transit)
            </Button>
          ),
          viewTransfer?.status === 'IN_TRANSIT' && (
            <Button key="receive" type="primary" style={{ background: '#10b981' }} onClick={() => { receiveMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Receive (Deposit to Target)
            </Button>
          )
        ]}
        width={700}
      >
        {viewTransfer && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">{getStatusTag(viewTransfer.status)}</Descriptions.Item>
              <Descriptions.Item label="Source">{viewTransfer.sourceWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="Destination">{viewTransfer.destinationWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{viewTransfer.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Shipped At">{viewTransfer.shippedAt ? new Date(viewTransfer.shippedAt).toLocaleString() : '—'}</Descriptions.Item>
              <Descriptions.Item label="Received At">{viewTransfer.receivedAt ? new Date(viewTransfer.receivedAt).toLocaleString() : '—'}</Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>{viewTransfer.notes || '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: '#e2e8f0', marginTop: 16 }}>Items In Transit</Title>
            <Table
              dataSource={viewTransfer.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Material Name', dataIndex: 'materialName', key: 'name' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <Text strong style={{ color: '#a855f7' }}>{q}</Text> },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseTransfersPage;
