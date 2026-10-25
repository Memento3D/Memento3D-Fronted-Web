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
  CheckCircleOutlined,
  EyeOutlined,
  InboxOutlined,
  PrinterOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useUpdateOrder } from '../hooks/useUpdateOrder';
import { useCancelOrder } from '../hooks/useCancelOrder';
import { usePaymentsList, useOrderPayments } from '../hooks/useOrderPayment';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderTimeline } from '../components/OrderTimeline';
import { OrderPaymentModal } from '../components/OrderPaymentModal';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import { canCustomerCancel } from '../utils/orderStateMachine';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { useEventSubscription } from '../../../shared/realtime';
import { modelReviewService } from '../../../services/modelReviewService';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrderDetail(id);
  const { data: payments = [] } = usePaymentsList();
  const { data: specificPayments = [] } = useOrderPayments(id);

  const updateOrderMutation = useUpdateOrder(id || '');
  const cancelOrderMutation = useCancelOrder();

  const [paymentModalOpen, setPaymentModalOpen] = useState(
    () => searchParams.get('pay') === 'true'
  );
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [modelReviewModalOpen, setModelReviewModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [revisionForm] = Form.useForm();

  // Real-time event subscriptions
  useEventSubscription('ORDER_STATUS_CHANGED', (event) => {
    if (event.resourceId === id || event.data?.orderId === id) {
      message.info(`Cập nhật đơn hàng: Trạng thái ${event.data?.status || 'đã được thay đổi'}`);
      refetch();
    }
  });

  useEventSubscription('PAYMENT_STATUS_CHANGED', (event) => {
    if (event.data?.orderId === id || event.resourceId === id) {
      message.success('Thanh toán đơn hàng đã được cập nhật thành công!');
      refetch();
    }
  });

  useEventSubscription('MODEL_APPROVAL_REQUIRED', (event) => {
    if (event.data?.orderId === id || event.resourceId === id) {
      message.info('Mô hình 3D cho đơn hàng đã sẵn sàng để bạn duyệt!');
      refetch();
    }
  });

  useEventSubscription('PRINT_JOB_UPDATED', (event) => {
    if (event.data?.orderId === id) {
      refetch();
    }
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '60px auto', color: 'var(--text-primary)' }}>
          <h2 style={{ color: '#ef4444' }}>Không tìm thấy đơn hàng</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {error?.message || 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <Button type="primary" onClick={() => navigate('/customer/orders')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const orderPayments = specificPayments.length > 0 ? specificPayments : payments.filter((p) => p.orderId === order.id);
  const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
  const isPaid = order.paymentStatus === 'PAID';
  const isCash = order.paymentMethod === 'CASH';
  const isEligibleToPay = !isPaid && order.status !== 'CANCELLED' && order.status !== 'COMPLETED';
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

  const handleApproveModel = async () => {
    try {
      setReviewLoading(true);
      const targetVersionId = (order as any).modelApprovalVersionId || (order as any).modelVersionId || id;
      await modelReviewService.approveVersion(targetVersionId, 'Khách hàng phê duyệt in 3D');
      message.success('Đã duyệt mô hình 3D thành công! Đơn hàng được chuyển sang hàng đợi in.');
      setModelReviewModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể duyệt mô hình');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRequestRevision = async (values: { reason: string; notes?: string }) => {
    try {
      setReviewLoading(true);
      const targetVersionId = (order as any).modelApprovalVersionId || (order as any).modelVersionId || id;
      await modelReviewService.requestRevision(targetVersionId, values.reason, values.notes);
      message.success('Đã gửi yêu cầu chỉnh sửa tới đội ngũ kỹ thuật Memento3D.');
      setRevisionModalOpen(false);
      setModelReviewModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể gửi yêu cầu chỉnh sửa');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '120px 24px 60px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/orders')}
            style={{ color: 'var(--text-secondary)', paddingLeft: 0, borderRadius: 'var(--radius-full)' }}
          >
            Danh sách đơn hàng
          </Button>

          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              style={{
                background: 'var(--surface-container)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-full)',
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
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
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
                  borderRadius: 'var(--radius-full)',
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
            <h1 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800, fontSize: '1.75rem' }}>
              Đơn hàng #{orderCode}
            </h1>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.85rem' }}>
              Ngày tạo: {formatOrderDate(order.createdAt)}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline Steps */}
        <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

        {/* Model Approval Pending Alert Banner */}
        {(order.status === 'MODEL_APPROVAL_PENDING' || (order as any).requiresModelApproval) && (
          <Alert
            message="Mô hình 3D đã sẵn sàng duyệt"
            description={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                <span>Đội ngũ kỹ thuật Memento3D đã hoàn tất tái tạo mô hình 3D. Vui lòng kiểm tra và phê duyệt trước khi chuyển sang công đoạn in ấn vật lý.</span>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => setModelReviewModalOpen(true)}
                  style={{
                    background: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                  }}
                >
                  Xem & Duyệt mô hình 3D
                </Button>
              </div>
            }
            type="warning"
            showIcon
            icon={<InboxOutlined style={{ fontSize: 24, color: '#f59e0b' }} />}
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 12,
              marginBottom: 24,
            }}
          />
        )}

        {/* Real-Time Printing Banner */}
        {order.status === 'PRINTING' && (
          <Alert
            message={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                Đang in 3D thời gian thực tại xưởng Memento3D
              </span>
            }
            description="Lệnh in của bạn đang được thực thi trên máy in 3D công nghiệp. Hệ thống sẽ tự động cập nhật khi quá trình hoàn tất và chuyển sang kiểm định chất lượng (QC)."
            type="info"
            showIcon
            icon={<PrinterOutlined style={{ fontSize: 20, color: '#38bdf8' }} />}
            style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: 12,
              marginBottom: 24,
            }}
          />
        )}

        {/* Shipping Banner */}
        {order.status === 'SHIPPED' && (
          <Alert
            message="Đơn hàng đang được giao tới bạn"
            description="Kiện hàng đã xuất kho và đang trên đường vận chuyển tới địa chỉ nhận hàng của bạn."
            type="success"
            showIcon
            icon={<CarOutlined style={{ fontSize: 20, color: 'var(--tertiary)' }} />}
            style={{
              background: 'var(--mint-bg)',
              border: '1px solid var(--mint-border)',
              borderRadius: 'var(--radius-default)',
              marginBottom: 24,
            }}
          />
        )}

        {/* Cash Notice if applicable */}
        {isCash && !isPaid && (
          <Alert
            message="Phương thức: Tiền mặt khi nhận hàng (CASH)"
            description="Đơn hàng của bạn sẽ được xưởng in chế tác và giao tới địa chỉ. Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng hoặc khi nhận sản phẩm."
            type="info"
            showIcon
            icon={<DollarCircleOutlined style={{ fontSize: 20, color: 'var(--tertiary)' }} />}
            style={{
              background: 'var(--surface-container)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-default)',
              marginBottom: 24,
            }}
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Left Column: Items & Delivery Information */}
          <Col xs={24} lg={15}>
            {/* Order Items Table */}
            <Card
              title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Danh sách sản phẩm</span>}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                marginBottom: 24,
              }}
              styles={{ body: { padding: 0 } }}
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
                              style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {item.productNameSnapshot}
                            </div>
                            {item.customizationSnapshot && Object.keys(item.customizationSnapshot).length > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatCurrency(sub, order.currency || 'VND')}
                        </span>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Kỷ vật 3D cá nhân hóa Memento3D
                </div>
              )}
            </Card>

            {/* Delivery Info */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
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
                        background: 'var(--surface-container)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Sửa
                    </Button>
                  )}
                </div>
              }
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                marginBottom: 24,
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserOutlined style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-secondary)', minWidth: 100 }}>Người nhận:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.recipientName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: 'var(--tertiary)' }} />
                  <span style={{ color: 'var(--text-secondary)', minWidth: 100 }}>Số điện thoại:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <EnvironmentOutlined style={{ color: 'var(--primary-system)', marginTop: 4 }} />
                  <span style={{ color: 'var(--text-secondary)', minWidth: 100 }}>Địa chỉ giao:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{order.shippingAddress}</span>
                </div>
                {order.note && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 100 }}>Ghi chú:</span>
                    <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{order.note}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Transactions History */}
            {orderPayments.length > 0 && (
              <Card
                title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Lịch sử giao dịch thanh toán</span>}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <Table
                  dataSource={orderPayments}
                  rowKey={(r: any) => r.paymentId || r.id || r.transactionReference}
                  pagination={false}
                  columns={[
                    {
                      title: 'Cổng thanh toán',
                      dataIndex: 'paymentMethod',
                      key: 'paymentMethod',
                      render: (m) => (
                        <Tag color={m === 'VNPAY' ? '#005cb9' : m === 'MOMO' ? 'magenta' : m === 'ZALOPAY' ? 'blue' : 'green'}>
                          {m}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Mã tham chiếu',
                      dataIndex: 'merchantTransactionId',
                      key: 'merchantTransactionId',
                      render: (ref, r: any) => (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {ref || r.transactionReference || '-'}
                        </span>
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
                      render: (st) => {
                        const isSuccess = st === 'PAID' || st === 'SUCCESS';
                        const isPending = st === 'PENDING' || st === 'PROCESSING';
                        const isCancelled = st === 'CANCELLED';
                        const isExpired = st === 'EXPIRED';

                        const color = isSuccess ? 'green' : isPending ? 'gold' : isCancelled ? 'orange' : isExpired ? 'default' : 'red';
                        const label = isSuccess ? 'Thành công' : isPending ? 'Chờ xử lý' : isCancelled ? 'Đã hủy' : isExpired ? 'Hết hạn' : 'Thất bại';
                        return <Tag color={color}>{label}</Tag>;
                      },
                    },
                    {
                      title: 'Thời gian',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (t, r: any) => formatOrderDate(r.paymentDate || t),
                    },
                  ]}
                />
              </Card>
            )}
          </Col>

          {/* Right Column: Order Summary & Payment Info */}
          <Col xs={24} lg={9}>
            <Card
              title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Thông tin thanh toán</span>}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                position: 'sticky',
                top: 100,
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phương thức:</span>
                  <Tag style={{ borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--primary)', border: '1px solid var(--border-default)' }}>
                    {order.paymentMethod || 'MOMO'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Trạng thái thanh toán:</span>
                  <Tag
                    style={{
                      borderRadius: 'var(--radius-full)',
                      background: isPaid ? 'var(--mint-bg)' : 'var(--peach-bg)',
                      color: isPaid ? 'var(--mint-text)' : 'var(--peach-text)',
                      border: 'none',
                    }}
                  >
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' : order.paymentStatus || 'Chờ thanh toán'}
                  </Tag>
                </div>

                <Divider style={{ borderColor: 'var(--border-default)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tạm tính:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {formatCurrency(order.subtotal ?? totalAmount, order.currency || 'VND')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phí vận chuyển:</span>
                  <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>
                    {order.shippingFee ? formatCurrency(order.shippingFee, order.currency || 'VND') : 'Miễn phí'}
                  </span>
                </div>

                <Divider style={{ borderColor: 'var(--border-default)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
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
                      background: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      fontWeight: 700,
                      marginTop: 12,
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
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
          <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shippingAddress" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}>
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

      {/* 3D Model Review Modal */}
      <Modal
        open={modelReviewModalOpen}
        onCancel={() => setModelReviewModalOpen(false)}
        title={<span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Duyệt mô hình 3D trước khi in</span>}
        width={720}
        footer={[
          <Button key="close" onClick={() => setModelReviewModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="revision"
            danger
            onClick={() => setRevisionModalOpen(true)}
            loading={reviewLoading}
          >
            Yêu cầu chỉnh sửa
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApproveModel()}
            loading={reviewLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
              borderColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Duyệt & Cho phép in
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              height: 280,
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🗿</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
              Bản dựng 3D chi tiết (Đã qua xử lý Watermark)
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              Độ phân giải cao | Sẵn sàng cho máy in 3D công nghiệp
            </div>
            {(order as any).previewUrl && (
              <a
                href={(order as any).previewUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 12, color: '#38bdf8', textDecoration: 'underline' }}
              >
                Tải bản xem trước GLB
              </a>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left', lineHeight: 1.6 }}>
            Bằng việc bấm <strong>"Duyệt & Cho phép in"</strong>, bạn xác nhận đồng ý với hình dáng, tỷ lệ và chất lượng bản dựng 3D này. Xưởng in Memento3D sẽ tự động cấp phát vật liệu và xếp lịch in máy.
          </p>
        </div>
      </Modal>

      {/* Revision Request Modal */}
      <Modal
        open={revisionModalOpen}
        onCancel={() => setRevisionModalOpen(false)}
        title="Yêu cầu chỉnh sửa mô hình 3D"
        onOk={() => revisionForm.submit()}
        confirmLoading={reviewLoading}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Form form={revisionForm} layout="vertical" onFinish={handleRequestRevision}>
          <Form.Item
            name="reason"
            label="Lý do cần chỉnh sửa"
            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập lý do' }]}
          >
            <Input placeholder="Ví dụ: Cần làm mịn bề mặt khuôn mặt, chi tiết tay áo chưa khớp..." />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú chi tiết cho Kỹ sư AI / 3D">
            <Input.TextArea rows={4} placeholder="Mô tả cụ thể những điểm cần điều chỉnh..." />
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
};
