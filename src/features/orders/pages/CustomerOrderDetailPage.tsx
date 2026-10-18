import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Tag,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Skeleton,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  StopOutlined,
  EditOutlined,
  ReloadOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useUpdateOrder } from '../hooks/useUpdateOrder';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { usePaymentsList } from '../hooks/useOrderPayment';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderTimeline } from '../components/OrderTimeline';
import { OrderPaymentModal } from '../components/OrderPaymentModal';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import { canCustomerCancel } from '../utils/orderStateMachine';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrderDetail(id);
  const { data: payments = [] } = usePaymentsList();

  const updateOrderMutation = useUpdateOrder(id || '');
  const cancelOrderMutation = useCancelOrder();

  const [paymentModalOpen, setPaymentModalOpen] = useState(
    () => searchParams.get('pay') === 'true'
  );
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [form] = Form.useForm();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050811', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#050811', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '60px auto', color: '#f8fafc' }}>
          <h2 style={{ color: '#ef4444' }}>Không tìm thấy đơn hàng</h2>
          <p style={{ color: '#94a3b8' }}>
            {error?.message || 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <Button type="primary" onClick={() => navigate('/customer/orders')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const orderPayments = payments.filter((p) => p.orderId === order.id);
  const isEligibleToPay = order.status === 'PENDING_PAYMENT';
  const isEligibleToCancel = canCustomerCancel(order.status);

  const handleUpdateShipping = async (values: any) => {
    try {
      await updateOrderMutation.mutateAsync({
        recipientName: values.recipientName,
        phone: values.phone,
        shippingAddress: values.shippingAddress,
      });
      message.success('Đã cập nhật thông tin giao hàng thành công');
      setEditAddressOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật thông tin');
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id);
      message.success('Đã hủy đơn hàng');
      setCancelModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050811',
        color: '#f8fafc',
        padding: '36px 24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/customer/orders')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                borderRadius: 8,
              }}
            >
              Danh sách đơn
            </Button>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginRight: 10 }}>
                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <Space wrap>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                borderRadius: 8,
              }}
            >
              Cập nhật trạng thái
            </Button>

            {isEligibleToPay && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => setPaymentModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  borderColor: 'transparent',
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                Thanh toán ngay
              </Button>
            )}

            {isEligibleToCancel && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => setCancelModalOpen(true)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                }}
              >
                Hủy đơn hàng
              </Button>
            )}
          </Space>
        </div>

        {/* Timeline Steps */}
        <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

        <Row gutter={[24, 24]}>
          {/* Left Column: Delivery & Specifications */}
          <Col xs={24} lg={15}>
            {/* Delivery Info */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f8fafc' }}>
                  <span>Địa chỉ & Thông tin nhận hàng</span>
                  {isEligibleToPay && (
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        form.setFieldsValue({
                          recipientName: order.recipientName,
                          phone: order.phone,
                          shippingAddress: order.shippingAddress,
                        });
                        setEditAddressOpen(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                      }}
                    >
                      Sửa địa chỉ
                    </Button>
                  )}
                </div>
              }
              style={{
                background: 'rgba(18, 25, 41, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserOutlined style={{ color: '#0ea5e9', fontSize: 16 }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Người nhận:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{order.recipientName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: '#10b981', fontSize: 16 }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Số điện thoại:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{order.phone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <EnvironmentOutlined style={{ color: '#f59e0b', fontSize: 16, marginTop: 4 }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Địa chỉ giao:</span>
                  <span style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{order.shippingAddress}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CalendarOutlined style={{ color: '#a855f7', fontSize: 16 }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Thời gian đặt:</span>
                  <span style={{ color: '#cbd5e1' }}>{formatOrderDate(order.createdAt)}</span>
                </div>
              </div>
            </Card>

            {/* 3D Scan & Technical Specs */}
            <Card
              title={<span style={{ color: '#f8fafc' }}>Thông tin kỹ thuật in 3D</span>}
              style={{
                background: 'rgba(18, 25, 41, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Scan Session</div>
                  <div style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 600 }}>
                    {order.scanId ? `#${order.scanId.slice(0, 8)}` : 'Tiêu chuẩn Catalogue Memento3D'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Hệ màu & Tiêu chuẩn</div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>
                    Độ nét cao (0.08mm)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Đơn vị tiền tệ</div>
                  <div style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 600 }}>{order.currency}</div>
                </div>
              </div>
            </Card>

            {/* Payment Transactions History */}
            {orderPayments.length > 0 && (
              <Card
                title={<span style={{ color: '#f8fafc' }}>Lịch sử giao dịch thanh toán</span>}
                style={{
                  background: 'rgba(18, 25, 41, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                }}
              >
                <Table
                  dataSource={orderPayments}
                  rowKey="paymentId"
                  pagination={false}
                  columns={[
                    {
                      title: 'Cổng thanh toán',
                      dataIndex: 'paymentMethod',
                      key: 'paymentMethod',
                      render: (m) => <Tag color={m === 'MOMO' ? 'magenta' : 'blue'}>{m}</Tag>,
                    },
                    {
                      title: 'Số tiền',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amt, r) => formatCurrency(amt, r.currency),
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      render: (st) => (
                        <Tag color={st === 'SUCCESS' ? 'green' : st === 'PENDING' ? 'gold' : 'red'}>
                          {st}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Thời gian',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (t) => formatOrderDate(t),
                    },
                  ]}
                />
              </Card>
            )}
          </Col>

          {/* Right Column: Pricing & Quick Actions */}
          <Col xs={24} lg={9}>
            <Card
              title={<span style={{ color: '#f8fafc', fontWeight: 700 }}>Chi tiết thanh toán</span>}
              style={{
                background: 'linear-gradient(160deg, rgba(18, 25, 41, 0.9) 0%, rgba(11, 16, 28, 0.95) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Giá trị chế tác 3D:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{formatCurrency(order.totalPrice, order.currency)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Phí vận chuyển:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Miễn phí</span>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                    {formatCurrency(order.totalPrice, order.currency)}
                  </span>
                </div>

                {isEligibleToPay && (
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<CreditCardOutlined />}
                    onClick={() => setPaymentModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                      borderColor: 'transparent',
                      fontWeight: 700,
                      marginTop: 12,
                      borderRadius: 8,
                    }}
                  >
                    Thanh toán đơn hàng
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Payment Modal */}
      <OrderPaymentModal
        open={paymentModalOpen}
        order={order}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={() => refetch()}
      />

      {/* Edit Address Modal */}
      <Modal
        open={editAddressOpen}
        onCancel={() => setEditAddressOpen(false)}
        title="Chỉnh sửa thông tin giao hàng"
        onOk={() => form.submit()}
        confirmLoading={updateOrderMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateShipping}>
          <Form.Item
            name="recipientName"
            label="Họ tên người nhận"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+()\-\s]{8,20}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="shippingAddress"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Confirm Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onOk={handleConfirmCancel}
        okText="Xác nhận hủy đơn"
        cancelText="Giữ lại"
        okButtonProps={{ danger: true, loading: cancelOrderMutation.isPending }}
        title="Xác nhận hủy đơn hàng"
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
      </Modal>
    </div>
  );
};
