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
          <span>Material Reservation Confirmation (F06)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Confirm Reservation"
      width={560}
      destroyOnClose
    >
      <Alert
        message="Stock Hold Allocation"
        description="Reserving material will transition available inventory into reserved inventory, guaranteeing stock for this print job."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Print Job #">
          <Text strong>{job?.jobNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Required Material">
          <Tag color="cyan">{job?.materialSku}</Tag> {job?.materialName} ({job?.materialColor})
        </Descriptions.Item>
        <Descriptions.Item label="Estimated G-Code Requirement">
          <Text strong style={{ color: '#0ea5e9' }}>{job?.estimatedGram} grams</Text>
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="warehouseId"
          label="Select Fulfilling Warehouse"
          rules={[{ required: true, message: 'Please select warehouse' }]}
        >
          <Select placeholder="Select warehouse">
            {warehouses.map((wh) => {
              const b = balances.find((bal) => bal.warehouseId === wh.id);
              const avail = b ? b.availableGram : 0;
              return (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.code} — Available: {avail}g
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        {selectedBalance && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Available at {selectedBalance.warehouseCode}:{' '}
            </Text>
            <Text strong style={{ color: selectedBalance.availableGram >= (job?.estimatedGram || 0) ? '#10b981' : '#ef4444' }}>
              {selectedBalance.availableGram} grams
            </Text>
          </div>
        )}

        <Form.Item
          name="reservedGram"
          label="Quantity to Reserve (Grams)"
          rules={[
            { required: true, message: 'Quantity is required' },
            { type: 'number', min: 1, message: 'Must be > 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="grams" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
