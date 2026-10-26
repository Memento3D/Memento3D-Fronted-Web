import React from 'react';
import { Modal, Form, Select, InputNumber, Button, message, Alert } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '../../material/api/materialApi';
import { printJobApi } from '../../printjob/api/printJobApi';
import type { OrderResponse } from '../types/order.types';

interface OrderPrintJobLinkModalProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OrderPrintJobLinkModal: React.FC<OrderPrintJobLinkModalProps> = ({
  order,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: materialsData, isLoading: loadingMaterials } = useQuery({
    queryKey: ['active-materials'],
    queryFn: () => materialApi.list({ status: 'ACTIVE', limit: 50 }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const createJobMutation = useMutation({
    mutationFn: printJobApi.create,
    onSuccess: () => {
      message.success('Đã tạo Lệnh in 3D và liên kết với đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      message.error(err.message || 'Không thể tạo Lệnh in 3D');
    },
  });

  if (!order) return null;

  const handleSubmit = async (values: any) => {
    await createJobMutation.mutateAsync({
      orderId: order.id,
      materialId: values.materialId,
      estimatedGram: values.estimatedGram,
      estimatedDurationSeconds: values.estimatedDurationSeconds,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <PrinterOutlined style={{ color: 'var(--primary)' }} />
          <span>Lập lệnh in (Print Job) cho đơn #{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
      }
      footer={null}
      destroyOnClose
    >
      <Alert
        message="Liên kết quy trình sản xuất in 3D"
        description="Lệnh in sẽ được khởi tạo trong WMS, cho phép đặt giữ cuộn nhựa/resin tại kho và phân công máy in."
        type="info"
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          estimatedGram: 250,
          estimatedDurationSeconds: 14400,
        }}
      >
        <Form.Item
          name="materialId"
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Vật liệu in</span>}
          rules={[{ required: true, message: 'Vui lòng chọn vật liệu in' }]}
        >
          <Select
            placeholder="Chọn vật liệu trong kho..."
            loading={loadingMaterials}
            options={(materialsData?.content || []).map((m) => ({
              label: `${m.name} (${m.materialType} - ${m.color}) [SKU: ${m.sku}]`,
              value: m.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="estimatedGram"
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Khối lượng vật liệu dự kiến (Grams)</span>}
          rules={[{ required: true, message: 'Vui lòng nhập khối lượng dự kiến' }]}
        >
          <InputNumber
            min={1}
            max={10000}
            step={10}
            style={{ width: '100%' }}
            placeholder="Ví dụ: 300"
          />
        </Form.Item>

        <Form.Item
          name="estimatedDurationSeconds"
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Thời gian in ước tính (Giây)</span>}
        >
          <InputNumber
            min={60}
            step={600}
            style={{ width: '100%' }}
            placeholder="Ví dụ: 14400 (4 giờ)"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button onClick={onClose} style={{ borderRadius: 8 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createJobMutation.isPending}
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
            }}
          >
            Tạo Lệnh in 3D
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
