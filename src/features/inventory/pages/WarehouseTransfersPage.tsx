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
import { getStatusLabel } from '../../../locales/i18n';

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
      message.success('Tạo bản nháp phiếu chuyển kho thành công');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Tạo phiếu chuyển kho thất bại'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitTransfer,
    onSuccess: () => {
      message.success('Đã gửi phiếu chuyển kho để quản lý duyệt');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveTransfer,
    onSuccess: () => {
      message.success('Đã phê duyệt phiếu chuyển kho! Sẵn sàng xuất vận chuyển.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const shipMutation = useMutation({
    mutationFn: wmsEnterpriseApi.shipTransfer,
    onSuccess: () => {
      message.success('Đã chuyển trạng thái ĐANG VẬN CHUYỂN! Đã trừ tồn kho nguồn.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const receiveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.receiveTransfer,
    onSuccess: () => {
      message.success('Đã tiếp nhận hàng chuyển kho! Đã cộng tồn kho đích.');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: wmsEnterpriseApi.cancelTransfer,
    onSuccess: () => {
      message.warning('Đã hủy phiếu chuyển kho');
      queryClient.invalidateQueries({ queryKey: ['warehouse-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const handleCreateSubmit = (values: any) => {
    if (values.sourceWarehouseId === values.destinationWarehouseId) {
      message.error('Kho nguồn và Kho đích phải khác nhau');
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
      case 'DRAFT': return <Tag color="default">{getStatusLabel('DRAFT')}</Tag>;
      case 'SUBMITTED': return <Tag color="blue">{getStatusLabel('SUBMITTED')}</Tag>;
      case 'APPROVED': return <Tag color="gold">{getStatusLabel('APPROVED')}</Tag>;
      case 'IN_TRANSIT': return <Tag color="purple">{getStatusLabel('IN_TRANSIT')}</Tag>;
      case 'RECEIVED': return <Tag color="green">{getStatusLabel('RECEIVED')}</Tag>;
      case 'CANCELLED': return <Tag color="red">{getStatusLabel('CANCELLED')}</Tag>;
      default: return <Tag>{getStatusLabel(status)}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Mã phiếu chuyển',
      dataIndex: 'transferCode',
      key: 'transferCode',
      render: (code: string, r: WarehouseTransfer) => (
        <a onClick={() => setViewTransfer(r)} style={{ fontWeight: 700, color: '#a855f7' }}>
          {code}
        </a>
      ),
    },
    {
      title: 'Kho nguồn (Xuất)',
      dataIndex: 'sourceWarehouseName',
      key: 'sourceWarehouseName',
      render: (name: string) => <Text strong style={{ color: '#f87171' }}>{name}</Text>,
    },
    {
      title: 'Kho đích (Nhập)',
      dataIndex: 'destinationWarehouseName',
      key: 'destinationWarehouseName',
      render: (name: string) => <Text strong style={{ color: '#34d399' }}>{name}</Text>,
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
      render: (status: WarehouseTransferStatus) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: WarehouseTransfer) => (
        <Space size="small">
          <Button size="small" icon={<Eye size={13} />} onClick={() => setViewTransfer(r)}>
            Xem
          </Button>

          {r.status === 'DRAFT' && (
            <Button size="small" type="primary" icon={<Send size={13} />} onClick={() => submitMutation.mutate(r.id)}>
              Gửi duyệt
            </Button>
          )}

          {r.status === 'SUBMITTED' && isManager && (
            <Button size="small" style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }} icon={<Check size={13} />} onClick={() => approveMutation.mutate(r.id)}>
              Phê duyệt
            </Button>
          )}

          {r.status === 'APPROVED' && (
            <Popconfirm 
              title="Xuất kho & Vận chuyển?" 
              description="Thao tác này sẽ trừ số lượng tồn kho tại kho nguồn." 
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => shipMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }} icon={<Truck size={13} />}>
                Vận chuyển
              </Button>
            </Popconfirm>
          )}

          {r.status === 'IN_TRANSIT' && (
            <Popconfirm 
              title="Xác nhận đã nhận hàng?" 
              description="Thao tác này sẽ ghi tăng tồn kho tại kho đích." 
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => receiveMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckCircle2 size={13} />}>
                Nhận hàng
              </Button>
            </Popconfirm>
          )}

          {(r.status === 'DRAFT' || r.status === 'SUBMITTED') && (
            <Popconfirm 
              title="Hủy phiếu chuyển kho?" 
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
            Điều chuyển giữa các kho
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>
            Quy trình điều chuyển: BẢN NHÁP → GỬI DUYỆT → ĐÃ DUYỆT → ĐANG VẬN CHUYỂN → ĐÃ TIẾP NHẬN
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
            <Select.Option value="IN_TRANSIT">Đang vận chuyển</Select.Option>
            <Select.Option value="RECEIVED">Đã tiếp nhận</Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: '#a855f7', borderColor: '#a855f7', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo yêu cầu điều chuyển
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
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
        title="Tạo yêu cầu điều chuyển kho"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ sourceWarehouseId: activeWarehouse?.id, items: [{}] }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="sourceWarehouseId" label="Kho nguồn (Xuất)" rules={[{ required: true, message: 'Vui lòng chọn kho nguồn' }]}>
              <Select placeholder="Chọn kho nguồn">
                {warehousesData?.content?.map((w: any) => (
                  <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="destinationWarehouseId" label="Kho đích (Nhập)" rules={[{ required: true, message: 'Vui lòng chọn kho đích' }]}>
              <Select placeholder="Chọn kho đích">
                {warehousesData?.content?.map((w: any) => (
                  <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú / Thông tin vận chuyển">
            <Input.TextArea rows={2} placeholder="Đơn vị vận chuyển, liên hệ tài xế, mã vận đơn..." />
          </Form.Item>

          <Divider style={{ color: '#94a3b8' }}>Danh sách vật liệu điều chuyển</Divider>

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
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Số lượng' }]}
                      style={{ flex: 2, margin: 0 }}
                    >
                      <InputNumber min={0.01} step={1} placeholder="SL chuyển" style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => remove(name)} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                  + Thêm vật liệu
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ background: '#a855f7', borderColor: '#a855f7' }}>
              Tạo bản nháp điều chuyển
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={`Chi tiết điều chuyển kho: ${viewTransfer?.transferCode}`}
        open={!!viewTransfer}
        onCancel={() => setViewTransfer(null)}
        footer={[
          <Button key="close" onClick={() => setViewTransfer(null)}>Đóng</Button>,
          viewTransfer?.status === 'DRAFT' && (
            <Button key="submit" type="primary" onClick={() => { submitMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Gửi phê duyệt
            </Button>
          ),
          viewTransfer?.status === 'SUBMITTED' && isManager && (
            <Button key="approve" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => { approveMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Phê duyệt
            </Button>
          ),
          viewTransfer?.status === 'APPROVED' && (
            <Button key="ship" type="primary" style={{ background: '#8b5cf6' }} onClick={() => { shipMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Xuất kho vận chuyển
            </Button>
          ),
          viewTransfer?.status === 'IN_TRANSIT' && (
            <Button key="receive" type="primary" style={{ background: '#10b981' }} onClick={() => { receiveMutation.mutate(viewTransfer.id); setViewTransfer(null); }}>
              Tiếp nhận vào kho đích
            </Button>
          )
        ]}
        width={700}
      >
        {viewTransfer && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Trạng thái">{getStatusTag(viewTransfer.status)}</Descriptions.Item>
              <Descriptions.Item label="Kho nguồn">{viewTransfer.sourceWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="Kho đích">{viewTransfer.destinationWarehouseName}</Descriptions.Item>
              <Descriptions.Item label="Người phê duyệt">{viewTransfer.approvedBy || '—'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian xuất">{viewTransfer.shippedAt ? new Date(viewTransfer.shippedAt).toLocaleString() : '—'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian nhận">{viewTransfer.receivedAt ? new Date(viewTransfer.receivedAt).toLocaleString() : '—'}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{viewTransfer.notes || '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ color: 'var(--text-primary)', marginTop: 16 }}>Danh sách mặt hàng điều chuyển</Title>
            <Table
              dataSource={viewTransfer.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Mã SKU', dataIndex: 'materialSku', key: 'sku' },
                { title: 'Tên vật liệu', dataIndex: 'materialName', key: 'name' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', render: (q: number) => <Text strong style={{ color: '#a855f7' }}>{q}</Text> },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseTransfersPage;
