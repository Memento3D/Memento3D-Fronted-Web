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
  Descriptions
} from 'antd';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  Eye, 
  Save 
} from 'lucide-react';
import { 
  wmsEnterpriseApi, 
  type StockCount, 
  type StockCountStatus, 
  type StockCountItem 
} from '../api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import { warehouseApi } from '../../warehouse/api/warehouseApi';

const { Title, Text } = Typography;

export const StockCountsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activeCount, setActiveCount] = useState<StockCount | null>(null);
  const [countItemsForm, setCountItemsForm] = useState<Record<string, number>>({});

  const [form] = Form.useForm();

  const { data: countsData, isLoading } = useQuery({
    queryKey: ['stock-counts', activeWarehouse?.id, statusFilter, page],
    queryFn: () => wmsEnterpriseApi.getStockCounts({ 
      warehouseId: activeWarehouse?.id, 
      status: statusFilter, 
      page, 
      size: 15 
    }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-active'],
    queryFn: () => warehouseApi.list({ status: 'ACTIVE', limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: wmsEnterpriseApi.createStockCount,
    onSuccess: () => {
      message.success('Stock count session initialized');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
    },
    onError: (err: any) => message.error(err.message || 'Failed to initialize count'),
  });

  const startMutation = useMutation({
    mutationFn: wmsEnterpriseApi.startStockCount,
    onSuccess: (updated) => {
      message.success('Stock count session is now active (COUNTING)');
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
      if (activeCount?.id === updated.id) {
        setActiveCount(updated);
      }
    },
    onError: (err: any) => message.error(err.message),
  });

  const updateItemsMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: any[] }) => wmsEnterpriseApi.updateCountItems(id, items),
    onSuccess: (updated) => {
      message.success('Counted physical items saved');
      setActiveCount(updated);
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: wmsEnterpriseApi.completeStockCount,
    onSuccess: () => {
      message.success('Stock count completed and locked');
      setActiveCount(null);
      queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate({
      warehouseId: values.warehouseId || activeWarehouse?.id,
      notes: values.notes,
    });
  };

  const handleSaveItems = () => {
    if (!activeCount) return;
    const items = activeCount.items.map((item) => ({
      materialId: item.materialId,
      countedQuantity: countItemsForm[item.materialId] ?? item.countedQuantity ?? item.systemQuantity,
      notes: item.notes,
    }));
    updateItemsMutation.mutate({ id: activeCount.id, items });
  };

  const getStatusTag = (status: StockCountStatus) => {
    switch (status) {
      case 'DRAFT': return <Tag color="default">DRAFT</Tag>;
      case 'COUNTING': return <Tag color="processing">COUNTING IN PROGRESS</Tag>;
      case 'REVIEW': return <Tag color="gold">UNDER REVIEW</Tag>;
      case 'COMPLETED': return <Tag color="green">COMPLETED</Tag>;
      case 'CANCELLED': return <Tag color="red">CANCELLED</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Count Code',
      dataIndex: 'countCode',
      key: 'code',
      render: (code: string, r: StockCount) => (
        <a onClick={() => { setActiveCount(r); setCountItemsForm({}); }} style={{ fontWeight: 700, color: '#38bdf8' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouse',
      render: (name: string) => <Text style={{ color: '#e2e8f0' }}>{name}</Text>,
    },
    {
      title: 'Scope',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => <Text style={{ color: '#94a3b8' }}>{items?.length || 0} materials</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockCountStatus) => getStatusTag(status),
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
      render: (_: any, r: StockCount) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => { setActiveCount(r); setCountItemsForm({}); }}>
            View / Count
          </Button>

          {r.status === 'DRAFT' && (
            <Button size="small" type="primary" icon={<Play size={13} />} onClick={() => startMutation.mutate(r.id)}>
              Start Count
            </Button>
          )}

          {r.status === 'COUNTING' && (
            <Popconfirm title="Complete Audit Session?" description="Finalizes stock count and locks variances." onConfirm={() => completeMutation.mutate(r.id)}>
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Complete Audit
              </Button>
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
            Physical Stock Counts & Audits
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Audit verification workflow: DRAFT → COUNTING → REVIEW → COMPLETED (Variance tracking)
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
            <Select.Option value="COUNTING">Counting</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Stock Audit
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table 
          columns={columns} 
          dataSource={countsData?.content || []} 
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 15,
            total: countsData?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Initialize Warehouse Stock Audit"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id }}>
          <Form.Item name="warehouseId" label="Warehouse to Audit" rules={[{ required: true, message: 'Select warehouse' }]}>
            <Select placeholder="Target warehouse">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Audit Scope & Notes">
            <Input.TextArea rows={3} placeholder="e.g. Month-end full physical count for SLA compliance..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Initialize Session
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Audit Detail & Counting Sheet Modal */}
      <Modal
        title={`Stock Count Session: ${activeCount?.countCode}`}
        open={!!activeCount}
        onCancel={() => setActiveCount(null)}
        width={850}
        footer={[
          <Button key="close" onClick={() => setActiveCount(null)}>Close</Button>,
          activeCount?.status === 'DRAFT' && (
            <Button key="start" type="primary" onClick={() => startMutation.mutate(activeCount.id)}>
              Start Physical Count
            </Button>
          ),
          activeCount?.status === 'COUNTING' && (
            <Button key="save" icon={<Save size={14} />} onClick={handleSaveItems} loading={updateItemsMutation.isPending}>
              Save Physical Counts
            </Button>
          ),
          activeCount?.status === 'COUNTING' && (
            <Button key="complete" type="primary" style={{ background: '#10b981' }} onClick={() => completeMutation.mutate(activeCount.id)}>
              Finalize Audit
            </Button>
          ),
        ]}
      >
        {activeCount && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">{getStatusTag(activeCount.status)}</Descriptions.Item>
              <Descriptions.Item label="Warehouse">{activeCount.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Started At">{activeCount.startedAt ? new Date(activeCount.startedAt).toLocaleString() : 'Not started'}</Descriptions.Item>
              <Descriptions.Item label="Completed At">{activeCount.completedAt ? new Date(activeCount.completedAt).toLocaleString() : '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: '#e2e8f0', marginTop: 16 }}>Count Items & Discrepancies</Title>
            <Table
              dataSource={activeCount.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Material Name', dataIndex: 'materialName', key: 'name' },
                { title: 'System Qty', dataIndex: 'systemQuantity', key: 'sysQty' },
                { 
                  title: 'Counted Physical Qty', 
                  key: 'countedQty', 
                  render: (_: any, r: StockCountItem) => (
                    activeCount.status === 'COUNTING' ? (
                      <InputNumber
                        min={0}
                        value={countItemsForm[r.materialId] ?? r.countedQuantity ?? r.systemQuantity}
                        onChange={(val) => setCountItemsForm(prev => ({ ...prev, [r.materialId]: Number(val) }))}
                      />
                    ) : (
                      <Text strong style={{ color: '#38bdf8' }}>{r.countedQuantity ?? r.systemQuantity}</Text>
                    )
                  )
                },
                { 
                  title: 'Variance', 
                  key: 'variance', 
                  render: (_: any, r: StockCountItem) => {
                    const counted = countItemsForm[r.materialId] ?? r.countedQuantity ?? r.systemQuantity;
                    const diff = counted - r.systemQuantity;
                    const color = diff === 0 ? '#94a3b8' : diff > 0 ? '#10b981' : '#f43f5e';
                    return <Text strong style={{ color }}>{diff > 0 ? `+${diff}` : diff}</Text>;
                  }
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StockCountsPage;
