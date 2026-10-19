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
      title={warehouse ? `Chỉnh sửa cơ sở kho: ${warehouse.code}` : 'Thêm mới cơ sở kho'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="code"
          label="Mã kho"
          rules={[
            { required: true, message: 'Mã kho không được để trống' },
            { pattern: /^[A-Z0-9_-]+$/i, message: 'Chỉ chấp nhận ký tự chữ cái, số và dấu gạch nối' },
          ]}
        >
          <Input placeholder="Ví dụ: KHO-HCM-01, KHO-HN-02" style={{ textTransform: 'uppercase' }} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên cơ sở kho"
          rules={[{ required: true, message: 'Tên kho không được để trống' }]}
        >
          <Input placeholder="Ví dụ: Kho Trung tâm Quận 9 - TP.HCM" />
        </Form.Item>

        <Form.Item name="location" label="Địa chỉ / Khu vực">
          <Input placeholder="Ví dụ: Lô E2a-7, Đường D1, Khu Công nghệ cao, TP. Thủ Đức" />
        </Form.Item>

        {warehouse && (
          <Form.Item name="status" label="Trạng thái hoạt động">
            <Select>
              <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
