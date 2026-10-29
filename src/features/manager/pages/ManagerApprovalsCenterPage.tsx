import { ReadState } from '../../../components/ui/ReadState';
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
  const { data: receiptsData, isLoading: loadingReceipts, isError: receiptsError, isFetching: fetchingReceipts, refetch: refetchReceipts } = useQuery({
    queryKey: ['pending-receipts', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getGoodsReceipts({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'receipts',
    staleTime: 60 * 1000,
  });

  const { data: issuesData, isLoading: loadingIssues, isError: issuesError, isFetching: fetchingIssues, refetch: refetchIssues } = useQuery({
    queryKey: ['pending-issues', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getStockIssues({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'issues',
    staleTime: 60 * 1000,
  });

  const { data: adjustmentsData, isLoading: loadingAdjustments, isError: adjustmentsError, isFetching: fetchingAdjustments, refetch: refetchAdjustments } = useQuery({
    queryKey: ['pending-adjustments', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getAdjustments({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'adjustments',
    staleTime: 60 * 1000,
  });

  const { data: transfersData, isLoading: loadingTransfers, isError: transfersError, isFetching: fetchingTransfers, refetch: refetchTransfers } = useQuery({
    queryKey: ['pending-transfers', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getTransfers({ warehouseId: activeWarehouse?.id, status: 'SUBMITTED', size: 50 }),
    enabled: activeTab === 'transfers',
    staleTime: 60 * 1000,
  });

  // Approvals Mutations
  const approveReceiptMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveGoodsReceipt,
    onSuccess: () => {
      message.success('Đã phê duyệt phiếu nhập kho');
      queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelReceiptMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelGoodsReceipt,
    onSuccess: () => {
      message.warning('Đã từ chối/hủy phiếu nhập kho');
      queryClient.invalidateQueries({ queryKey: ['pending-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveIssueMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveStockIssue,
    onSuccess: () => {
      message.success('Đã phê duyệt phiếu xuất kho');
      queryClient.invalidateQueries({ queryKey: ['pending-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelIssueMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelStockIssue,
    onSuccess: () => {
      message.warning('Đã từ chối phiếu xuất kho');
      queryClient.invalidateQueries({ queryKey: ['pending-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveAdjustmentMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveAdjustment,
    onSuccess: () => {
      message.success('Đã phê duyệt điều chỉnh tồn kho');
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const rejectAdjustmentMutation = useMutation({
    mutationFn: (id: string) => wmsEnterpriseApi.rejectAdjustment(id, 'Bị quản lý từ chối tại Trung tâm phê duyệt'),
    onSuccess: () => {
      message.warning('Đã từ chối điều chỉnh tồn kho');
      queryClient.invalidateQueries({ queryKey: ['pending-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveTransferMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveTransfer,
    onSuccess: () => {
      message.success('Đã phê duyệt điều chuyển kho');
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelTransferMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelTransfer,
    onSuccess: () => {
      message.warning('Đã từ chối/hủy điều chuyển kho');
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
    { title: 'Mã phiếu', dataIndex: 'receiptCode', key: 'code', render: (val: string) => <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>{val}</Text> },
    { title: 'Kho hàng', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'supplier', render: (val: string) => val || '—' },
    { title: 'Mặt hàng', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} mặt hàng` },
    { title: 'Người gửi duyệt', dataIndex: 'submittedBy', key: 'by', render: (val: string) => val || 'Nhân viên' },
    { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }} 
            icon={<Check size={13} />} 
            onClick={() => approveReceiptMutation.mutate(r.id)}
          >
            Phê duyệt
          </Button>
          <Popconfirm 
            title="Từ chối phiếu nhập kho này?" 
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() => cancelReceiptMutation.mutate(r.id)}
          >
            <Button size="small" danger style={{ borderRadius: 'var(--radius-pill, 9999px)' }} icon={<X size={13} />}>Từ chối</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const issueColumns = [
    { title: 'Mã phiếu', dataIndex: 'issueCode', key: 'code', render: (val: string) => <Text strong style={{ color: '#E07A5F' }}>{val}</Text> },
    { title: 'Kho hàng', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Phân loại / Mục đích', dataIndex: 'referenceType', key: 'type', render: (val: string) => <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary-system, #5F3ADD)', border: 'none', fontWeight: 600 }}>{val || 'PRINT_JOB'}</Tag> },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
    { title: 'Mặt hàng', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} mặt hàng` },
    { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }} 
            icon={<Check size={13} />} 
            onClick={() => approveIssueMutation.mutate(r.id)}
          >
            Phê duyệt
          </Button>
          <Popconfirm 
            title="Từ chối phiếu xuất kho này?" 
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() => cancelIssueMutation.mutate(r.id)}
          >
            <Button size="small" danger style={{ borderRadius: 'var(--radius-pill, 9999px)' }} icon={<X size={13} />}>Từ chối</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const adjustmentColumns = [
    { title: 'Mã điều chỉnh', dataIndex: 'adjustmentCode', key: 'code', render: (val: string) => <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>{val}</Text> },
    { title: 'Kho hàng', dataIndex: 'warehouseName', key: 'warehouse' },
    { title: 'Vật liệu', key: 'mat', render: (_: any, r: any) => `[${r.materialSku}] ${r.materialName}` },
    { title: 'Hệ thống → Thực tế', key: 'change', render: (_: any, r: any) => `${r.currentQuantity} → ${r.actualQuantity}` },
    { 
      title: 'Chênh lệch', 
      dataIndex: 'difference', 
      key: 'diff', 
      render: (d: number) => <Text strong style={{ color: d > 0 ? 'var(--tertiary, #466253)' : 'var(--error, #BA1A1A)' }}>{d > 0 ? `+${d}` : d}</Text> 
    },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }} 
            icon={<Check size={13} />} 
            onClick={() => approveAdjustmentMutation.mutate(r.id)}
          >
            Phê duyệt
          </Button>
          <Popconfirm 
            title="Từ chối yêu cầu điều chỉnh này?" 
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() => rejectAdjustmentMutation.mutate(r.id)}
          >
            <Button size="small" danger style={{ borderRadius: 'var(--radius-pill, 9999px)' }} icon={<X size={13} />}>Từ chối</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferColumns = [
    { title: 'Mã chuyển kho', dataIndex: 'transferCode', key: 'code', render: (val: string) => <Text strong style={{ color: 'var(--primary-system, #5F3ADD)' }}>{val}</Text> },
    { title: 'Kho nguồn', dataIndex: 'sourceWarehouseName', key: 'source' },
    { title: 'Kho đích', dataIndex: 'destinationWarehouseName', key: 'dest' },
    { title: 'Mặt hàng', dataIndex: 'items', key: 'items', render: (items: any[]) => `${items?.length || 0} mặt hàng` },
    { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'date', render: (val: string) => new Date(val).toLocaleDateString() },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }} 
            icon={<Check size={13} />} 
            onClick={() => approveTransferMutation.mutate(r.id)}
          >
            Phê duyệt
          </Button>
          <Popconfirm 
            title="Từ chối yêu cầu điều chuyển này?" 
            okText="Đồng ý"
            cancelText="Hủy"
            onConfirm={() => cancelTransferMutation.mutate(r.id)}
          >
            <Button size="small" danger style={{ borderRadius: 'var(--radius-pill, 9999px)' }} icon={<X size={13} />}>Từ chối</Button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary, #28243D)', fontWeight: 800, fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>
            Trung tâm phê duyệt hợp nhất Quản lý
          </Title>
          <Text style={{ color: 'var(--text-secondary, #6A6282)' }}>
            Hàng đợi vận hành tập trung để xem xét và phê duyệt các hoạt động kho bãi
          </Text>
        </div>
        <Button icon={<RefreshCw size={14} />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} onClick={refreshAll}>
          Làm mới hàng đợi
        </Button>
      </div>

      <Card style={{ background: '#fff', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'receipts',
              label: (
                <Space>
                  <ArrowDownLeft size={16} />
                  <span>Phiếu nhập kho</span>
                  <Badge count={countReceipts} overflowCount={99} />
                </Space>
              ),
              children: (
                <ReadState isLoading={loadingReceipts} isError={receiptsError} isFetching={fetchingReceipts} onRetry={() => { void refetchReceipts(); }}>
                <Table 
                  columns={receiptColumns} 
                  dataSource={receiptsData?.content || []} 
                  rowKey="id" 
                  loading={loadingReceipts}
                  locale={{ emptyText: 'Không có phiếu nhập kho nào đang chờ duyệt' }}
                />
                </ReadState>
              ),
            },
            {
              key: 'issues',
              label: (
                <Space>
                  <ArrowUpRight size={16} />
                  <span>Phiếu xuất kho</span>
                  <Badge count={countIssues} overflowCount={99} />
                </Space>
              ),
              children: (
                <ReadState isLoading={loadingIssues} isError={issuesError} isFetching={fetchingIssues} onRetry={() => { void refetchIssues(); }}>
                <Table 
                  columns={issueColumns} 
                  dataSource={issuesData?.content || []} 
                  rowKey="id" 
                  loading={loadingIssues}
                  locale={{ emptyText: 'Không có phiếu xuất kho nào đang chờ duyệt' }}
                />
                </ReadState>
              ),
            },
            {
              key: 'adjustments',
              label: (
                <Space>
                  <Sliders size={16} />
                  <span>Điều chỉnh tồn kho</span>
                  <Badge count={countAdjustments} overflowCount={99} />
                </Space>
              ),
              children: (
                <ReadState isLoading={loadingAdjustments} isError={adjustmentsError} isFetching={fetchingAdjustments} onRetry={() => { void refetchAdjustments(); }}>
                <Table 
                  columns={adjustmentColumns} 
                  dataSource={adjustmentsData?.content || []} 
                  rowKey="id" 
                  loading={loadingAdjustments}
                  locale={{ emptyText: 'Không có yêu cầu điều chỉnh nào đang chờ duyệt' }}
                />
                </ReadState>
              ),
            },
            {
              key: 'transfers',
              label: (
                <Space>
                  <ArrowLeftRight size={16} />
                  <span>Điều chuyển kho</span>
                  <Badge count={countTransfers} overflowCount={99} />
                </Space>
              ),
              children: (
                <ReadState isLoading={loadingTransfers} isError={transfersError} isFetching={fetchingTransfers} onRetry={() => { void refetchTransfers(); }}>
                <Table 
                  columns={transferColumns} 
                  dataSource={transfersData?.content || []} 
                  rowKey="id" 
                  loading={loadingTransfers}
                  locale={{ emptyText: 'Không có yêu cầu chuyển kho nào đang chờ duyệt' }}
                />
                </ReadState>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ManagerApprovalsCenterPage;
