import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Alert,
} from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { CreateStockIssuePayload } from '../types/inventory.types';
import type { Material } from '../../material/types/material.types';
import type { Warehouse } from '../../warehouse/types/warehouse.types';

interface ManualIssueModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateStockIssuePayload) => Promise<void>;
  warehouses: Warehouse[];
  materials: Material[];
  initialWarehouseId?: string;
  initialMaterialId?: string;
  loading: boolean;
}

const ISSUE_REASONS = [
  'PRINTER_CALIBRATION (Test & bed leveling)',
  'DAMAGED_FILAMENT (Moisture / brittle scrap)',
  'INTERNAL_PROTOTYPE (R&D Sample run)',
  'INVENTORY_ADJUSTMENT (Audit variance)',
  'SAMPLE_FOR_CUSTOMER (Client demonstration)',
  'OTHER_DISPOSAL',
];

export const ManualIssueModal: React.FC<ManualIssueModalProps> = ({
  open,
  onCancel,
  onSubmit,
  warehouses,
  materials,
  initialWarehouseId,
  initialMaterialId,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        warehouseId: initialWarehouseId || warehouses[0]?.id,
        materialId: initialMaterialId || materials[0]?.id,
        quantityGram: 500,
        reason: ISSUE_REASONS[0],
      });
    }
  }, [open, initialWarehouseId, initialMaterialId, warehouses, materials, form]);

  const handleFinish = async (values: any) => {
    const idempotencyKey = `ISS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await onSubmit({
      warehouseId: values.warehouseId,
      materialId: values.materialId,
      quantityGram: Number(values.quantityGram),
      reason: values.reason,
      idempotencyKey,
      note: values.note,
    });
  };

  return (
    <Modal
      title={
        <Space>
          <ExportOutlined style={{ color: '#ef4444' }} />
          <span>Manual Stock Issue (F05)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Issue & Decrement Stock"
      okButtonProps={{ danger: true }}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Stock Deduction Warning"
        description="Manual stock issuance directly decrements physical inventory on-hand. This action is permanently audited in the ACID transaction ledger."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="warehouseId"
              label="Source Warehouse Hub"
              rules={[{ required: true, message: 'Please select warehouse' }]}
            >
              <Select placeholder="Select warehouse source">
                {warehouses.map((wh) => (
                  <Select.Option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="materialId"
              label="Material Filament"
              rules={[{ required: true, message: 'Please select material' }]}
            >
              <Select placeholder="Select material SKU" showSearch optionFilterProp="children">
                {materials.map((mat) => (
                  <Select.Option key={mat.id} value={mat.id}>
                    [{mat.sku}] {mat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="quantityGram"
          label="Deduction Quantity (Grams)"
          rules={[
            { required: true, message: 'Quantity is required' },
            { type: 'number', min: 1, message: 'Quantity must be > 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="grams" step={50} />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Audit Justification Reason"
          rules={[{ required: true, message: 'Mandatory reason is required' }]}
        >
          <Select placeholder="Select primary reason">
            {ISSUE_REASONS.map((reason) => (
              <Select.Option key={reason} value={reason}>
                {reason}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="note" label="Additional Audit Notes">
          <Input.TextArea rows={2} placeholder="Responsible technician, machine ID, or ticket number..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
