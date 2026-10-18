import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload } from '../types/warehouse.types';

interface WarehouseFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateWarehousePayload | UpdateWarehousePayload) => Promise<void>;
  warehouse: Warehouse | null;
  loading: boolean;
}

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  warehouse,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (warehouse) {
        form.setFieldsValue({
          code: warehouse.code,
          name: warehouse.name,
          location: warehouse.location || '',
          status: warehouse.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, warehouse, form]);

  const handleFinish = async (values: any) => {
    await onSubmit(values);
  };

  return (
    <Modal
      title={warehouse ? `Edit Warehouse Hub: ${warehouse.code}` : 'Register New Warehouse Hub (F02)'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="code"
          label="Warehouse Code"
          rules={[
            { required: true, message: 'Warehouse code is required' },
            { pattern: /^[A-Z0-9_-]+$/i, message: 'Alphanumeric characters only' },
          ]}
        >
          <Input placeholder="e.g. WH-HCM-01, WH-HAN-02" style={{ textTransform: 'uppercase' }} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Facility Name"
          rules={[{ required: true, message: 'Warehouse name is required' }]}
        >
          <Input placeholder="e.g. HCM District 9 Main Hub" />
        </Form.Item>

        <Form.Item name="location" label="Physical Address / Zone">
          <Input placeholder="e.g. Lot E2a-7, D1 Street, Hi-Tech Park, Thu Duc City" />
        </Form.Item>

        {warehouse && (
          <Form.Item name="status" label="Operational Status">
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
