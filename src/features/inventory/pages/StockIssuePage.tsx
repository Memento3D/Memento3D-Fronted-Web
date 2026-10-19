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
  'PRINTER_CALIBRATION (Hiệu chuẩn bàn in & đầu đùn)',
  'DAMAGED_FILAMENT (Ẩm mốc / giòn gãy hư hại)',
  'INTERNAL_PROTOTYPE (In thử nghiệm R&D nội bộ)',
  'INVENTORY_ADJUSTMENT (Điều chỉnh sai lệch kiểm kê)',
  'SAMPLE_FOR_CUSTOMER (Mẫu in trình diễn khách hàng)',
  'OTHER_DISPOSAL (Hủy bỏ lý do khác)',
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
      message.success(`Đã ghi nhận phiếu xuất kho #${res.issueNumber}! Trừ -${payload.quantityGram}g thành công.`);
      setIsConfirmOpen(false);
      form.resetFields();
      form.setFieldsValue({
        quantityGram: 500,
        reason: ISSUE_REASONS[0],
      });
    } catch (err: any) {
      message.error(err.message || 'Gửi phiếu xuất kho thất bại');
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === form.getFieldValue('warehouseId'));
  const selectedMaterial = materials.find((m) => m.id === form.getFieldValue('materialId'));

  const columns: ColumnsType<StockIssue> = [
    {
      title: 'Mã phiếu xuất',
      dataIndex: 'issueNumber',
      key: 'issueNumber',
      render: (num: string) => (
        <Text strong copyable style={{ color: '#38bdf8' }}>
          {num}
        </Text>
      ),
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseCode',
      key: 'warehouseCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Mã SKU / Vật liệu',
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
      title: 'Khối lượng xuất trừ',
      dataIndex: 'quantityGram',
      key: 'quantityGram',
      render: (qty: number) => (
        <Text strong style={{ color: '#ef4444' }}>
          -{(qty / 1000).toFixed(2)} kg ({qty.toLocaleString()}g)
        </Text>
      ),
    },
    {
      title: 'Lý do xuất kho',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => <Tag color="orange">{reason}</Tag>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
      render: (by: string) => by || 'Nhân viên vận hành',
    },
    {
      title: 'Thời gian',
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
          Xuất kho thủ công (F05)
        </Title>
        <Text type="secondary">
          Ghi nhận xuất hủy vật liệu, khấu trừ hiệu chuẩn máy in hoặc in mẫu thử nghiệm.
        </Text>
      </div>

      {/* Main Issue Form */}
      <Card
        title={
          <Space>
            <ExportOutlined style={{ color: '#ef4444' }} />
            <span>Phiếu xuất kho thủ công</span>
          </Space>
        }
      >
        <Alert
          message="Khấu trừ tồn kho thực tế"
          description="Vật liệu xuất qua biểu mẫu này sẽ bị trừ ngay lập tức khỏi số dư tồn kho thực tế."
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
                label="Kho xuất hàng"
                rules={[{ required: true, message: 'Vui lòng chọn kho xuất' }]}
              >
                <Select placeholder="Chọn kho xuất hàng">
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
                label="Hồ sơ vật liệu in"
                rules={[{ required: true, message: 'Vui lòng chọn mã SKU vật liệu' }]}
              >
                <Select placeholder="Chọn mã SKU vật liệu" showSearch optionFilterProp="children">
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
                label="Khối lượng xuất trừ (Gam)"
                rules={[
                  { required: true, message: 'Khối lượng là bắt buộc' },
                  { type: 'number', min: 1, message: 'Khối lượng phải lớn hơn 0' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} step={100} addonAfter="gam" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="reason"
                label="Lý do xuất kho"
                rules={[{ required: true, message: 'Lý do là bắt buộc' }]}
              >
                <Select placeholder="Chọn lý do chính">
                  {ISSUE_REASONS.map((reason) => (
                    <Select.Option key={reason} value={reason}>
                      {reason}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú bổ sung / Mã lệnh công việc">
            <Input.TextArea rows={2} placeholder="Ghi chú kỹ thuật viên hoặc mã phiếu kiểm tra (tùy chọn)..." />
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
            Xem lại & Xác nhận xuất kho
          </Button>
        </Form>
      </Card>

      {/* Recent Issues Table */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0ea5e9' }} />
            <span>Sổ theo dõi phiếu xuất kho thủ công gần đây</span>
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
            <span>Xác nhận khấu trừ tồn kho</span>
          </Space>
        }
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onOk={handleCommitIssue}
        confirmLoading={issueMutation.isPending}
        okText="Xác nhận xuất trừ"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={540}
      >
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Kho xuất hàng">
            <Tag color="blue">{selectedWarehouse?.code}</Tag> {selectedWarehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mã SKU vật liệu">
            <Tag color="cyan">{selectedMaterial?.sku}</Tag> {selectedMaterial?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Khối lượng xuất trừ">
            <Text strong style={{ color: '#ef4444', fontSize: 16 }}>
              -{Number(pendingValues?.quantityGram || 0).toLocaleString()} gam
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Lý do xuất kho">
            <Tag color="orange">{pendingValues?.reason}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};
