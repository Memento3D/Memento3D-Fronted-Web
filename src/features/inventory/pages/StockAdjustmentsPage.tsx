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
import { getStatusLabel } from '../../../locales/i18n';

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
      message.success('Tạo bản nháp điều chỉnh tồn kho thành công');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message || 'Tạo điều chỉnh tồn kho thất bại'),
  });

  const submitMutation = useMutation({
    mutationFn: wmsEnterpriseApi.submitAdjustment,
    onSuccess: () => {
      message.success('Đã gửi yêu cầu điều chỉnh để quản lý duyệt');
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: wmsEnterpriseApi.approveAdjustment,
    onSuccess: () => {
      message.success('Đã phê duyệt điều chỉnh! Sẵn sàng áp dụng vào số dư.');
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const applyMutation = useMutation({
    mutationFn: wmsEnterpriseApi.applyAdjustment,
    onSuccess: () => {
      message.success('Đã áp dụng điều chỉnh! Tồn kho đã đồng bộ và sổ cái đã được ghi nhận.');
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
      case 'DRAFT': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--text-secondary, #6A6282)', border: 'none' }}>{getStatusLabel('DRAFT')}</Tag>;
      case 'SUBMITTED': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-high, #EBE4FF)', color: 'var(--primary-system, #5F3ADD)', border: 'none', fontWeight: 600 }}>{getStatusLabel('SUBMITTED')}</Tag>;
      case 'APPROVED': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--secondary-peach, #FFBFAE)', color: '#7C3F2E', border: 'none', fontWeight: 600 }}>{getStatusLabel('APPROVED')}</Tag>;
      case 'APPLIED': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }}>{getStatusLabel('APPLIED')}</Tag>;
      case 'REJECTED': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--error-container, #FFDAD6)', color: 'var(--on-error-container, #93000A)', border: 'none', fontWeight: 600 }}>{getStatusLabel('REJECTED')}</Tag>;
      case 'CANCELLED': return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-high, #EBE4FF)', color: 'var(--text-secondary, #6A6282)', border: 'none' }}>{getStatusLabel('CANCELLED')}</Tag>;
      default: return <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)' }}>{getStatusLabel(status)}</Tag>;
    }
  };

  const isManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const columns = [
    {
      title: 'Mã điều chỉnh',
      dataIndex: 'adjustmentCode',
      key: 'code',
      render: (code: string) => <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>{code}</Text>,
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseName',
      key: 'warehouse',
      render: (name: string) => <Text style={{ color: 'var(--text-primary, #28243D)' }}>{name}</Text>,
    },
    {
      title: 'Vật liệu',
      key: 'material',
      render: (_: any, r: StockAdjustment) => (
        <div>
          <span style={{ color: 'var(--primary-system, #5F3ADD)', fontWeight: 600 }}>{r.materialSku}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6A6282)' }}>{r.materialName}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng (Hệ thống → Thực tế)',
      key: 'qty',
      render: (_: any, r: StockAdjustment) => (
        <span>
          {r.currentQuantity} → <Text strong style={{ color: 'var(--text-primary, #28243D)' }}>{r.actualQuantity}</Text>
        </span>
      ),
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'difference',
      key: 'diff',
      render: (diff: number) => {
        const isPos = diff > 0;
        return (
          <Text strong style={{ color: isPos ? 'var(--tertiary, #466253)' : 'var(--error, #BA1A1A)', fontSize: '0.9rem' }}>
            {isPos ? `+${diff}` : diff}
          </Text>
        );
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>{reason}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StockAdjustmentStatus) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: StockAdjustment) => (
        <Space size="small">
          {r.status === 'DRAFT' && (
            <Button size="small" type="primary" icon={<Send size={13} />} style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--primary, #7C5CFC)' }} onClick={() => submitMutation.mutate(r.id)}>
              Gửi duyệt
            </Button>
          )}

          {r.status === 'SUBMITTED' && isManager && (
            <Button size="small" style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--secondary-peach, #FFBFAE)', color: '#28243D', border: 'none', fontWeight: 600 }} icon={<Check size={13} />} onClick={() => approveMutation.mutate(r.id)}>
              Phê duyệt
            </Button>
          )}

          {r.status === 'APPROVED' && (
            <Popconfirm 
              title="Áp dụng điều chỉnh tồn kho?" 
              description="Thao tác này sẽ cập nhật số dư tồn kho thực tế và tạo bản ghi sổ cái." 
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => applyMutation.mutate(r.id)}
            >
              <Button size="small" type="primary" style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--tertiary-mint, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }} icon={<CheckCircle2 size={13} />}>
                Áp dụng vào tồn kho
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary, #28243D)', fontWeight: 800, fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>
            Điều chỉnh chênh lệch tồn kho
          </Title>
          <Text style={{ color: 'var(--text-secondary, #6A6282)' }}>
            Quy trình điều chỉnh: BẢN NHÁP → GỬI DUYỆT → ĐÃ DUYỆT → ĐÃ ÁP DỤNG
          </Text>
        </div>
        <Space wrap>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 180, borderRadius: 'var(--radius-input, 20px)' }}
          >
            <Select.Option value="DRAFT">Bản nháp</Select.Option>
            <Select.Option value="SUBMITTED">Đã gửi duyệt</Select.Option>
            <Select.Option value="APPROVED">Đã phê duyệt</Select.Option>
            <Select.Option value="APPLIED">Đã áp dụng</Select.Option>
            <Select.Option value="REJECTED">Đã từ chối</Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<Plus size={15} />} 
            style={{ background: 'var(--primary, #7C5CFC)', color: '#fff', borderRadius: 'var(--radius-pill, 9999px)', fontWeight: 600, border: 'none', boxShadow: 'var(--shadow-primary-sm)' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo yêu cầu điều chỉnh
          </Button>
        </Space>
      </div>

      <Card style={{ background: '#fff', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
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
        title="Báo cáo chênh lệch / Điều chỉnh tồn kho"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ warehouseId: activeWarehouse?.id }}>
          <Form.Item name="warehouseId" label="Kho hàng" rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}>
            <Select placeholder="Địa điểm kho hàng">
              {warehousesData?.content?.map((w: any) => (
                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="materialId" label="Vật liệu" rules={[{ required: true, message: 'Vui lòng chọn vật liệu' }]}>
            <Select placeholder="Mã SKU / Tên vật liệu" showSearch optionFilterProp="children">
              {materialsData?.content?.map((m: any) => (
                <Select.Option key={m.id} value={m.id}>
                  [{m.sku}] {m.name} ({m.color || 'Tiêu chuẩn'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="actualQuantity" label="Số lượng thực tế kiểm kê" rules={[{ required: true, message: 'Vui lòng nhập số lượng thực tế' }]}>
            <InputNumber min={0} step={1} placeholder="Số lượng thực tế sau kiểm đếm" style={{ width: '100%', borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="reason" label="Lý do chênh lệch" rules={[{ required: true, message: 'Lý do là bắt buộc' }]}>
            <Input.TextArea rows={3} placeholder="Giải trình chênh lệch (VD: Hỏng cuộn nhựa khi in, sai lệch kiểm kê, hư hại trong kho...)" style={{ borderRadius: 'var(--radius-default, 16px)' }} />
          </Form.Item>

          <Form.Item name="evidence" label="Tham chiếu kiểm kê / Liên kết bằng chứng">
            <Input placeholder="Link ảnh, mã phiếu sự cố, số biên bản kiểm kê..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button style={{ borderRadius: 'var(--radius-pill, 9999px)' }} onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--primary, #7C5CFC)', border: 'none', fontWeight: 600 }}>
              Tạo yêu cầu điều chỉnh
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StockAdjustmentsPage;
