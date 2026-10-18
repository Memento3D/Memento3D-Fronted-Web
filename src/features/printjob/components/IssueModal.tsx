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
        note: `Spool loaded onto printer ${job.printerName || 'Queue Bed'}`,
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
          <ExportOutlined style={{ color: '#0ea5e9' }} />
          <span>Material Picking & Printer Loading (F07)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Issue Material to Bed"
      width={560}
      destroyOnClose
    >
      <Alert
        message="Warehouse Picking Execution"
        description="This records the physical handover of the filament spool from the warehouse shelf to the 3D printer."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Target Job">
          <Text strong>{job?.jobNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Assigned Printer">
          <Tag color="purple">{job?.printerName || 'Workshop Printer'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Required Material">
          <Tag color="cyan">{job?.materialSku}</Tag> {job?.materialName}
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="warehouseId"
          label="Source Warehouse Hub"
          rules={[{ required: true, message: 'Please select warehouse' }]}
        >
          <Select placeholder="Select warehouse">
            {warehouses.map((wh) => (
              <Select.Option key={wh.id} value={wh.id}>
                {wh.code} — {wh.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="issuedGram"
          label="Quantity Handed Over (Grams)"
          rules={[
            { required: true, message: 'Quantity is required' },
            { type: 'number', min: 1, message: 'Must be > 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="grams" />
        </Form.Item>

        <Form.Item name="note" label="Picker Note / Serial Barcode">
          <Input.TextArea rows={2} placeholder="Optional spool serial number or technician note..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
