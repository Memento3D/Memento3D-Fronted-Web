import React, { useState } from 'react';
import {
  Card,
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
  Table,
  Tag,
  Descriptions,
  Modal,
  Alert,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  InboxOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useWarehouses } from '../../warehouse/hooks/useWarehouses';
import { useMaterials } from '../../material/hooks/useMaterials';
import { useStockReceipts, useInventoryMutations } from '../hooks/useInventory';
import type { StockReceipt, CreateStockReceiptPayload } from '../types/inventory.types';

const { Title, Text } = Typography;

export const StockReceiptPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [spoolCount, setSpoolCount] = useState<number>(2);
  const [spoolWeight] = useState<number>(1000);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });
  const { data: receiptsData, isLoading: isLoadingReceipts } = useStockReceipts({ limit: 15 });

  const { receiptMutation } = useInventoryMutations();

  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];
  const receipts = receiptsData?.content || [];

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (mat) {
      form.setFieldsValue({ unitCost: mat.unitCost });
    }
  };

  const handleSpoolPreset = (count: number) => {
    setSpoolCount(count);
    form.setFieldsValue({ quantityGram: count * spoolWeight });
  };

  const handleFinish = (values: any) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  };

  const handleCommitReceipt = async () => {
    if (!pendingValues) return;
    try {
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

      const res = await receiptMutation.mutateAsync(payload);
      message.success(`Receipt #${res.receiptNumber} successfully booked into warehouse!`);
      setIsConfirmOpen(false);
      form.resetFields();
      form.setFieldsValue({
        quantityGram: 2000,
        unitCost: 250,
        batchNumber: `LOT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        qcChecklist: ['vacuum_seal', 'desiccant', 'visual_pass'],
      });
      setSpoolCount(2);
    } catch (err: any) {
      message.error(err.message || 'Failed to submit receipt');
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === form.getFieldValue('warehouseId'));
  const selectedMaterial = materials.find((m) => m.id === form.getFieldValue('materialId'));

  const columns: ColumnsType<StockReceipt> = [
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (num: string) => (
        <Text strong copyable style={{ color: '#38bdf8' }}>
          {num}
        </Text>
      ),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Material SKU',
      dataIndex: 'materialSku',
      key: 'materialSku',
      render: (sku: string, record) => (
        <Space orientation="vertical" size={2}>
          <Text strong>{sku}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Inbound Qty',
      dataIndex: 'quantityGram',
      key: 'quantityGram',
      render: (qty: number) => (
        <Text strong style={{ color: '#10b981' }}>
          +{(qty / 1000).toFixed(2)} kg ({qty.toLocaleString()}g)
        </Text>
      ),
    },
    {
      title: 'Batch / Lot',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (batch: string) => <Text code>{batch || 'N/A'}</Text>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (sup: string) => sup || 'Default Supplier',
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: 'Print Slip',
      key: 'print',
      align: 'right',
      render: () => (
        <Button
          type="text"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Inbound Stock Receipt (F04)
          </Title>
          <Text type="secondary">
            Receive incoming filament consignments, verify QC metrics, and register serial batch tags.
          </Text>
        </div>
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
          Print Receiving Slip
        </Button>
      </div>

      {/* Main Receiving Form */}
      <Card
        title={
          <Space>
            <InboxOutlined style={{ color: '#0ea5e9' }} />
            <span>Goods Receipt Form</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            quantityGram: 2000,
            unitCost: 250,
            batchNumber: `LOT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
            supplier: 'Creality Vietnam Distribution',
            qcChecklist: ['vacuum_seal', 'desiccant', 'visual_pass'],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="warehouseId"
                label="Destination Warehouse Facility"
                rules={[{ required: true, message: 'Please select destination warehouse' }]}
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
            <Col xs={24} md={12}>
              <Form.Item
                name="materialId"
                label="Material Profile (Filament)"
                rules={[{ required: true, message: 'Please select material SKU' }]}
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

          {/* Spool Presets */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(14, 165, 233, 0.06)',
              borderRadius: 8,
              border: '1px solid rgba(14, 165, 233, 0.2)',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Space>
                <CalculatorOutlined style={{ color: '#0ea5e9' }} />
                <Text strong style={{ color: '#38bdf8' }}>Spool Counter & Presets</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Calculated at 1,000 grams per standard spool
              </Text>
            </div>
            <Space wrap>
              {[1, 2, 4, 5, 10, 20].map((c) => (
                <Button
                  key={c}
                  size="small"
                  type={spoolCount === c ? 'primary' : 'default'}
                  onClick={() => handleSpoolPreset(c)}
                >
                  {c} {c === 1 ? 'Spool' : 'Spools'} ({c}kg)
                </Button>
              ))}
            </Space>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="quantityGram"
                label="Total Inbound Quantity (Grams)"
                rules={[
                  { required: true, message: 'Quantity is required' },
                  { type: 'number', min: 1, message: 'Must be > 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={100}
                  addonAfter="grams"
                  onChange={(val) => {
                    const num = Number(val);
                    if (num > 0) setSpoolCount(Number((num / 1000).toFixed(2)));
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="unitCost"
                label="Unit Cost per Gram (VND)"
                rules={[{ required: true, message: 'Unit cost is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  addonAfter="VND / g"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="supplier" label="Supplier / Consignor">
                <Input placeholder="e.g. Creality Vietnam Distribution" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="batchNumber"
                label="Batch / Lot Identification Tag"
                rules={[{ required: true, message: 'Batch number is required' }]}
              >
                <Input placeholder="e.g. LOT-202610-881" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qcChecklist"
            label={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#10b981' }} />
                <span>Quality Inspection Checklist</span>
              </Space>
            }
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={8}>
                  <Checkbox value="vacuum_seal">Vacuum seal packaging intact</Checkbox>
                </Col>
                <Col xs={24} sm={8}>
                  <Checkbox value="desiccant">Silica desiccant packet present</Checkbox>
                </Col>
                <Col xs={24} sm={8}>
                  <Checkbox value="visual_pass">Color swatch & 1.75mm diameter verified</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="note" label="Receipt Notes & Waybill Details">
            <Input.TextArea rows={2} placeholder="Optional delivery notes or courier tracking number..." />
          </Form.Item>

          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={() => form.submit()}
            loading={receiptMutation.isPending}
            style={{ width: '100%', marginTop: 8 }}
          >
            Review & Commit Inbound Stock Receipt
          </Button>
        </Form>
      </Card>

      {/* Recent Receipts Audit Table */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0ea5e9' }} />
            <span>Recent Goods Receipts Audit History</span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="id"
          loading={isLoadingReceipts}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <span>Verify & Commit Receipt</span>
          </Space>
        }
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onOk={handleCommitReceipt}
        confirmLoading={receiptMutation.isPending}
        okText="Confirm ACID Receipt"
        width={560}
      >
        <Alert
          message="Atomic Database Write"
          description="Confirming will increase warehouse on-hand stock balance and record an immutable RECEIPT entry in the inventory ledger."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Target Warehouse">
            <Tag color="blue">{selectedWarehouse?.code}</Tag> {selectedWarehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Material SKU">
            <Tag color="cyan">{selectedMaterial?.sku}</Tag> {selectedMaterial?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Inbound Quantity">
            <Text strong style={{ color: '#10b981', fontSize: 16 }}>
              {Number(pendingValues?.quantityGram || 0).toLocaleString()} grams
            </Text>{' '}
            ({(Number(pendingValues?.quantityGram || 0) / 1000).toFixed(2)} kg / {spoolCount} spools)
          </Descriptions.Item>
          <Descriptions.Item label="Total Batch Valuation">
            <Text strong style={{ color: '#fbbf24' }}>
              {(Number(pendingValues?.quantityGram || 0) * Number(pendingValues?.unitCost || 0)).toLocaleString()} VND
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Batch / Lot Tag">
            <Text code>{pendingValues?.batchNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {pendingValues?.supplier || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};
