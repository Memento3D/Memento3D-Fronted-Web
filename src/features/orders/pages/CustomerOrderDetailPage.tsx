import React, { useState, useMemo } from 'react';
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
  InboxOutlined,
  PrinterOutlined,
  CarOutlined,
  ExperimentOutlined,
  ToolOutlined,
  BgColorsOutlined,
  GoldOutlined,
  SkinOutlined,
  GiftOutlined,
  FormOutlined,
  CopyOutlined,
  LockOutlined,
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

  useEventSubscription('PRINT_JOB_UPDATED', (event) => {
    if (event.data?.orderId === id) {
      refetch();
    }
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '60px auto', color: 'var(--text-primary)' }}>
          <h2 style={{ color: '#ef4444' }}>Không tìm thấy đơn hàng</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {error?.message || 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <Button type="primary" onClick={() => navigate('/customer/orders')} style={{ borderRadius: 8 }}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const orderPayments = specificPayments.length > 0 ? specificPayments : payments.filter((p) => p.orderId === order.id);
  const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
  const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
  const isCash = order.paymentMethod === 'CASH';
  const isEligibleToPay = !isPaid && order.status !== 'CANCELLED' && order.status !== 'COMPLETED';
  const isEligibleToCancel = canCustomerCancel(order.status);
  const totalAmount = order.totalAmount ?? order.totalPrice;
  const paidAmount = order.paidAmount ?? (isPaid ? totalAmount : 0);
  const remainingAmount = order.remainingAmount ?? Math.max(0, totalAmount - paidAmount);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    message.success('Đã sao chép mã đơn hàng');
  };

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

  const items = useMemo(() => {
    if (order.items && order.items.length > 0) {
      return order.items;
    }
    const repName = order.representativeProductName || (order as any).productName || 'Kỷ vật 3D Điêu khắc Cá nhân hóa';
    const repThumb = order.representativeThumbnailUrl || (order as any).thumbnailUrl;
    const qty = order.itemCount || 1;
    const subtotal = order.subtotal || totalAmount || 0;
    const unitPrice = qty > 0 ? Math.round(subtotal / qty) : subtotal;

    return [
      {
        id: order.id + '-item-1',
        productId: (order as any).productId || order.scanId || undefined,
        productName: repName,
        productNameSnapshot: repName,
        thumbnailUrl: repThumb,
        thumbnailSnapshot: repThumb,
        sku: (order as any).sku || `MM3D-${orderCode}`,
        categoryName: (order as any).categoryName || 'Kỷ vật 3D Bespoke',
        unitPrice,
        quantity: qty,
        subtotal,
        material: (order as any).material || (order as any).actualMaterial || 'Nhựa quang hóa Resin cao cấp (SLA)',
        technology: (order as any).technology || 'In 3D đắp lớp quang hóa SLA (Dung sai ±0.05mm)',
        dimensions: (order as any).dimensions || 'Kích thước để bàn tiêu chuẩn (15cm)',
        color: (order as any).color || 'Bản màu gốc PolyJet / Đơn sắc hoàn thiện',
        finish: (order as any).finish || 'Xử lý UV & Phủ bóng mờ cao cấp',
        base: (order as any).base || 'Đế gỗ óc chó Walnut tự nhiên',
        personalization: order.note || (order as any).personalization,
        productionStatus: order.status,
      },
    ];
  }, [order, orderCode, totalAmount]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '110px 20px 60px' }}>
        {/* Navigation Breadcrumb & Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/orders')}
            style={{ color: 'var(--text-secondary)', paddingLeft: 0, borderRadius: 8, fontSize: '0.875rem' }}
          >
            Quay lại danh sách đơn hàng
          </Button>

          <Space wrap>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              style={{
                background: 'var(--surface-container)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
                borderRadius: 8,
              }}
            >
              Làm mới
            </Button>

            {isEligibleToPay && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => setPaymentModalOpen(true)}
                style={{
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontWeight: 600,
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(124, 92, 252, 0.25)',
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
                style={{ borderRadius: 8 }}
              >
                Hủy đơn
              </Button>
            )}
          </Space>
        </div>

        {/* 3.1 GENERAL INFO HEADER */}
        <Card
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-card)',
            marginBottom: 24,
          }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800, fontSize: '1.5rem', fontFamily: 'var(--font-mono, monospace)' }}>
                  #{orderCode}
                </h1>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined style={{ color: 'var(--text-muted)' }} />}
                  onClick={handleCopyCode}
                  title="Sao chép mã đơn"
                />
                <OrderStatusBadge status={order.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: '0.825rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>Ngày đặt: <strong style={{ color: 'var(--text-primary)' }}>{formatOrderDate(order.createdAt)}</strong></span>
                <span>•</span>
                <span>Khách hàng: <strong style={{ color: 'var(--text-primary)' }}>{order.recipientName || 'Khách hàng Memento3D'}</strong></span>
                <span>•</span>
                <span>Cập nhật gần nhất: <strong style={{ color: 'var(--text-primary)' }}>{formatOrderDate(order.updatedAt)}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                Tổng giá trị đơn hàng
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(totalAmount, order.currency || 'VND')}
              </div>
            </div>
          </div>
        </Card>

        {/* 3.6 ORDER TIMELINE */}
        <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

        {/* Alerts for active phases */}
        {order.status === 'PRINTING' && (
          <Alert
            message={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                Đang chế tác in 3D thực tế tại xưởng Memento3D
              </span>
            }
            description="Lệnh in của bạn đang được tiến hành trên thiết bị in 3D công nghiệp. Sau khi hoàn tất sẽ được chuyển sang khâu xử lý thủ công và kiểm định chất lượng (QC)."
            type="info"
            showIcon
            icon={<PrinterOutlined style={{ fontSize: 20, color: '#38bdf8' }} />}
            style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: 10,
              marginBottom: 24,
            }}
          />
        )}

        {order.status === 'SHIPPED' && (
          <Alert
            message="Đơn hàng đang trên đường vận chuyển tới bạn"
            description={`Kiện hàng đã xuất kho và được bàn giao cho đối tác ${order.shippingCarrier || 'vận chuyển'}. Mã vận đơn: ${order.trackingCode || 'Đang cập nhật'}.`}
            type="success"
            showIcon
            icon={<CarOutlined style={{ fontSize: 20, color: 'var(--tertiary)' }} />}
            style={{
              background: 'rgba(70, 98, 83, 0.1)',
              border: '1px solid rgba(70, 98, 83, 0.3)',
              borderRadius: 10,
              marginBottom: 24,
            }}
          />
        )}

        {/* Main 2-Column Layout */}
        <Row gutter={[24, 24]}>
          {/* Left Column: Products & Materials & Shipping & Payments */}
          <Col xs={24} lg={15}>
            {/* 3.2 & 3.3 PRODUCTS & MATERIAL SPECIFICATIONS */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Sản phẩm & Thông số nguyên liệu chế tác
                </h3>
                <Tag style={{ borderRadius: 6, background: 'var(--surface-container)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                  {items.length} mục sản phẩm
                </Tag>
              </div>

              {items.length > 0 ? (
                items.map((item, index) => {
                  const thumb = item.thumbnailUrl || item.thumbnailSnapshot;
                  const productName = item.productName || item.productNameSnapshot || 'Kỷ vật 3D';
                  const material = item.material || 'Chưa xác định';
                  const tech = item.technology || 'Chưa xác định';
                  const dimensions = item.dimensions || 'Chưa xác định';
                  const finish = item.finish || 'Chưa xác định';
                  const base = item.base || 'Chưa xác định';
                  const color = item.color || 'Tự nhiên';
                  const personalization = item.personalization;

                  return (
                    <Card
                      key={item.id || index}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 12,
                        boxShadow: 'var(--shadow-card)',
                        marginBottom: 16,
                      }}
                      styles={{ body: { padding: 20 } }}
                    >
                      {/* Product Header Row */}
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: 'var(--surface-container)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {thumb ? (
                            <img src={thumb} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <InboxOutlined style={{ fontSize: 32, color: 'var(--primary)' }} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {productName}
                            </h4>
                            {item.categoryName && (
                              <Tag color="purple" style={{ borderRadius: 6, margin: 0 }}>
                                {item.categoryName}
                              </Tag>
                            )}
                            {item.sku && (
                              <Tag style={{ borderRadius: 6, margin: 0, background: 'var(--surface-container)', color: 'var(--text-muted)' }}>
                                {item.sku}
                              </Tag>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Đơn giá: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.unitPrice, order.currency || 'VND')}</strong>
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Số lượng: <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginLeft: 'auto' }}>
                              {formatCurrency(item.subtotal, order.currency || 'VND')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Divider style={{ borderColor: 'var(--border-subtle)', margin: '16px 0 14px' }} />

                      {/* 3.3 MATERIAL & SPECIFICATION GRID */}
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                          Thông số nguyên liệu & Kỹ thuật chế tác
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: 10,
                          }}
                        >
                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <ExperimentOutlined style={{ color: 'var(--primary)' }} /> Vật liệu sản xuất:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {material}
                            </div>
                          </div>

                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <ToolOutlined style={{ color: '#38bdf8' }} /> Công nghệ in:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {tech}
                            </div>
                          </div>

                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <GoldOutlined style={{ color: '#fbbf24' }} /> Kích thước mô hình:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {dimensions}
                            </div>
                          </div>

                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <BgColorsOutlined style={{ color: '#ec4899' }} /> Màu sắc:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {color}
                            </div>
                          </div>

                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <SkinOutlined style={{ color: '#a855f7' }} /> Kiểu hoàn thiện:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {finish}
                            </div>
                          </div>

                          <div style={{ padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <GiftOutlined style={{ color: '#22c55e' }} /> Đế trưng bày:
                            </span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                              {base}
                            </div>
                          </div>
                        </div>

                        {personalization && (
                          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(124, 92, 252, 0.06)', borderRadius: 8, border: '1px solid rgba(124, 92, 252, 0.2)', fontSize: '0.825rem' }}>
                            <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                              <FormOutlined /> Cá nhân hóa / Khắc tên:
                            </span>
                            <div style={{ color: 'var(--text-primary)', marginTop: 2, fontStyle: 'italic' }}>
                              "{personalization}"
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12,
                    textAlign: 'center',
                    padding: 24,
                  }}
                >
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Kỷ vật 3D cá nhân hóa Memento3D (Dữ liệu đơn hàng bespoke)
                  </p>
                </Card>
              )}
            </div>

            {/* 3.5 SHIPPING & LOGISTICS CARD */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Thông tin vận chuyển & Nhận hàng</span>
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
                      style={{ borderRadius: 8 }}
                    >
                      Sửa địa chỉ
                    </Button>
                  )}
                </div>
              }
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-card)',
                marginBottom: 24,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserOutlined style={{ color: 'var(--primary)', fontSize: 16 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Người nhận</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.recipientName || 'Chưa cung cấp'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: '#38bdf8', fontSize: 16 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.phone || 'Chưa cung cấp'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CarOutlined style={{ color: 'var(--tertiary)', fontSize: 16 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Đơn vị vận chuyển</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingCarrier || 'Giao Hàng Nhanh (GHN)'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Tag style={{ borderRadius: 6, margin: 0, fontWeight: 700, fontFamily: 'monospace' }}>
                    {order.trackingCode || 'GHN-PREVIEW'}
                  </Tag>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mã vận đơn</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingStatus || 'Đang đóng gói'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, gridColumn: '1 / -1' }}>
                  <EnvironmentOutlined style={{ color: '#ec4899', fontSize: 16, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Địa chỉ giao hàng</div>
                    <div style={{ color: 'var(--text-primary)' }}>{order.shippingAddress || 'Chưa cung cấp'}</div>
                  </div>
                </div>

                {order.note && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, fontSize: '0.825rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ghi chú từ khách hàng: </span>
                    <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{order.note}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* PAYMENT TRANSACTIONS HISTORY */}
            {orderPayments.length > 0 && (
              <Card
                title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Lịch sử giao dịch thanh toán</span>}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-card)',
                }}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={orderPayments}
                  rowKey={(r: any) => r.paymentId || r.id || r.merchantTransactionId || Math.random()}
                  pagination={false}
                  columns={[
                    {
                      title: 'Cổng thanh toán',
                      dataIndex: 'paymentMethod',
                      key: 'paymentMethod',
                      render: (m) => (
                        <Tag color={m === 'VNPAY' ? '#005cb9' : m === 'CASH' ? '#466253' : 'purple'}>
                          {m === 'VNPAY' ? 'CỔNG VNPAY' : m === 'CASH' ? 'TIỀN MẶT (COD)' : m}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Mã tham chiếu',
                      dataIndex: 'merchantTransactionId',
                      key: 'merchantTransactionId',
                      render: (ref, r: any) => (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                          {ref || r.transactionRef || '-'}
                        </span>
                      ),
                    },
                    {
                      title: 'Số tiền',
                      dataIndex: 'amount',
                      key: 'amount',
                      align: 'right',
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

                        const color = isSuccess ? 'green' : isPending ? 'gold' : isCancelled ? 'orange' : 'red';
                        const label = isSuccess ? 'Thành công' : isPending ? 'Chờ xử lý' : isCancelled ? 'Đã hủy' : 'Thất bại';
                        return <Tag color={color}>{label}</Tag>;
                      },
                    },
                    {
                      title: 'Thời gian',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (t, r: any) => formatOrderDate(r.paymentDate || r.paidAt || t),
                    },
                  ]}
                />
              </Card>
            )}
          </Col>

          {/* Right Column: 3.4 Payment Breakdown Summary */}
          <Col xs={24} lg={9}>
            <Card
              title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Chi tiết thanh toán</span>}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-card)',
                position: 'sticky',
                top: 90,
              }}
              styles={{ body: { padding: 22 } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phương thức:</span>
                  <Tag style={{ borderRadius: 6, background: 'var(--surface-container)', color: 'var(--primary)', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                    {order.paymentMethod || 'VNPAY'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Trạng thái thanh toán:</span>
                  <Tag
                    style={{
                      borderRadius: 6,
                      background: isPaid ? 'rgba(70, 98, 83, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                      color: isPaid ? '#4ade80' : '#fbbf24',
                      border: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {isPaid ? 'Đã thanh toán' : isCash ? 'Thanh toán khi nhận hàng' : 'Chờ thanh toán'}
                  </Tag>
                </div>

                <Divider style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tạm tính sản phẩm:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {formatCurrency(order.subtotal ?? totalAmount, order.currency || 'VND')}
                  </span>
                </div>

                {order.customizationFee && order.customizationFee > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phí tùy biến & khắc tên:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatCurrency(order.customizationFee, order.currency || 'VND')}
                    </span>
                  </div>
                ) : null}

                {order.productionSurcharge && order.productionSurcharge > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phụ phí sản xuất hỏa tốc:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatCurrency(order.productionSurcharge, order.currency || 'VND')}
                    </span>
                  </div>
                ) : null}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phí vận chuyển:</span>
                  <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>
                    {order.shippingFee && order.shippingFee > 0 ? formatCurrency(order.shippingFee, order.currency || 'VND') : 'Miễn phí'}
                  </span>
                </div>

                {order.discountAmount && order.discountAmount > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Giảm giá:</span>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                      -{formatCurrency(order.discountAmount, order.currency || 'VND')}
                    </span>
                  </div>
                ) : null}

                <Divider style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>Tổng tiền đơn hàng:</span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(totalAmount, order.currency || 'VND')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Số tiền đã thanh toán:</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>
                    {formatCurrency(paidAmount, order.currency || 'VND')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Số tiền còn phải trả:</span>
                  <span style={{ color: remainingAmount > 0 ? '#fbbf24' : 'var(--text-primary)', fontWeight: 600 }}>
                    {formatCurrency(remainingAmount, order.currency || 'VND')}
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
                      borderRadius: 'var(--radius-sm, 6px)',
                      boxShadow: 'none',
                    }}
                  >
                    Thanh toán ngay
                  </Button>
                )}

                <div style={{ marginTop: 14, padding: '12px', background: 'var(--surface-container)', borderRadius: 'var(--radius-sm, 6px)', fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  <LockOutlined style={{ marginRight: 8, color: 'var(--primary)', fontSize: '1rem', flexShrink: 0 }} />
                  <span>Giao dịch được bảo mật bởi chuẩn mã hóa VNPAY & Ngân hàng Nhà nước. Hỗ trợ khách hàng 24/7 qua hotline 1900-3D-MEMO.</span>
                </div>
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
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Đơn hàng sẽ chuyển sang trạng thái Đã hủy và không tiếp tục sản xuất.
        </p>
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
            onClick={handleApproveModel}
            loading={reviewLoading}
            style={{ background: '#22c55e', borderColor: '#22c55e' }}
          >
            Đồng ý & Xác nhận in 3D
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Vui lòng kiểm tra tỉ lệ khuôn mặt, tư thế và chi tiết của mô hình 3D trước khi xưởng Memento3D tiến hành in vật lý.
          </p>
        </div>
      </Modal>

      {/* Request Revision Modal */}
      <Modal
        open={revisionModalOpen}
        onCancel={() => setRevisionModalOpen(false)}
        title="Yêu cầu chỉnh sửa mô hình 3D"
        onOk={() => revisionForm.submit()}
        confirmLoading={reviewLoading}
      >
        <Form form={revisionForm} layout="vertical" onFinish={handleRequestRevision}>
          <Form.Item name="reason" label="Lý do chỉnh sửa" rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}>
            <Input placeholder="Ví dụ: Cần chỉnh nét mặt, mắt, cằm..." />
          </Form.Item>
          <Form.Item name="notes" label="Chi tiết yêu cầu kỹ thuật">
            <Input.TextArea rows={4} placeholder="Mô tả cụ thể góc nhìn hoặc đặc điểm bạn muốn chuyên gia 3D hoàn thiện lại..." />
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
};
