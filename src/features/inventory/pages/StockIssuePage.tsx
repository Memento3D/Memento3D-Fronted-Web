import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Button,
  Typography,
  Table,
  Tag,
  Modal,
  Alert,
  App,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ExportOutlined,
  WarningOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useWarehouses } from '../../warehouse/hooks/useWarehouses';
import { useMaterials } from '../../material/hooks/useMaterials';
import { useStockIssues, useInventoryMutations } from '../hooks/useInventory';
import type { StockIssue, CreateStockIssuePayload } from '../types/inventory.types';

const { Title, Text } = Typography;

const ISSUE_REASONS = [
  'PRINTER_CALIBRATION (Extruder & bed calibration)',
  'DAMAGED_FILAMENT (Moisture / brittle degradation)',
  'INTERNAL_PROTOTYPE (R&D Sample run)',
  'INVENTORY_ADJUSTMENT (Audit variance)',
  'SAMPLE_FOR_CUSTOMER (Client demonstration)',
  'OTHER_DISPOSAL',
];

export const StockIssuePage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });
  const { data: issuesData, isLoading: isLoadingIssues } = useStockIssues({ limit: 15 });

  const { issueMutation } = useInventoryMutations();

  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];
  const issues = issuesData?.content || [];

  const handleFinish = (values: any) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  };

  const handleCommitIssue = async () => {
    if (!pendingValues) return;
    try {
      const idempotencyKey = `ISS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const payload: CreateStockIssuePayload = {
        warehouseId: pendingValues.warehouseId,
        materialId: pendingValues.materialId,
        quantityGram: Number(pendingValues.quantityGram),
        reason: pendingValues.reason,
        idempotencyKey,
        note: pendingValues.note,
      };

      const res = await issueMutation.mutateAsync(payload);
      message.success(`Stock issue #${res.issueNumber} recorded! -${payload.quantityGram}g deducted.`);
      setIsConfirmOpen(false);
      form.resetFields();
      form.setFieldsValue({
        quantityGram: 500,
        reason: ISSUE_REASONS[0],
      });
    } catch (err: any) {
      message.error(err.message || 'Failed to submit stock issue');
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === form.getFieldValue('warehouseId'));
  const selectedMaterial = materials.find((m) => m.id === form.getFieldValue('materialId'));

  const columns: ColumnsType<StockIssue> = [
    {
      title: 'Issue #',
      dataIndex: 'issueNumber',
      key: 'issueNumber',
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
      title: 'Deducted Qty',
      dataIndex: 'quantityGram',
      key: 'quantityGram',
      render: (qty: number) => (
        <Text strong style={{ color: '#ef4444' }}>
          -{(qty / 1000).toFixed(2)} kg ({qty.toLocaleString()}g)
        </Text>
      ),
    },
    {
      title: 'Audit Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Tag color="orange">{reason}</Tag>,
    },
    {
      title: 'Issued By',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
      render: (by: string) => by || 'OPERATOR',
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div>
        <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
          Manual Stock Issue (F05)
        </Title>
        <Text type="secondary">
          Audit-logged material disposal, calibration deductions, or workshop sample scrap.
        </Text>
      </div>

      {/* Main Issue Form */}
      <Card
        title={
          <Space>
            <ExportOutlined style={{ color: '#ef4444' }} />
            <span>Manual Stock Issue Voucher</span>
          </Space>
        }
      >
        <Alert
          message="Physical Inventory Deduction"
          description="Stock issued via this form is deducted immediately from physical on-hand inventory balances."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            quantityGram: 500,
            reason: ISSUE_REASONS[0],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="warehouseId"
                label="Source Warehouse Hub"
                rules={[{ required: true, message: 'Please select source warehouse' }]}
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
            <Col xs={24} md={12}>
              <Form.Item
                name="materialId"
                label="Material Profile (Filament)"
                rules={[{ required: true, message: 'Please select material SKU' }]}
              >
                <Select placeholder="Select material SKU" showSearch optionFilterProp="children">
                  {materials.map((mat) => (
                    <Select.Option key={mat.id} value={mat.id}>
                      [{mat.sku}] {mat.name} ({mat.color})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="quantityGram"
                label="Deduction Quantity (Grams)"
                rules={[
                  { required: true, message: 'Quantity is required' },
                  { type: 'number', min: 1, message: 'Quantity must be > 0' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} step={100} addonAfter="grams" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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
            </Col>
          </Row>

          <Form.Item name="note" label="Additional Audit Notes / Work Order Reference">
            <Input.TextArea rows={2} placeholder="Optional technician notes or test ID..." />
          </Form.Item>

          <Button
            type="primary"
            danger
            size="large"
            icon={<ExportOutlined />}
            onClick={() => form.submit()}
            loading={issueMutation.isPending}
            style={{ width: '100%', marginTop: 8 }}
          >
            Review & Commit Stock Issue
          </Button>
        </Form>
      </Card>

      {/* Recent Issues Table */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0ea5e9' }} />
            <span>Recent Manual Stock Issues Ledger</span>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={issues}
          rowKey="id"
          loading={isLoadingIssues}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ef4444' }} />
            <span>Confirm Stock Deduction</span>
          </Space>
        }
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onOk={handleCommitIssue}
        confirmLoading={issueMutation.isPending}
        okText="Confirm Deduction"
        okButtonProps={{ danger: true }}
        width={540}
      >
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Source Warehouse">
            <Tag color="blue">{selectedWarehouse?.code}</Tag> {selectedWarehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Material SKU">
            <Tag color="cyan">{selectedMaterial?.sku}</Tag> {selectedMaterial?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Deduction Quantity">
            <Text strong style={{ color: '#ef4444', fontSize: 16 }}>
              -{Number(pendingValues?.quantityGram || 0).toLocaleString()} grams
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Audit Justification">
            <Tag color="orange">{pendingValues?.reason}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};
