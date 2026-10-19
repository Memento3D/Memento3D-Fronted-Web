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
import { getStatusLabel } from '../../../locales/i18n';

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
      message.success('Tạo bản nháp phiếu nhập kho thành công');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Tạo phiếu nhập kho thất bại'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitGoodsReceipt,
    onSuccess: () => {
      message.success('Đã gửi phiếu nhập kho để quản lý phê duyệt');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveGoodsReceipt,
    onSuccess: () => {
      message.success('Đã phê duyệt phiếu nhập kho! Sẵn sàng hoàn tất nhập kho.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const completeMutation = useMutation({
    mutationFn: wmsEnterpriseApi.completeGoodsReceipt,
    onSuccess: () => {
      message.success('Đã hoàn tất nhập kho! Số dư tồn kho và sổ cái đã được cập nhật.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelGoodsReceipt,
    onSuccess: () => {
      message.warning('Đã hủy phiếu nhập kho');
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
      case 'DRAFT': return <Tag color="default">{getStatusLabel('DRAFT')}</Tag>;
      case 'SUBMITTED': return <Tag color="blue">{getStatusLabel('SUBMITTED')}</Tag>;
      case 'APPROVED': return <Tag color="gold">{getStatusLabel('APPROVED')}</Tag>;
      case 'COMPLETED': return <Tag color="green">{getStatusLabel('COMPLETED')}</Tag>;
      case 'CANCELLED': return <Tag color="red">{getStatusLabel('CANCELLED')}</Tag>;
      default: return <Tag>{getStatusLabel(status)}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Mã phiếu nhập',
      dataIndex: 'receiptCode',
      key: 'receiptCode',
      render: (code: string, r: GoodsReceipt) => (
        <a onClick={() => setViewReceipt(r)} style={{ fontWeight: 700, color: '#38bdf8' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (name: string) => <Text strong style={{ color: '#e2e8f0' }}>{name || 'Kho hàng'}</Text>,
    },
    {
      title: 'Nhà cung cấp / Tham chiếu',
      key: 'supplierRef',
      render: (_: any, r: GoodsReceipt) => (
        <div>
          <div style={{ color: '#cbd5e1' }}>{r.supplierName || '—'}</div>
          {r.referenceNumber && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mã tham chiếu: {r.referenceNumber}</div>}
        </div>
      ),
    },
    {
      title: 'Mặt hàng',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => <Text style={{ color: '#94a3b8' }}>{items?.length || 0} mặt hàng</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: GoodsReceiptStatus) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => <Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(val).toLocaleDateString()}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: GoodsReceipt) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewReceipt(r)}>
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
              title="Hoàn tất nhập kho?" 
              description="Thao tác này sẽ ghi tăng số dư tồn kho và ghi nhận vào sổ cái hệ thống."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => completeMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Hoàn tất nhập kho
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || (r.status === 'SUBMITTED' && isManager)) && (
            <Popconfirm 
              title="Hủy phiếu nhập kho?" 
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
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Quản lý phiếu nhập kho
          </Title>
          <Text style={{ color: '#94a3b8' }}>
            Quy trình nhập kho: BẢN NHÁP → ĐÃ GỬI DUYỆT → ĐÃ PHÊ DUYỆT → HOÀN TẤT
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
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo phiếu nhập
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
        title="Tạo phiếu nhập kho mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id, items: [{}] }}>
          <Form.Item name="warehouseId" label="Kho tiếp nhận" rules={[{ required: true, message: 'Vui lòng chọn kho' }]}>
            <Select placeholder="Chọn kho tiếp nhận">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="supplierName" label="Nhà cung cấp / Đơn vị giao">
              <Input placeholder="VD: Creality Chính Hãng, Polymaker" />
            </Form.Item>
            <Form.Item name="referenceNumber" label="Số đơn đặt hàng (PO) / Hóa đơn">
              <Input placeholder="VD: PO-2026-081" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Điều kiện giao nhận, kiểm tra tình trạng lô hàng..." />
          </Form.Item>

          <Divider style={{ color: '#94a3b8' }}>Danh sách mặt hàng nhập</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'materialId']}
                      rules={[{ required: true, message: 'Vui lòng chọn vật liệu' }]}
                      style={{ flex: 3, margin: 0 }}
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
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Số lượng' }]}
                      style={{ flex: 1.5, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="Số lượng" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'unitCost']}
                      style={{ flex: 1.5, margin: 0 }}
                    >
                      <InputNumber min={0} placeholder="Đơn giá" style={{ width: '100%' }} />
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
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Tạo bản nháp phiếu nhập
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Chi tiết phiếu nhập: ${viewReceipt?.receiptCode}`}
        open={!!viewReceipt}
        onCancel={() => setViewReceipt(null)}
        footer={[
          <Button key="close" onClick={() => setViewReceipt(null)}>Đóng</Button>,
          viewReceipt?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Gửi phê duyệt
            </Button>
          ),
          viewReceipt?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Phê duyệt
            </Button>
          ),
          viewReceipt?.status === 'APPROVED' && (
            <Button key="complete" type="primary" style={{ background: '#10b981' }} onClick={() => { completeMutation.mutate(viewReceipt.id); setViewReceipt(null); }}>
              Hoàn tất nhập kho
            </Button>
          )
        ]}
        width={700}
      >
        {viewReceipt && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Trạng thái">{getStatusTag(viewReceipt.status)}</Descriptions.Item>
              <Descriptions.Item label="Kho tiếp nhận">{viewReceipt.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{viewReceipt.supplierName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Mã tham chiếu">{viewReceipt.referenceNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người gửi duyệt">{viewReceipt.submittedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người phê duyệt">{viewReceipt.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">{new Date(viewReceipt.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Thời gian hoàn tất">{viewReceipt.completedAt ? new Date(viewReceipt.completedAt).toLocaleString() : '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: '#e2e8f0', marginTop: 16 }}>Danh sách mặt hàng nhập kho</Title>
            <Table
              dataSource={viewReceipt.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Mã SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Tên vật liệu', dataIndex: 'materialName', key: 'name' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <Text strong style={{ color: '#10b981' }}>+{q}</Text> },
                { title: 'Đơn giá', dataIndex: 'unitCost', key: 'cost', render: (c: number) => c ? `${c.toLocaleString()} VNĐ` : '—' },
                { title: 'Số lô', dataIndex: 'batchNumber', key: 'batch' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GoodsReceiptsManagementPage;
