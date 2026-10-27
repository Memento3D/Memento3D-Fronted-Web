import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Radio,
  Select,
  InputNumber,
  Button,
  Alert,
  Typography,
  Tag,
  message,
} from 'antd';
import {
  PrinterOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../orders/api/orderApi';
import { formatCurrency } from '../../orders/utils/orderFormatters';

const { Text, Title } = Typography;

export interface OrderKeepsakeModalProps {
  open: boolean;
  onClose: () => void;
  scanId: string;
  modelUrl?: string;
  modelName?: string;
}

const MATERIAL_OPTIONS = [
  {
    label: 'Nhựa quang hóa siêu nét Resin SLA (Khuyên dùng cho chân dung sắc nét)',
    value: 'High-Detail Resin SLA',
    basePrice: 299000,
  },
  {
    label: 'Nhựa sinh học thân thiện PLA Silk ánh lụa cao cấp',
    value: 'PLA Silk Bioplastic',
    basePrice: 249000,
  },
  {
    label: 'Resin PolyJet Công nghiệp Đa sắc chân thực (Full-Color)',
    value: 'PolyJet Full-Color Resin',
    basePrice: 599000,
  },
];

const SIZE_OPTIONS = [
  { label: 'Kỷ vật Mini để bàn (Chiều cao 8cm)', value: '8cm (Tỷ lệ 1:20)', multiplier: 1.0 },
  { label: 'Tượng chân dung Tiêu chuẩn (Chiều cao 12cm)', value: '12cm (Tỷ lệ 1:15)', multiplier: 1.5 },
  { label: 'Tượng điêu khắc Cao cấp (Chiều cao 16cm)', value: '16cm (Tỷ lệ 1:10)', multiplier: 2.2 },
];

const BASE_OPTIONS = [
  { label: 'Đế gỗ óc chó Walnut tự nhiên chạm khắc laser', value: 'Đế gỗ óc chó Walnut tự nhiên', surcharge: 50000 },
  { label: 'Đế pha lê quang học vát cạnh sang trọng', value: 'Đế pha lê quang học vát cạnh', surcharge: 90000 },
  { label: 'Đế gỗ sồi Scandinavian nguyên khối tối giản', value: 'Đế gỗ sồi Scandinavian nguyên khối', surcharge: 40000 },
];

export const OrderKeepsakeModal: React.FC<OrderKeepsakeModalProps> = ({
  open,
  onClose,
  scanId,
  modelUrl,
  modelName = 'Kỷ vật 3D chân dung (Scan AI)',
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form selections for dynamic estimated pricing
  const [selectedMaterial, setSelectedMaterial] = useState('High-Detail Resin SLA');
  const [selectedSize, setSelectedSize] = useState('12cm (Tỷ lệ 1:15)');
  const [selectedBase, setSelectedBase] = useState('Đế gỗ óc chó Walnut tự nhiên');
  const [quantity, setQuantity] = useState(1);

  // Compute estimated server price
  const matObj = MATERIAL_OPTIONS.find((m) => m.value === selectedMaterial) || MATERIAL_OPTIONS[0];
  const sizeObj = SIZE_OPTIONS.find((s) => s.value === selectedSize) || SIZE_OPTIONS[1];
  const baseObj = BASE_OPTIONS.find((b) => b.value === selectedBase) || BASE_OPTIONS[0];

  const estimatedUnitPrice = Math.round(matObj.basePrice * sizeObj.multiplier + baseObj.surcharge);
  const estimatedTotalPrice = estimatedUnitPrice * (quantity || 1);

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const customizationData = {
        material: selectedMaterial,
        size: selectedSize,
        base: selectedBase,
        engravingText: values.engravingText || '',
        modelUrl: modelUrl || '',
        modelName: modelName,
      };

      const payload = {
        scanId: scanId,
        recipientName: values.recipientName,
        phone: values.phone,
        shippingAddress: values.shippingAddress,
        note: `[Kỷ vật 3D AI Scan] Đế: ${selectedBase} | Chữ khắc: ${values.engravingText || 'Không'} | Ghi chú thêm: ${values.note || 'Không'}`,
        paymentMethod: 'VNPAY',
        totalPrice: estimatedTotalPrice,
        customizationSnapshot: JSON.stringify(customizationData),
        fulfillmentType: 'PHYSICAL',
        paymentType: 'FULL_PAYMENT',
      };

      const response = await orderApi.create(payload as any);
      message.success('Đặt yêu cầu sản xuất thành công! Đơn hàng đã được chuyển tới xưởng in để kiểm duyệt khả năng sản xuất.');
      onClose();
      navigate(`/orders/${response.id}`);
    } catch (err: any) {
      message.error(err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PrinterOutlined style={{ color: 'var(--primary, #7C5CFC)', fontSize: 22 }} />
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
            Cấu hình Đặt sản xuất Kỷ vật 3D
          </Title>
        </div>
      }
      centered
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        message="Kiểm tra khả năng sản xuất"
        description="Đơn hàng được khởi tạo ở trạng thái Chờ kiểm tra khả năng sản xuất. Kỹ thuật viên xưởng in sẽ kiểm duyệt lưới đa giác 3D, đối chiếu chi tiết và xác nhận báo giá cuối cùng trước khi tiến hành thanh toán."
        style={{ marginBottom: 20, borderRadius: 10 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          material: selectedMaterial,
          size: selectedSize,
          base: selectedBase,
          quantity: 1,
        }}
      >
        <div style={{ background: 'var(--bg-elevated, #F8F5FF)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: 'var(--text-primary)' }}>
            1. Tùy chọn Vật liệu & Kích thước Chế tác
          </Text>

          <Form.Item label="Chất liệu in 3D" required>
            <Radio.Group
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {MATERIAL_OPTIONS.map((m) => (
                <Radio key={m.value} value={m.value}>
                  <span>{m.label}</span>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="Kích thước mô hình" required>
              <Select
                value={selectedSize}
                onChange={setSelectedSize}
                options={SIZE_OPTIONS.map((s) => ({ label: s.label, value: s.value }))}
              />
            </Form.Item>

            <Form.Item label="Mẫu đế trưng bày" required>
              <Select
                value={selectedBase}
                onChange={setSelectedBase}
                options={BASE_OPTIONS.map((b) => ({ label: b.label, value: b.value }))}
              />
            </Form.Item>
          </div>

          <Form.Item label="Khắc chữ thông điệp cá nhân hóa lên đế (Tối đa 30 ký tự)">
            <Input
              name="engravingText"
              placeholder="VD: Kỷ niệm gia đình 2026 / Alex & Morgan"
              maxLength={30}
              showCount
            />
          </Form.Item>

          <Form.Item label="Số lượng sản phẩm">
            <InputNumber
              min={1}
              max={10}
              value={quantity}
              onChange={(val) => setQuantity(val || 1)}
              style={{ width: 140 }}
            />
          </Form.Item>
        </div>

        <div style={{ background: 'var(--bg-elevated, #F8F5FF)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: 'var(--text-primary)' }}>
            2. Thông tin Giao nhận hàng
          </Text>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="recipientName"
              label="Họ và tên người nhận"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhận' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại liên hệ"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^(0|\+84)[0-9]{9,10}$/, message: 'Số điện thoại không hợp lệ' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
            </Form.Item>
          </div>

          <Form.Item
            name="shippingAddress"
            label="Địa chỉ giao hàng chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú đặc biệt cho kỹ thuật viên xưởng in">
            <Input.TextArea rows={2} placeholder="Yêu cầu về đóng gói hộp quà, thời gian nhận hàng..." />
          </Form.Item>
        </div>

        {/* Pricing Summary Card */}
        <div
          style={{
            padding: 16,
            background: 'var(--bg-card, #FFFFFF)',
            border: '1.5px solid var(--primary, #7C5CFC)',
            borderRadius: 12,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.85rem' }}>
              Giá ban đầu (Giá dự kiến)
            </Text>
            <Text style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary, #7C5CFC)' }}>
              {formatCurrency(estimatedTotalPrice)}
            </Text>
            <Text style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Đã bao gồm công chế tác 3D, đế trưng bày và xử lý hoàn thiện bề mặt
            </Text>
          </div>

          <Tag color="cyan" style={{ padding: '6px 14px', borderRadius: 9999, fontWeight: 700 }}>
            Thanh toán qua VNPAY sau khi duyệt
          </Tag>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={onClose} disabled={isSubmitting} style={{ borderRadius: 8 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            icon={<CheckCircleOutlined />}
            style={{
              background: 'var(--primary, #7C5CFC)',
              borderRadius: 8,
              fontWeight: 700,
              padding: '0 24px',
            }}
          >
            Gửi yêu cầu chế tác xưởng in
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
