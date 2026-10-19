import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Alert, Space, Typography, Descriptions, Tag } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import type { PrintJob, ReserveStockPayload } from '../types/printJob.types';
import type { Warehouse } from '../../warehouse/types/warehouse.types';
import { useInventoryBalances } from '../../inventory/hooks/useInventory';

const { Text } = Typography;

interface ReserveModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: ReserveStockPayload) => Promise<void>;
  job: PrintJob | null;
  warehouses: Warehouse[];
  loading: boolean;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  open,
  onCancel,
  onSubmit,
  job,
  warehouses,
  loading,
}) => {
  const [form] = Form.useForm();

  const { data: balancesData } = useInventoryBalances({
    materialId: job?.materialId,
    limit: 50,
  });

  const balances = balancesData?.content || [];

  useEffect(() => {
    if (open && job) {
      form.resetFields();
      form.setFieldsValue({
        warehouseId: warehouses[0]?.id,
        reservedGram: job.estimatedGram || 400,
      });
    }
  }, [open, job, warehouses, form]);

  const handleFinish = async (values: any) => {
    await onSubmit({
      warehouseId: values.warehouseId,
      reservedGram: Number(values.reservedGram),
    });
  };

  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const selectedBalance = balances.find((b) => b.warehouseId === selectedWarehouseId);

  return (
    <Modal
      title={
        <Space>
          <LockOutlined style={{ color: '#fbbf24' }} />
          <span>Xác nhận giữ chỗ vật liệu (F06)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác nhận giữ chỗ"
      cancelText="Hủy"
      width={560}
      destroyOnClose
    >
      <Alert
        message="Phân bổ và tạm khóa tồn kho"
        description="Giữ chỗ vật liệu sẽ chuyển trạng thái tồn kho khả dụng sang tạm khóa theo lệnh in, đảm bảo nguyên liệu sẵn sàng cho bàn in."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Mã lệnh in">
          <Text strong>{job?.jobNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Vật liệu yêu cầu">
          <Tag color="cyan">{job?.materialSku}</Tag> {job?.materialName} ({job?.materialColor})
        </Descriptions.Item>
        <Descriptions.Item label="Nhu cầu ước tính (G-Code)">
          <Text strong style={{ color: '#0ea5e9' }}>{job?.estimatedGram} g</Text>
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="warehouseId"
          label="Chọn kho thực hiện giữ chỗ"
          rules={[{ required: true, message: 'Vui lòng chọn kho thực hiện' }]}
        >
          <Select placeholder="Chọn kho hàng">
            {warehouses.map((wh) => {
              const b = balances.find((bal) => bal.warehouseId === wh.id);
              const avail = b ? b.availableGram : 0;
              return (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.code} — Khả dụng: {avail}g
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        {selectedBalance && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Tồn kho khả dụng tại {selectedBalance.warehouseCode}:{' '}
            </Text>
            <Text strong style={{ color: selectedBalance.availableGram >= (job?.estimatedGram || 0) ? '#10b981' : '#ef4444' }}>
              {selectedBalance.availableGram} g
            </Text>
          </div>
        )}

        <Form.Item
          name="reservedGram"
          label="Khối lượng giữ chỗ (Gram)"
          rules={[
            { required: true, message: 'Vui lòng nhập khối lượng' },
            { type: 'number', min: 1, message: 'Khối lượng phải lớn hơn 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="g" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
