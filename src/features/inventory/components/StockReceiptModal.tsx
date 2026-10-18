import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Checkbox,
  Space,
  Button,
  Typography,
  Descriptions,
  Tag,
  Alert,
} from 'antd';
import {
  InboxOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CreateStockReceiptPayload } from '../types/inventory.types';
import type { Material } from '../../material/types/material.types';
import type { Warehouse } from '../../warehouse/types/warehouse.types';

const { Text } = Typography;

interface StockReceiptModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateStockReceiptPayload) => Promise<void>;
  warehouses: Warehouse[];
  materials: Material[];
  initialWarehouseId?: string;
  initialMaterialId?: string;
  loading: boolean;
}

export const StockReceiptModal: React.FC<StockReceiptModalProps> = ({
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
  const [spoolCount, setSpoolCount] = useState<number>(2);
  const spoolWeight = 1000;
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      const defaultWh = initialWarehouseId || (warehouses[0]?.id ?? '');
      const defaultMat = initialMaterialId || (materials[0]?.id ?? '');
      const selectedMatObj = materials.find((m) => m.id === defaultMat);

      form.setFieldsValue({
        warehouseId: defaultWh,
        materialId: defaultMat,
        quantityGram: spoolCount * spoolWeight,
        unitCost: selectedMatObj?.unitCost || 250,
        supplier: 'Creality Official Store',
        batchNumber: `LOT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        qcChecklist: ['vacuum_seal', 'desiccant', 'visual_pass'],
      });
    }
  }, [open, initialWarehouseId, initialMaterialId, warehouses, materials, form]);

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (mat) {
      form.setFieldsValue({ unitCost: mat.unitCost });
    }
  };

  const handleSpoolPreset = (count: number) => {
    setSpoolCount(count);
    const total = count * spoolWeight;
    form.setFieldsValue({ quantityGram: total });
  };

  const handleQuantityGramChange = (gram: number | null) => {
    if (gram && gram > 0) {
      setSpoolCount(Number((gram / spoolWeight).toFixed(2)));
    }
  };

  const handleFormFinish = (values: any) => {
    setPendingValues(values);
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    if (!pendingValues) return;
    const idempotencyKey = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const payload: CreateStockReceiptPayload = {
      warehouseId: pendingValues.warehouseId,
      materialId: pendingValues.materialId,
      quantityGram: Number(pendingValues.quantityGram),
      unitCost: Number(pendingValues.unitCost) || 0,
      supplier: pendingValues.supplier,
      batchNumber: pendingValues.batchNumber,
      idempotencyKey,
      note: pendingValues.note,
    };

    await onSubmit(payload);
    setIsConfirmModalOpen(false);
  };

  const selectedWarehouse = warehouses.find((w) => w.id === form.getFieldValue('warehouseId'));
  const selectedMaterial = materials.find((m) => m.id === form.getFieldValue('materialId'));
  const currentQty = form.getFieldValue('quantityGram') || 0;
  const currentCost = form.getFieldValue('unitCost') || 0;

  return (
    <>
      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: '#0ea5e9' }} />
            <span>Goods Receipt Registration (F04)</span>
          </Space>
        }
        open={open}
        onCancel={onCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Review & Register Receipt"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warehouseId"
                label="Destination Warehouse Hub"
                rules={[{ required: true, message: 'Please select warehouse' }]}
              >
                <Select placeholder="Select warehouse destination">
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
                label="Material Filament Profile"
                rules={[{ required: true, message: 'Please select material' }]}
              >
                <Select
                  placeholder="Select material SKU"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleMaterialChange}
                >
                  {materials.map((mat) => (
                    <Select.Option key={mat.id} value={mat.id}>
                      [{mat.sku}] {mat.name} ({mat.color})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Spool Calculator Box */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(14, 165, 233, 0.06)',
              borderRadius: 8,
              border: '1px solid rgba(14, 165, 233, 0.2)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Space>
                <CalculatorOutlined style={{ color: '#0ea5e9' }} />
                <Text strong style={{ color: '#38bdf8' }}>Spool Calculator Preset</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                1 standard spool = 1,000 grams
              </Text>
            </div>
            <Space wrap>
              {[1, 2, 5, 10, 20].map((count) => (
                <Button
                  key={count}
                  size="small"
                  type={spoolCount === count ? 'primary' : 'default'}
                  onClick={() => handleSpoolPreset(count)}
                >
                  {count} {count === 1 ? 'Spool' : 'Spools'} ({count}kg)
                </Button>
              ))}
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantityGram"
                label="Total Quantity to Receive (Grams)"
                rules={[
                  { required: true, message: 'Quantity is required' },
                  { type: 'number', min: 1, message: 'Quantity must be > 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={100}
                  addonAfter="grams"
                  onChange={handleQuantityGramChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitCost"
                label="Unit Cost per Gram (VND)"
                rules={[{ required: true, message: 'Cost is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  addonAfter="đ/g"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplier" label="Supplier / Vendor">
                <Input placeholder="e.g. Creality Vietnam, eSUN Official" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchNumber"
                label="Batch / Lot Number"
                rules={[{ required: true, message: 'Batch number is required' }]}
              >
                <Input placeholder="e.g. LOT-202610-449" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qcChecklist"
            label={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#10b981' }} />
                <span>Quality Inspection (QC Checklist)</span>
              </Space>
            }
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[12, 8]}>
                <Col span={8}>
                  <Checkbox value="vacuum_seal">Vacuum seal intact</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="desiccant">Desiccant pack included</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="visual_pass">Color & diameter check passed</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="note" label="Receipt Notes / Remarks">
            <Input.TextArea rows={2} placeholder="Optional delivery invoice notes..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <span>Confirm Inventory Receipt Registration</span>
          </Space>
        }
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={handleFinalConfirm}
        confirmLoading={loading}
        okText="Confirm & Commit ACID Stock In"
        width={560}
      >
        <Alert
          message="Atomic Transaction Confirmation"
          description="Submitting this action will immediately increment physical on-hand inventory balances in the PostgreSQL ledger."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Destination Warehouse">
            <Tag color="blue">{selectedWarehouse?.code}</Tag> {selectedWarehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Material SKU">
            <Tag color="cyan">{selectedMaterial?.sku}</Tag> {selectedMaterial?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Inbound Quantity">
            <Text strong style={{ color: '#10b981', fontSize: 15 }}>
              {Number(pendingValues?.quantityGram || currentQty).toLocaleString()} g
            </Text>{' '}
            ({(Number(pendingValues?.quantityGram || currentQty) / 1000).toFixed(2)} kg / {spoolCount} spools)
          </Descriptions.Item>
          <Descriptions.Item label="Total Batch Value">
            <Text strong style={{ color: '#fbbf24' }}>
              {(Number(pendingValues?.quantityGram || currentQty) * Number(pendingValues?.unitCost || currentCost)).toLocaleString()} VND
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Batch / Lot">
            <Text code>{pendingValues?.batchNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {pendingValues?.supplier || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
};
