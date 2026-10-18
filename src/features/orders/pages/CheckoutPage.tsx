import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Radio,
  InputNumber,
  Button,
  Typography,
  Divider,
  message,
  Alert,
  Spin,
} from 'antd';
import {
  ShoppingOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { materialApi } from '../../material/api/materialApi';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatCurrency } from '../utils/orderFormatters';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ModelTier {
  id: string;
  name: string;
  basePrice: number;
  dimensions: string;
  description: string;
}

const MODEL_TIERS: ModelTier[] = [
  {
    id: 'mini-keepsake',
    name: 'Mini Keepsake & Charm (5cm)',
    basePrice: 150000,
    dimensions: '4.5cm – 6.0cm scale',
    description: 'Chế tác phù điêu 3D bỏ túi, móc khóa bền chắc bằng nhựa quang hóa cao cấp.',
  },
  {
    id: 'standard-keepsake',
    name: 'Tượng chân dung Desk Sculpture (15cm)',
    basePrice: 350000,
    dimensions: '12cm – 15cm height',
    description: 'Định dạng phổ biến nhất của Memento3D. Chi tiết khuôn mặt sắc nét, kèm đế gỗ mộc.',
  },
  {
    id: 'signature-memorial',
    name: 'Tác phẩm Signature Memorial (22cm)',
    basePrice: 750000,
    dimensions: '18cm – 24cm museum scale',
    description: 'Tượng quy mô trưng bày viện bảo tàng, xử lý bề mặt thủ công patina kim loại.',
  },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const createOrderMutation = useCreateOrder();

  const preselectedScanId = searchParams.get('scanId') || undefined;

  const [selectedTierId, setSelectedTierId] = useState<string>('standard-keepsake');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quality, setQuality] = useState<'FINE' | 'STANDARD' | 'DRAFT'>('FINE');
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch materials live from Backend
  const { data: materialsData, isLoading: loadingMaterials } = useQuery({
    queryKey: ['active-materials'],
    queryFn: () => materialApi.list({ status: 'ACTIVE', limit: 100 }),
  });

  const selectedTier = MODEL_TIERS.find((t) => t.id === selectedTierId) || MODEL_TIERS[1];
  const activeMaterials = materialsData?.content || [];
  const selectedMaterial = activeMaterials.find((m) => m.id === selectedMaterialId) || activeMaterials[0];

  // Dynamic Quotation calculation
  const qualityMultiplier = quality === 'FINE' ? 1.2 : quality === 'STANDARD' ? 1.0 : 0.85;
  const materialExtra = selectedMaterial ? Number(selectedMaterial.unitCost) * 1.5 : 50000;
  const calculatedUnitPrice = Math.round((selectedTier.basePrice + materialExtra) * qualityMultiplier);
  const calculatedTotalPrice = Math.max(1000, calculatedUnitPrice * quantity);

  const handleSubmit = async (values: any) => {
    try {
      const order = await createOrderMutation.mutateAsync({
        scanId: preselectedScanId,
        totalPrice: calculatedTotalPrice,
        currency: 'VND',
        recipientName: values.recipientName.trim(),
        shippingAddress: values.shippingAddress.trim(),
        phone: values.phone.trim(),
      });

      message.success('Đơn hàng in 3D đã được khởi tạo thành công!');
      navigate(`/customer/orders/${order.id}?pay=true`);
    } catch (err: any) {
      message.error(err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050811',
        color: '#f8fafc',
        padding: '40px 24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Back and Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/orders')}
            style={{ color: '#94a3b8' }}
          >
            Quay lại Đơn hàng
          </Button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            Đặt hàng in 3D & Cấu hình Sản phẩm
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Tùy biến vật liệu, chất lượng in và thông tin nhận hàng trước khi gửi lệnh lên xưởng in.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            recipientName: user?.fullName || '',
            phone: '',
            shippingAddress: '',
          }}
        >
          <Row gutter={[32, 32]}>
            {/* Left Column: Configuration & Shipping */}
            <Col xs={24} lg={15}>
              {/* Step 1: Tier Selection */}
              <Card
                title={
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    1. Chọn định dạng vật phẩm kỷ niệm
                  </span>
                }
                style={{
                  background: 'rgba(18, 25, 41, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {MODEL_TIERS.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 12,
                          background: isSelected ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '1px solid #0ea5e9' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem', marginBottom: 4 }}>
                            {tier.name}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 6 }}>
                            {tier.description}
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              borderRadius: 4,
                              color: '#cbd5e1',
                            }}
                          >
                            {tier.dimensions}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 110 }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                            {formatCurrency(tier.basePrice)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Giá khởi điểm</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Step 2: Material & Quality */}
              <Card
                title={
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    2. Lựa chọn vật liệu & Thông số chế tác
                  </span>
                }
                style={{
                  background: 'rgba(18, 25, 41, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  marginBottom: 24,
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#e2e8f0', marginBottom: 8, fontWeight: 600 }}>
                    Vật liệu in sẵn có tại kho
                  </label>
                  {loadingMaterials ? (
                    <Spin size="small" />
                  ) : (
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Chọn vật liệu..."
                      value={selectedMaterialId || (activeMaterials[0]?.id ?? '')}
                      onChange={(val) => setSelectedMaterialId(val)}
                      options={activeMaterials.map((m) => ({
                        label: `${m.name} (${m.materialType} - ${m.color}) — Đơn giá kho: ${formatCurrency(m.unitCost)}`,
                        value: m.id,
                      }))}
                    />
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#e2e8f0', marginBottom: 8, fontWeight: 600 }}>
                    Độ phân giải / Chất lượng in (Layer Height)
                  </label>
                  <Radio.Group
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                  >
                    <Radio.Button value="FINE" style={{ height: 'auto', padding: '10px 16px', borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>Fine Detail (0.08mm)</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mịn màng nhất, chậm hơn 20%</div>
                    </Radio.Button>
                    <Radio.Button value="STANDARD" style={{ height: 'auto', padding: '10px 16px', borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>Standard (0.16mm)</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cân bằng tốc độ & độ nét</div>
                    </Radio.Button>
                    <Radio.Button value="DRAFT" style={{ height: 'auto', padding: '10px 16px', borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>Draft (0.28mm)</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tiết kiệm chi phí</div>
                    </Radio.Button>
                  </Radio.Group>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', marginBottom: 8, fontWeight: 600 }}>
                    Số lượng
                  </label>
                  <InputNumber
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    style={{ width: 140 }}
                  />
                </div>
              </Card>

              {/* Step 3: Delivery Information */}
              <Card
                title={
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    3. Thông tin người nhận & Địa chỉ giao hàng
                  </span>
                }
                style={{
                  background: 'rgba(18, 25, 41, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                }}
              >
                <Form.Item
                  name="recipientName"
                  label={<span style={{ color: '#e2e8f0' }}>Họ và tên người nhận</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên người nhận' },
                    { max: 255, message: 'Họ tên không được vượt quá 255 ký tự' },
                  ]}
                >
                  <Input placeholder="Ví dụ: Nguyễn Văn A" size="large" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<span style={{ color: '#e2e8f0' }}>Số điện thoại liên hệ</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    {
                      pattern: /^[0-9+()\-\s]{8,20}$/,
                      message: 'Định dạng số điện thoại không hợp lệ (8 - 20 ký tự số)',
                    },
                  ]}
                >
                  <Input placeholder="Ví dụ: 0901234567" size="large" />
                </Form.Item>

                <Form.Item
                  name="shippingAddress"
                  label={<span style={{ color: '#e2e8f0' }}>Địa chỉ giao hàng chi tiết</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column: Order Summary & Place Order */}
            <Col xs={24} lg={9}>
              <div style={{ position: 'sticky', top: 24 }}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', fontWeight: 800 }}>
                      <ShoppingOutlined style={{ color: '#0ea5e9' }} />
                      <span>Tóm tắt thanh toán</span>
                    </div>
                  }
                  style={{
                    background: 'linear-gradient(160deg, rgba(18, 25, 41, 0.9) 0%, rgba(11, 16, 28, 0.95) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 14,
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#94a3b8' }}>Định dạng:</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedTier.name}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#94a3b8' }}>Vật liệu đã chọn:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                        {selectedMaterial ? selectedMaterial.name : 'Mặc định kho'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#94a3b8' }}>Chế độ in:</span>
                      <span style={{ color: '#cbd5e1' }}>{quality}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#94a3b8' }}>Số lượng:</span>
                      <span style={{ color: '#cbd5e1' }}>{quantity} cái</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#94a3b8' }}>Phí vận chuyển:</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Miễn phí toàn quốc</span>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>Tổng cộng:</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                        {formatCurrency(calculatedTotalPrice)}
                      </span>
                    </div>
                  </div>

                  <Alert
                    message="Bảo đảm chất lượng Memento3D"
                    description="Mọi kỷ vật in 3D đều trải qua khâu kiểm định quang học bề mặt trước khi đóng gói và xuất kho."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24, borderRadius: 8, fontSize: '0.8rem' }}
                  />

                  <Button
                    type="primary"
                    block
                    size="large"
                    htmlType="submit"
                    loading={createOrderMutation.isPending}
                    icon={<ThunderboltOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                      borderColor: 'transparent',
                      height: 50,
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
                    }}
                  >
                    Xác nhận đặt hàng
                  </Button>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};
