import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Input, Alert, Space, Typography, Descriptions, Tag } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { PrintJob, MaterialIssuePayload } from '../types/printJob.types';
import type { Warehouse } from '../../warehouse/types/warehouse.types';

const { Text } = Typography;

interface IssueModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: MaterialIssuePayload) => Promise<void>;
  job: PrintJob | null;
  warehouses: Warehouse[];
  loading: boolean;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  open,
  onCancel,
  onSubmit,
  job,
  warehouses,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && job) {
      form.resetFields();
      form.setFieldsValue({
        warehouseId: warehouses[0]?.id,
        issuedGram: job.estimatedGram || 400,
        note: `Cuộn nhựa lắp vào máy in ${job.printerName || 'Bàn in hàng đợi'}`,
      });
    }
  }, [open, job, warehouses, form]);

  const handleFinish = async (values: any) => {
    await onSubmit({
      warehouseId: values.warehouseId,
      issuedGram: Number(values.issuedGram),
      note: values.note,
    });
  };

  return (
    <Modal
      title={
        <Space>
          <ExportOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
          <span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700 }}>Xuất kho & Cấp vật liệu lên máy in (F07)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xuất cấp vật liệu"
      cancelText="Hủy"
      width={560}
      destroyOnClose
    >
      <Alert
        message="Thực hiện lấy hàng & xuất kho"
        description="Ghi nhận thao tác thực tế bàn giao cuộn nhựa/vật liệu từ kệ kho đến máy in 3D tương ứng."
        type="info"
        showIcon
        style={{ marginBottom: 16, borderRadius: 'var(--radius-default, 16px)', background: 'var(--surface-container, #F1EBFF)', borderColor: 'var(--border-default, #E2D9F7)' }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16, borderRadius: 'var(--radius-default, 16px)', overflow: 'hidden' }}>
        <Descriptions.Item label="Lệnh in mục tiêu">
          <Text strong style={{ color: 'var(--primary, #7C5CFC)' }}>{job?.jobNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Máy in chỉ định">
          <Tag style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--surface-high, #EBE4FF)', color: 'var(--primary, #7C5CFC)', border: 'none', fontWeight: 600 }}>{job?.printerName || 'Máy in xưởng'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Vật liệu yêu cầu">
          <Tag style={{ borderRadius: 'var(--radius-full, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary, #7C5CFC)', border: '1px solid var(--border-default, #E2D9F7)' }}>{job?.materialSku}</Tag> {job?.materialName}
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="warehouseId"
          label="Kho xuất hàng"
          rules={[{ required: true, message: 'Vui lòng chọn kho xuất hàng' }]}
        >
          <Select placeholder="Chọn kho hàng">
            {warehouses.map((wh) => (
              <Select.Option key={wh.id} value={wh.id}>
                {wh.code} — {wh.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="issuedGram"
          label="Khối lượng xuất cấp thực tế (Gram)"
          rules={[
            { required: true, message: 'Vui lòng nhập khối lượng' },
            { type: 'number', min: 1, message: 'Khối lượng phải lớn hơn 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="g" />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú xuất kho / Mã vạch cuộn nhựa">
          <Input.TextArea rows={2} placeholder="Số serial cuộn nhựa hoặc ghi chú kỹ thuật viên..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
