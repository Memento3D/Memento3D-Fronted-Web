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
      message.success(`Phiếu nhập kho #${res.receiptNumber} đã được ghi nhận vào kho thành công!`);
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
      message.error(err.message || 'Gửi phiếu nhập kho thất bại');
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === form.getFieldValue('warehouseId'));
  const selectedMaterial = materials.find((m) => m.id === form.getFieldValue('materialId'));

  const columns: ColumnsType<StockReceipt> = [
    {
      title: 'Mã phiếu nhập',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
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
      title: 'Khối lượng nhập',
      dataIndex: 'quantityGram',
      key: 'quantityGram',
      render: (qty: number) => (
        <Text strong style={{ color: '#10b981' }}>
          +{(qty / 1000).toFixed(2)} kg ({qty.toLocaleString()}g)
        </Text>
      ),
    },
    {
      title: 'Số lô sản xuất',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      render: (batch: string) => <Text code>{batch || 'Không có'}</Text>,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (sup: string) => sup || 'Nhà cung cấp mặc định',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: 'In phiếu',
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
            Nhập kho vật liệu (F04)
          </Title>
          <Text type="secondary">
            Tiếp nhận lô hàng vật liệu in, kiểm tra chất lượng QC và đăng ký thông tin số lô.
          </Text>
        </div>
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
          In phiếu tiếp nhận
        </Button>
      </div>

      {/* Main Receiving Form */}
      <Card
        title={
          <Space>
            <InboxOutlined style={{ color: '#0ea5e9' }} />
            <span>Biểu mẫu nhập kho</span>
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
                label="Kho hàng tiếp nhận"
                rules={[{ required: true, message: 'Vui lòng chọn kho tiếp nhận' }]}
              >
                <Select placeholder="Chọn kho tiếp nhận">
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
                <Select
                  placeholder="Chọn mã SKU vật liệu"
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
                <Text strong style={{ color: '#38bdf8' }}>Bộ tính nhanh cuộn nhựa</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tính toán dựa trên 1.000 gam cho mỗi cuộn tiêu chuẩn
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
                  {c} Cuộn ({c}kg)
                </Button>
              ))}
            </Space>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="quantityGram"
                label="Tổng khối lượng nhập (Gam)"
                rules={[
                  { required: true, message: 'Khối lượng là bắt buộc' },
                  { type: 'number', min: 1, message: 'Khối lượng phải > 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={100}
                  addonAfter="gam"
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
                label="Đơn giá mỗi gam (VNĐ)"
                rules={[{ required: true, message: 'Đơn giá là bắt buộc' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  addonAfter="đ / g"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="supplier" label="Nhà cung cấp / Đơn vị giao">
                <Input placeholder="VD: Creality Việt Nam, eSUN Chính Hãng" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="batchNumber"
                label="Mã định danh số lô sản xuất"
                rules={[{ required: true, message: 'Số lô sản xuất là bắt buộc' }]}
              >
                <Input placeholder="VD: LOT-202610-881" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qcChecklist"
            label={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#10b981' }} />
                <span>Danh mục kiểm tra chất lượng (QC Checklist)</span>
              </Space>
            }
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={8}>
                  <Checkbox value="vacuum_seal">Bao bì hút chân không nguyên vẹn</Checkbox>
                </Col>
                <Col xs={24} sm={8}>
                  <Checkbox value="desiccant">Có túi hút ẩm kèm theo</Checkbox>
                </Col>
                <Col xs={24} sm={8}>
                  <Checkbox value="visual_pass">Đã kiểm tra màu sắc & đường kính 1.75mm</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú phiếu nhập & Mã vận đơn">
            <Input.TextArea rows={2} placeholder="Ghi chú giao hàng hoặc mã theo dõi bưu kiện..." />
          </Form.Item>

          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={() => form.submit()}
            loading={receiptMutation.isPending}
            style={{ width: '100%', marginTop: 8 }}
          >
            Xem lại & Xác nhận nhập kho
          </Button>
        </Form>
      </Card>

      {/* Recent Receipts Audit Table */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#0ea5e9' }} />
            <span>Lịch sử kiểm toán phiếu nhập kho gần đây</span>
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
            <span>Xác minh & Xác nhận nhập kho</span>
          </Space>
        }
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onOk={handleCommitReceipt}
        confirmLoading={receiptMutation.isPending}
        okText="Xác nhận nhập kho"
        cancelText="Hủy"
        width={560}
      >
        <Alert
          message="Ghi nhận tức thời vào cơ sở dữ liệu"
          description="Xác nhận sẽ tăng số dư tồn kho thực tế và tạo bản ghi NHẬP KHO bất biến trong sổ cái."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Kho tiếp nhận">
            <Tag color="blue">{selectedWarehouse?.code}</Tag> {selectedWarehouse?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mã SKU vật liệu">
            <Tag color="cyan">{selectedMaterial?.sku}</Tag> {selectedMaterial?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Khối lượng nhập">
            <Text strong style={{ color: '#10b981', fontSize: 16 }}>
              {Number(pendingValues?.quantityGram || 0).toLocaleString()} gam
            </Text>{' '}
            ({(Number(pendingValues?.quantityGram || 0) / 1000).toFixed(2)} kg / {spoolCount} cuộn)
          </Descriptions.Item>
          <Descriptions.Item label="Tổng định giá lô hàng">
            <Text strong style={{ color: '#fbbf24' }}>
              {(Number(pendingValues?.quantityGram || 0) * Number(pendingValues?.unitCost || 0)).toLocaleString()} VNĐ
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số lô sản xuất">
            <Text code>{pendingValues?.batchNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            {pendingValues?.supplier || 'Không có'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};
