import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tabs, 
  Table, 
  Button, 
  Tag, 
  Card, 
  Space, 
  Popconfirm, 
  message, 
  Typography, 
  Badge 
} from 'antd';
import { 
  Check, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';
import { wmsEnterpriseApi } from '../../inventory/api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';

const { Title, Text } = Typography;

export const ManagerApprovalsCenterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWarehouse } = useWarehouseContext();
  const [activeTab, setActiveTab] = React.useState('receipts');

  // Queries for SUBMITTED entities with lazy per-tab fetching
  const { data: receiptsData, isLoading: loadingReceipts } = useQuery({
    queryKey: ['pending-receipts', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getGoodsReceipts({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'receipts',
    staleTime: 60 * 1000,
  });

  const { data: issuesData, isLoading: loadingIssues } = useQuery({
    queryKey: ['pending-issues', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getStockIssues({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'issues',
    staleTime: 60 * 1000,
  });

  const { data: adjustmentsData, isLoading: loadingAdjustments } = useQuery({
    queryKey: ['pending-adjustments', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getAdjustments({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'adjustments',
    staleTime: 60 * 1000,
  });

  const { data: transfersData, isLoading: loadingTransfers } = useQuery({
    queryKey: ['pending-transfers', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getTransfers({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'transfers',
    staleTime: 60 * 1000,
  });

  // Approvals Mutations
  const approveReceiptMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveGoodsReceipt,
    onSuccess: () => {
      message.success('Goods receipt approved');
      queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelReceiptMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelGoodsReceipt,
    onSuccess: () => {
      message.warning('Goods receipt rejected/cancelled');
      queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveIssueMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveStockIssue,
    onSuccess: () => {
      message.success('Stock issue approved');
      queryClient.invalidateQueries({ queryKey: ['pending-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelIssueMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelStockIssue,
    onSuccess: () => {
      message.warning('Stock issue rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveAdjustmentMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveAdjustment,
    onSuccess: () => {
      message.success('Stock adjustment approved');
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const rejectAdjustmentMutation = useMutation({
    mutationFn: (id: string) => wmsEnterpriseApi.rejectAdjustment(id, 'Rejected by Manager in Approval Center'),
    onSuccess: () => {
      message.warning('Stock adjustment rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveTransferMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveTransfer,
    onSuccess: () => {
      message.success('Transfer approved');
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelTransferMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelTransfer,
    onSuccess: () => {
      message.warning('Transfer rejected/cancelled');
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
    queryClient.invalidateQueries({ queryKey: ['pending-issues'] });
    queryClient.invalidateQueries({ queryKey: ['pending-adjustments'] });
    queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
    queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
  };

  const receiptColumns = [
    { title: 'Code', dataIndex: 'receiptCode', key: 'code', render: (val: string) => <Text strong style={{ color: '#38bdf8' }}>{val}</Text> },
    { title: 'Warehouse', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Supplier', dataIndex: 'supplierName', key: 'supplier', render: (val: string) => val || '—' },
    { title: 'Lines', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} items` },
    { title: 'Submitted By', dataIndex: 'submittedBy', key: 'by', render: (val: string) => val || 'Staff' },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ background: '#10b981', borderColor: '#10b981' }} 
            icon={<Check size={13} />} 
            onClick={() => approveReceiptMutation.mutate(r.id)}
          >
            Approve
          </Button>
          <Popconfirm title="Reject this receipt?" onConfirm={() => cancelReceiptMutation.mutate(r.id)}>
            <Button size="small" danger icon={<X size={13} />}>Reject</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const issueColumns = [
    { title: 'Code', dataIndex: 'issueCode', key: 'code', render: (val: string) => <Text strong style={{ color: '#f43f5e' }}>{val}</Text> },
    { title: 'Warehouse', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Type / Purpose', dataIndex: 'referenceType', key: 'type', render: (val: string) => <Tag color="cyan">{val || 'PRINT_JOB'}</Tag> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Lines', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} items` },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ background: '#10b981', borderColor: '#10b981' }} 
            icon={<Check size={13} />} 
            onClick={() => approveIssueMutation.mutate(r.id)}
          >
            Approve
          </Button>
          <Popconfirm title="Reject this issue?" onConfirm={() => cancelIssueMutation.mutate(r.id)}>
            <Button size="small" danger icon={<X size={13} />}>Reject</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const adjustmentColumns = [
    { title: 'Code', dataIndex: 'adjustmentCode', key: 'code', render: (val: string) => <Text strong style={{ color: '#fbbf24' }}>{val}</Text> },
    { title: 'Warehouse', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Material', key: 'mat', render: (_: any, r: any) => `[${r.materialSku}] ${r.materialName}` },
    { title: 'System → Actual', key: 'change', render: (_: any, r: any) => `${r.currentQuantity} → ${r.actualQuantity}` },
    { 
      title: 'Difference', 
      dataIndex: 'difference', 
      key: 'diff', 
      render: (d: number) => <Text strong style={{ color: d > 0 ? '#10b981' : '#f43f5e' }}>{d > 0 ? `+${d}` : d}</Text> 
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ background: '#10b981', borderColor: '#10b981' }} 
            icon={<Check size={13} />} 
            onClick={() => approveAdjustmentMutation.mutate(r.id)}
          >
            Approve
          </Button>
          <Popconfirm title="Reject this adjustment?" onConfirm={() => rejectAdjustmentMutation.mutate(r.id)}>
            <Button size="small" danger icon={<X size={13} />}>Reject</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferColumns = [
    { title: 'Code', dataIndex: 'transferCode', key: 'code', render: (val: string) => <Text strong style={{ color: '#a855f7' }}>{val}</Text> },
    { title: 'Source', dataIndex: 'sourceWarehouseName', key: 'source' },
    { title: 'Destination', dataIndex: 'destinationWarehouseName', key: 'dest' },
    { title: 'Lines', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} items` },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ background: '#10b981', borderColor: '#10b981' }} 
            icon={<Check size={13} />} 
            onClick={() => approveTransferMutation.mutate(r.id)}
          >
            Approve
          </Button>
          <Popconfirm title="Reject this transfer?" onConfirm={() => cancelTransferMutation.mutate(r.id)}>
            <Button size="small" danger icon={<X size={13} />}>Reject</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const countReceipts = receiptsData?.totalElements || receiptsData?.content?.length || 0;
  const countIssues = issuesData?.totalElements || issuesData?.content?.length || 0;
  const countAdjustments = adjustmentsData?.totalElements || adjustmentsData?.content?.length || 0;
  const countTransfers = transfersData?.totalElements || transfersData?.content?.length || 0;

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Manager Unified Approval Center
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Consolidated operational queue for reviewing and authorizing warehouse operations
          </Text>
        </div>
        <Button icon={<RefreshCw size={14} />} onClick={refreshAll}>
          Refresh Queue
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'receipts',
              label: (
                <Space>
                  <ArrowDownLeft size={16} />
                  <span>Goods Receipts</span>
                  <Badge count={countReceipts} overflowCount={99} />
                </Space>
              ),
              children: (
                <Table 
                  columns={receiptColumns} 
                  dataSource={receiptsData?.content || []} 
                  rowKey="id" 
                  loading={loadingReceipts}
                  locale={{ emptyText: 'No pending goods receipts awaiting approval' }}
                />
              ),
            },
            {
              key: 'issues',
              label: (
                <Space>
                  <ArrowUpRight size={16} />
                  <span>Stock Issues</span>
                  <Badge count={countIssues} overflowCount={99} />
                </Space>
              ),
              children: (
                <Table 
                  columns={issueColumns} 
                  dataSource={issuesData?.content || []} 
                  rowKey="id" 
                  loading={loadingIssues}
                  locale={{ emptyText: 'No pending stock issues awaiting approval' }}
                />
              ),
            },
            {
              key: 'adjustments',
              label: (
                <Space>
                  <Sliders size={16} />
                  <span>Adjustments</span>
                  <Badge count={countAdjustments} overflowCount={99} />
                </Space>
              ),
              children: (
                <Table 
                  columns={adjustmentColumns} 
                  dataSource={adjustmentsData?.content || []} 
                  rowKey="id" 
                  loading={loadingAdjustments}
                  locale={{ emptyText: 'No pending stock adjustments awaiting approval' }}
                />
              ),
            },
            {
              key: 'transfers',
              label: (
                <Space>
                  <ArrowLeftRight size={16} />
                  <span>Transfers</span>
                  <Badge count={countTransfers} overflowCount={99} />
                </Space>
              ),
              children: (
                <Table 
                  columns={transferColumns} 
                  dataSource={transfersData?.content || []} 
                  rowKey="id" 
                  loading={loadingTransfers}
                  locale={{ emptyText: 'No pending warehouse transfers awaiting approval' }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ManagerApprovalsCenterPage;
