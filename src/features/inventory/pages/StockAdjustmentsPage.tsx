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
  Popconfirm 
} from 'antd';
import { 
  Plus, 
  Check, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { 
  wmsEnterpriseApi, 
  type StockAdjustment, 
  type StockAdjustmentStatus 
} from '../api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';
import { materialApi } from '../../material/api/materialApi';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { useAuth } from '../../auth/hooks/useAuth';

const { Title, Text } = Typography;

export const StockAdjustmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [form] = Form.useForm();

  const { data: adjustmentsData, isLoading } = useQuery({
    queryKey: ['stock-adjustments', activeWarehouse?.id, statusFilter, page],
    queryFn: () => wmsEnterpriseApi.getAdjustments({ 
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
    mutationFn: wmsEnterpriseApi.createAdjustment,
    onSuccess: () => {
      message.success('Stock adjustment draft created');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Failed to create adjustment'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitAdjustment,
    onSuccess: () => {
      message.success('Adjustment submitted for manager approval');
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveAdjustment,
    onSuccess: () => {
      message.success('Adjustment approved! Ready to apply to balances.');
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const applyMutation = useMutation({
    mutationFn: wmsEnterpriseApi.applyAdjustment,
    onSuccess: () => {
      message.success('Adjustment applied! Inventory synchronized and ledger written.');
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate({
      warehouseId: values.warehouseId || activeWarehouse?.id,
      materialId: values.materialId,
      actualQuantity: values.actualQuantity,
      reason: values.reason,
      evidence: values.evidence,
    });
  };

  const getStatusTag = (status: StockAdjustmentStatus) => {
    switch (status) {
      case 'DRAFT': return <Tag color="default">DRAFT</Tag>;
      case 'SUBMITTED': return <Tag color="blue">SUBMITTED</Tag>;
      case 'APPROVED': return <Tag color="gold">APPROVED</Tag>;
      case 'APPLIED': return <Tag color="green">APPLIED</Tag>;
      case 'REJECTED': return <Tag color="red">REJECTED</Tag>;
      case 'CANCELLED': return <Tag color="gray">CANCELLED</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Code',
      dataIndex: 'adjustmentCode',
      key: 'code',
      render: (code: string) => <Text strong style={{ color: '#fbbf24' }}>{code}</Text>,
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouse',
      render: (name: string) => <Text style={{ color: '#e2e8f0' }}>{name}</Text>,
    },
    {
      title: 'Material',
      key: 'material',
      render: (_: any, r: StockAdjustment) => (
        <div>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{r.materialSku}</span>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.materialName}</div>
        </div>
      ),
    },
    {
      title: 'Quantity (System → Actual)',
      key: 'qty',
      render: (_: any, r: StockAdjustment) => (
        <span>
          {r.currentQuantity} → <Text strong style={{ color: '#e2e8f0' }}>{r.actualQuantity}</Text>
        </span>
      ),
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'diff',
      render: (diff: number) => {
        const isPos = diff > 0;
        return (
          <Text strong style={{ color: isPos ? '#10b981' : '#f43f5e', fontSize: '0.9rem' }}>
            {isPos ? `+${diff}` : diff}
          </Text>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Text style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{reason}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockAdjustmentStatus) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: StockAdjustment) => (
        <Space size="small">
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
            <Popconfirm title="Apply Adjustment?" description="This will update live inventory balances and generate a ledger entry." onConfirm={() => applyMutation.mutate(r.id)}>
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Apply to Inventory
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
            Stock Discrepancy Adjustments
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Formal audit resolution: DRAFT → SUBMITTED → APPROVED → APPLIED (ADJUST_INCREASE or ADJUST_DECREASE)
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
            <Select.Option value="APPLIED">Applied</Select.Option>
            <Select.Option value="REJECTED">Rejected</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#0f172a', borderRadius: 8, fontWeight: 700 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Discrepancy Request
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table 
          columns={columns} 
          dataSource={adjustmentsData?.content || []} 
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: 15,
            total: adjustmentsData?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Report Stock Discrepancy / Adjustment"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id }}>
          <Form.Item name="warehouseId" label="Warehouse" rules={[{ required: true, message: 'Select warehouse' }]}>
            <Select placeholder="Warehouse location">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="materialId" label="Material" rules={[{ required: true, message: 'Select material' }]}>
            <Select placeholder="Material SKU / Name" showSearch optionFilterProp="children">
              {materialsData?.content?.map((m: any) => (
                <Select.Option key={m.id} value={m.id}>
                  [{m.sku}] {m.name} ({m.color || 'Standard'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="actualQuantity" label="Actual Physical Count" rules={[{ required: true, message: 'Specify actual count' }]}>
            <InputNumber min={0} step={1} placeholder="Actual physical quantity counted" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="reason" label="Discrepancy Reason" rules={[{ required: true, message: 'Reason is required' }]}>
            <Input.TextArea rows={3} placeholder="Explain variance (e.g. Broken spool during print job, audit count discrepancy, damaged in storage...)" />
          </Form.Item>

          <Form.Item name="evidence" label="Audit Reference / Evidence Link">
            <Input placeholder="Photo link, incident ticket ID, audit sheet #" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ background: '#fbbf24', borderColor: '#fbbf24', color: '#0f172a', fontWeight: 700 }}>
              Create Adjustment Request
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StockAdjustmentsPage;
