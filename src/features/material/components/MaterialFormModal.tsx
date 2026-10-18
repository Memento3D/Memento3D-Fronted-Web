import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Space } from 'antd';
import type { Material, CreateMaterialPayload, UpdateMaterialPayload, MaterialType } from '../types/material.types';

interface MaterialFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateMaterialPayload | UpdateMaterialPayload) => Promise<void>;
  material: Material | null;
  loading: boolean;
}

const MATERIAL_TYPES: MaterialType[] = ['PLA', 'PETG', 'ABS', 'RESIN', 'TPU', 'NYLON', 'OTHER'];

const DEFAULT_PRESETS: Record<MaterialType, { printMin: number; printMax: number; bedMin: number; bedMax: number; density: number }> = {
  PLA: { printMin: 190, printMax: 220, bedMin: 50, bedMax: 60, density: 1.24 },
  PETG: { printMin: 220, printMax: 250, bedMin: 70, bedMax: 85, density: 1.27 },
  ABS: { printMin: 230, printMax: 260, bedMin: 90, bedMax: 110, density: 1.04 },
  RESIN: { printMin: 25, printMax: 35, bedMin: 0, bedMax: 0, density: 1.15 },
  TPU: { printMin: 210, printMax: 230, bedMin: 30, bedMax: 60, density: 1.21 },
  NYLON: { printMin: 240, printMax: 270, bedMin: 70, bedMax: 90, density: 1.14 },
  OTHER: { printMin: 200, printMax: 230, bedMin: 50, bedMax: 60, density: 1.20 },
};

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  material,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (material) {
        form.setFieldsValue({
          sku: material.sku,
          name: material.name,
          materialType: material.materialType,
          color: material.color,
          colorHex: material.colorHex || '#0ea5e9',
          density: material.density ?? 1.24,
          diameter: material.diameter ?? 1.75,
          printTempMin: material.printTempMin ?? 200,
          printTempMax: material.printTempMax ?? 220,
          bedTempMin: material.bedTempMin ?? 60,
          bedTempMax: material.bedTempMax ?? 60,
          unitCost: material.unitCost,
          status: material.status,
          description: material.description || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          materialType: 'PLA',
          color: 'Jet Black',
          colorHex: '#1e293b',
          density: 1.24,
          diameter: 1.75,
          printTempMin: 200,
          printTempMax: 220,
          bedTempMin: 50,
          bedTempMax: 60,
          unitCost: 250,
          description: '',
        });
      }
    }
  }, [open, material, form]);

  const handleTypeChange = (type: MaterialType) => {
    const preset = DEFAULT_PRESETS[type];
    if (preset) {
      form.setFieldsValue({
        density: preset.density,
        printTempMin: preset.printMin,
        printTempMax: preset.printMax,
        bedTempMin: preset.bedMin,
        bedTempMax: preset.bedMax,
      });
    }
  };

  const handleFinish = async (values: any) => {
    await onSubmit(values);
  };

  return (
    <Modal
      title={material ? `Edit Material: ${material.sku}` : 'Create New Filament Material (F01)'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={680}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          materialType: 'PLA',
          diameter: 1.75,
          density: 1.24,
          unitCost: 250,
        }}
      >
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              name="sku"
              label="SKU Code"
              rules={[
                { required: true, message: 'SKU is required' },
                { pattern: /^[A-Z0-9_-]+$/i, message: 'Alphanumeric and dashes only' },
              ]}
            >
              <Input placeholder="e.g. PLA-BLK-175" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              name="name"
              label="Material Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Hyper Series PLA Black" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="materialType"
              label="Polymer Type"
              rules={[{ required: true }]}
            >
              <Select onChange={handleTypeChange}>
                {MATERIAL_TYPES.map((t) => (
                  <Select.Option key={t} value={t}>
                    {t}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="color"
              label="Color Name"
              rules={[{ required: true, message: 'Color is required' }]}
            >
              <Input placeholder="e.g. Signal White / Jet Black" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="colorHex" label="Color Swatch">
              <Space orientation="horizontal">
                <Input
                  type="color"
                  style={{ width: 44, padding: 2, height: 32, cursor: 'pointer' }}
                />
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="diameter" label="Diameter (mm)">
              <InputNumber min={0.5} max={5.0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="density" label="Density (g/cm³)">
              <InputNumber min={0.5} max={3.0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="unitCost"
              label="Unit Cost per Gram (VND)"
              rules={[{ required: true, message: 'Unit cost is required' }]}
            >
              <InputNumber
                min={0}
                step={10}
                style={{ width: '100%' }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="printTempMin" label="Nozzle Min (°C)">
              <InputNumber min={0} max={400} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="printTempMax" label="Nozzle Max (°C)">
              <InputNumber min={0} max={400} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bedTempMin" label="Bed Min (°C)">
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bedTempMax" label="Bed Max (°C)">
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {material && (
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item name="description" label="Notes / Supplier Description">
          <Input.TextArea rows={2} placeholder="Optional technical or batch notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
