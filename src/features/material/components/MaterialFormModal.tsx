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
      title={material ? `Chỉnh sửa vật liệu: ${material.sku}` : 'Thêm mới vật liệu in 3D'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
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
              label="Mã SKU"
              rules={[
                { required: true, message: 'Mã SKU không được để trống' },
                { pattern: /^[A-Z0-9_-]+$/i, message: 'Chỉ chấp nhận chữ cái, số và dấu gạch nối' },
              ]}
            >
              <Input placeholder="Ví dụ: PLA-BLK-175" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              name="name"
              label="Tên vật liệu"
              rules={[{ required: true, message: 'Tên vật liệu không được để trống' }]}
            >
              <Input placeholder="Ví dụ: Hyper Series PLA Đen bóng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="materialType"
              label="Loại vật liệu"
              rules={[{ required: true, message: 'Vui lòng chọn loại vật liệu' }]}
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
              label="Tên màu sắc"
              rules={[{ required: true, message: 'Màu sắc không được để trống' }]}
            >
              <Input placeholder="Ví dụ: Đen tuyền / Trắng ngọc trai" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="colorHex" label="Mã màu hiển thị">
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
            <Form.Item name="diameter" label="Đường kính sợi (mm)">
              <InputNumber min={0.5} max={5.0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="density" label="Khối lượng riêng (g/cm³)">
              <InputNumber min={0.5} max={3.0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="unitCost"
              label="Đơn giá mỗi gram (VND)"
              rules={[{ required: true, message: 'Đơn giá không được để trống' }]}
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
            <Form.Item name="printTempMin" label="Nhiệt độ vòi min (°C)">
              <InputNumber min={0} max={400} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="printTempMax" label="Nhiệt độ vòi max (°C)">
              <InputNumber min={0} max={400} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bedTempMin" label="Nhiệt độ bàn min (°C)">
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bedTempMax" label="Nhiệt độ bàn max (°C)">
              <InputNumber min={0} max={200} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {material && (
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item name="description" label="Ghi chú kỹ thuật / Nhà cung cấp">
          <Input.TextArea rows={2} placeholder="Ghi chú kỹ thuật, tiêu chuẩn lưu kho hoặc nhà sản xuất..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
