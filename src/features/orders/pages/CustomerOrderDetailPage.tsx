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
  Alert,
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
  DollarCircleOutlined,
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
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';

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
      <div style={{ minHeight: '100vh', background: '#050811', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#050811', padding: '100px 24px', textAlign: 'center' }}>
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
  const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
  const isPaid = order.paymentStatus === 'PAID';
  const isCash = order.paymentMethod === 'CASH';
  const isEligibleToPay = !isPaid && !isCash && (order.status === 'PENDING' || order.status === 'PENDING_PAYMENT');
  const isEligibleToCancel = canCustomerCancel(order.status);
  const totalAmount = order.totalAmount ?? order.totalPrice;

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

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id);
      message.success('Đã hủy đơn hàng thành công');
      setCancelModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/orders')}
            style={{ color: '#94a3b8', paddingLeft: 0 }}
          >
            Danh sách đơn hàng
          </Button>

          <Space>
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
              Cập nhật
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
                Thanh toán lại
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
                Hủy đơn
              </Button>
            )}
          </Space>
        </div>

        {/* Order Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: '1.75rem' }}>
              Đơn hàng #{orderCode}
            </h1>
            <div style={{ color: '#94a3b8', marginTop: 4, fontSize: '0.85rem' }}>
              Ngày tạo: {formatOrderDate(order.createdAt)}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline Steps */}
        <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

        {/* Cash Notice if applicable */}
        {isCash && !isPaid && (
          <Alert
            message="Phương thức: Tiền mặt khi nhận hàng (CASH)"
            description="Đơn hàng của bạn sẽ được xưởng in chế tác và giao tới địa chỉ. Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng hoặc khi nhận sản phẩm."
            type="info"
            showIcon
            icon={<DollarCircleOutlined style={{ fontSize: 20, color: '#22c55e' }} />}
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 12,
              marginBottom: 24,
            }}
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Left Column: Items & Delivery Information */}
          <Col xs={24} lg={15}>
            {/* Order Items Table */}
            <Card
              title={<span style={{ color: '#f8fafc', fontWeight: 700 }}>Danh sách sản phẩm</span>}
              style={{
                background: 'rgba(18, 25, 41, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                marginBottom: 24,
              }}
              bodyStyle={{ padding: 0 }}
            >
              {order.items && order.items.length > 0 ? (
                <Table
                  dataSource={order.items}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: 'Sản phẩm',
                      key: 'product',
                      render: (_, item) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {item.thumbnailSnapshot ? (
                            <img
                              src={item.thumbnailSnapshot}
                              alt=""
                              style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 6, background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                              {item.productNameSnapshot}
                            </div>
                            {item.customizationSnapshot && Object.keys(item.customizationSnapshot).length > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {Object.entries(item.customizationSnapshot).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Đơn giá',
                      dataIndex: 'unitPrice',
                      key: 'unitPrice',
                      align: 'right',
                      render: (price) => formatCurrency(price, order.currency || 'VND'),
                    },
                    {
                      title: 'SL',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      align: 'center',
                    },
                    {
                      title: 'Thành tiền',
                      dataIndex: 'subtotal',
                      key: 'subtotal',
                      align: 'right',
                      render: (sub) => (
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                          {formatCurrency(sub, order.currency || 'VND')}
                        </span>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>
                  Kỷ vật 3D cá nhân hóa Memento3D
                </div>
              )}
            </Card>

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
                      Sửa
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserOutlined style={{ color: '#0ea5e9' }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Người nhận:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{order.recipientName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: '#10b981' }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Số điện thoại:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{order.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <EnvironmentOutlined style={{ color: '#f59e0b', marginTop: 4 }} />
                  <span style={{ color: '#94a3b8', minWidth: 100 }}>Địa chỉ giao:</span>
                  <span style={{ color: '#cbd5e1' }}>{order.shippingAddress}</span>
                </div>
                {order.note && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#94a3b8', minWidth: 100 }}>Ghi chú:</span>
                    <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>{order.note}</span>
                  </div>
                )}
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
                      render: (m) => (
                        <Tag color={m === 'MOMO' ? 'magenta' : m === 'ZALOPAY' ? 'blue' : 'green'}>
                          {m}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Số tiền',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amt, r) => formatCurrency(amt, r.currency || 'VND'),
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      render: (st) => (
                        <Tag color={st === 'PAID' || st === 'SUCCESS' ? 'green' : st === 'PENDING' ? 'gold' : 'red'}>
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

          {/* Right Column: Order Summary & Payment Info */}
          <Col xs={24} lg={9}>
            <Card
              title={<span style={{ color: '#f8fafc', fontWeight: 700 }}>Thông tin thanh toán</span>}
              style={{
                background: 'linear-gradient(160deg, rgba(18, 25, 41, 0.9) 0%, rgba(11, 16, 28, 0.95) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 14,
                position: 'sticky',
                top: 100,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Phương thức:</span>
                  <Tag color={isCash ? 'green' : order.paymentMethod === 'MOMO' ? 'magenta' : 'blue'}>
                    {order.paymentMethod || 'MOMO'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Trạng thái thanh toán:</span>
                  <Tag color={isPaid ? 'green' : 'gold'}>
                    {order.paymentStatus || 'PENDING'}
                  </Tag>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Tạm tính:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                    {formatCurrency(order.subtotal ?? totalAmount, order.currency || 'VND')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Phí vận chuyển:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {order.shippingFee ? formatCurrency(order.shippingFee, order.currency || 'VND') : 'Miễn phí'}
                  </span>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                    {formatCurrency(totalAmount, order.currency || 'VND')}
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
                    Thanh toán lại
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </main>

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
        title="Sửa thông tin giao hàng"
        onOk={() => form.submit()}
        confirmLoading={updateOrderMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateShipping}>
          <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shippingAddress" label="Địa chỉ" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        title="Xác nhận hủy đơn hàng"
        onOk={handleCancelOrder}
        okText="Hủy đơn"
        okButtonProps={{ danger: true, loading: cancelOrderMutation.isPending }}
        cancelText="Đóng"
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
      </Modal>

      <Footer />
    </div>
  );
};
