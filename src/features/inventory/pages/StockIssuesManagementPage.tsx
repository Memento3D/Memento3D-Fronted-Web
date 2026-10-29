import { ReadState } from '../../../components/ui/ReadState';
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
import { getStatusLabel } from '../../../locales/i18n';

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
  const { data: issuesData, isLoading, isError, refetch, isFetching } = useQuery({
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
      message.success('Tạo bản nháp phiếu xuất kho thành công');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Tạo phiếu xuất kho thất bại'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitStockIssue,
    onSuccess: () => {
      message.success('Đã gửi phiếu xuất kho để quản lý phê duyệt');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveStockIssue,
    onSuccess: () => {
      message.success('Đã phê duyệt phiếu xuất kho');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: wmsEnterpriseApi.completeStockIssue,
    onSuccess: () => {
      message.success('Đã hoàn tất xuất kho! Tồn kho đã được trừ và sổ cái đã cập nhật.');
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelStockIssue,
    onSuccess: () => {
      message.warning('Đã hủy phiếu xuất kho');
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
      case 'DRAFT': return <Tag color="default">{getStatusLabel('DRAFT')}</Tag>;
      case 'SUBMITTED': return <Tag color="blue">{getStatusLabel('SUBMITTED')}</Tag>;
      case 'APPROVED': return <Tag color="gold">{getStatusLabel('APPROVED')}</Tag>;
      case 'COMPLETED': return <Tag color="green">{getStatusLabel('COMPLETED')}</Tag>;
      case 'CANCELLED': return <Tag color="red">{getStatusLabel('CANCELLED')}</Tag>;
      default: return <Tag>{getStatusLabel(status)}</Tag>;
    }
  };

  const getCategoryLabel = (type?: string) => {
    switch (type) {
      case 'PRINT_JOB': return 'Lệnh in sản xuất';
      case 'PACKAGING': return 'Đóng gói / Giao hàng';
      case 'DAMAGED': return 'Hư hỏng / Hết hạn';
      case 'WASTE': return 'Xả nhựa / Phế phẩm';
      case 'MANUAL': return 'Xuất thủ công';
      default: return type || 'Xuất thủ công';
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Mã phiếu xuất',
      dataIndex: 'issueCode',
      key: 'issueCode',
      render: (code: string, r: StockIssue) => (
        <a onClick={() => setViewIssue(r)} style={{ fontWeight: 700, color: '#f43f5e' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Kho xuất',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (name: string) => <Text strong style={{ color: 'var(--text-primary)' }}>{name || 'Kho hàng'}</Text>,
    },
    {
      title: 'Phân loại / Mục đích',
      key: 'ref',
      render: (_: any, r: StockIssue) => (
        <div>
          <Tag color="cyan">{getCategoryLabel(r.referenceType)}</Tag>
          {r.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.reason}</div>}
        </div>
      ),
    },
    {
      title: 'Mặt hàng',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => <Text style={{ color: 'var(--text-secondary)' }}>{items?.length || 0} mặt hàng</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockIssueStatus) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => <Text style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{new Date(val).toLocaleDateString()}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: StockIssue) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewIssue(r)}>
            Xem
          </Button>

          {r.status === 'DRAFT' && (
            <Button 
              size="small" 
              type="primary" 
              icon={<Send size={13} />} 
              onClick={() => submitMutation.mutate(r.id)}
            >
              Gửi duyệt
            </Button>
          )}

          {r.status === 'SUBMITTED' && isManager && (
            <Button 
              size="small" 
              style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }} 
              icon={<Check size={13} />} 
              onClick={() => approveMutation.mutate(r.id)}
            >
              Phê duyệt
            </Button>
          )}

          {r.status === 'APPROVED' && (
            <Popconfirm 
              title="Hoàn tất xuất kho?" 
              description="Thao tác này sẽ trừ số lượng tồn kho khả dụng và cập nhật sổ cái hệ thống."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => completeMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Hoàn tất xuất kho
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || (r.status === 'SUBMITTED' && isManager)) && (
            <Popconfirm 
              title="Hủy phiếu xuất kho?" 
              okText="Đồng ý"
              cancelText="Quay lại"
              onConfirm={() => cancelMutation.mutate(r.id)}
            >
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
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>
            Quản lý phiếu xuất kho
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quy trình xuất kho: BẢN NHÁP → ĐÃ GỬI DUYỆT → ĐÃ PHÊ DUYỆT → HOÀN TẤT
          </Text>
        </div>
        <Space>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 180 }}
          >
            <Select.Option value="DRAFT">Bản nháp</Select.Option>
            <Select.Option value="SUBMITTED">Đã gửi duyệt</Select.Option>
            <Select.Option value="APPROVED">Đã phê duyệt</Select.Option>
            <Select.Option value="COMPLETED">Hoàn tất</Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#f43f5e', borderColor: '#f43f5e', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo phiếu xuất kho
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ReadState isLoading={isLoading} isError={isError} isFetching={isFetching} onRetry={() => { void refetch(); }}>
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
        </ReadState>
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo phiếu xuất kho mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id, referenceType: 'PRINT_JOB', items: [{}] }}>
          <Form.Item name="warehouseId" label="Kho xuất" rules={[{ required: true, message: 'Vui lòng chọn kho xuất' }]}>
            <Select placeholder="Chọn kho xuất">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="referenceType" label="Mục đích xuất kho" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="PRINT_JOB">Lệnh in sản xuất</Select.Option>
                <Select.Option value="PACKAGING">Đóng gói / Giao hàng</Select.Option>
                <Select.Option value="DAMAGED">Hư hỏng / Hết hạn</Select.Option>
                <Select.Option value="WASTE">Xả nhựa / Phế phẩm mẫu</Select.Option>
                <Select.Option value="MANUAL">Xuất thủ công</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="referenceId" label="Mã tham chiếu / Mã lệnh in">
              <Input placeholder="VD: PJ-9842" />
            </Form.Item>
          </div>

          <Form.Item name="reason" label="Lý do & Chi tiết" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea rows={2} placeholder="Nhập lý do xuất vật liệu..." />
          </Form.Item>

          <Divider style={{ color: '#94a3b8' }}>Danh sách mặt hàng xuất</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'materialId']}
                      rules={[{ required: true, message: 'Vui lòng chọn vật liệu' }]}
                      style={{ flex: 4, margin: 0 }}
                    >
                      <Select placeholder="Mã SKU / Tên vật liệu" showSearch optionFilterProp="children">
                        {materialsData?.content?.map((m: any) => (
                          <Select.Option key={m.id} value={m.id}>
                            [{m.sku}] {m.name} ({m.color || 'Tiêu chuẩn'})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'requestedQuantity']}
                      rules={[{ required: true, message: 'Số lượng' }]}
                      style={{ flex: 2, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="SL yêu cầu" style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => remove(name)} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                  + Thêm mặt hàng
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ background: '#f43f5e', borderColor: '#f43f5e' }}>
              Tạo bản nháp phiếu xuất
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Chi tiết phiếu xuất: ${viewIssue?.issueCode}`}
        open={!!viewIssue}
        onCancel={() => setViewIssue(null)}
        footer={[
          <Button key="close" onClick={() => setViewIssue(null)}>Đóng</Button>,
          viewIssue?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Gửi phê duyệt
            </Button>
          ),
          viewIssue?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Phê duyệt
            </Button>
          ),
          viewIssue?.status === 'APPROVED' && (
            <Button key="complete" type="primary" style={{ background: '#10b981' }} onClick={() => { completeMutation.mutate(viewIssue.id); setViewIssue(null); }}>
              Hoàn tất xuất kho
            </Button>
          )
        ]}
        width={700}
      >
        {viewIssue && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Trạng thái">{getStatusTag(viewIssue.status)}</Descriptions.Item>
              <Descriptions.Item label="Kho xuất">{viewIssue.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Mục đích xuất">{getCategoryLabel(viewIssue.referenceType)}</Descriptions.Item>
              <Descriptions.Item label="Mã tham chiếu">{viewIssue.referenceId || '—'}</Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>{viewIssue.reason || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người gửi duyệt">{viewIssue.submittedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người phê duyệt">{viewIssue.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">{new Date(viewIssue.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Thời gian hoàn tất">{viewIssue.completedAt ? new Date(viewIssue.completedAt).toLocaleString() : '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: 'var(--text-primary)', marginTop: 16 }}>Danh sách mặt hàng xuất kho</Title>
            <Table
              dataSource={viewIssue.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Mã SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Tên vật liệu', dataIndex: 'materialName', key: 'name' },
                { title: 'SL yêu cầu', dataIndex: 'requestedQuantity', key: 'rq', render: (q: number) => <Text strong style={{ color: '#f43f5e' }}>-{q}</Text> },
                { title: 'SL đã xuất', dataIndex: 'issuedQuantity', key: 'iq' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StockIssuesManagementPage;
