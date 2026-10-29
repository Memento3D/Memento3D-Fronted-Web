import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
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
  Popconfirm,
  Skeleton,
  Radio,
  InputNumber,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  InboxOutlined,
  FileDoneOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ExperimentOutlined,
  ToolOutlined,
  GoldOutlined,
  BgColorsOutlined,
  SkinOutlined,
  GiftOutlined,
  FormOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useUpdateOrder } from '../hooks/useUpdateOrder';
import { usePaymentsList, useConfirmCash } from '../hooks/useOrderPayment';
import { orderApi } from '../api/orderApi';
import { printJobApi } from '../../printjob/api/printJobApi';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderTimeline } from '../components/OrderTimeline';
import { OrderPrintJobLinkModal } from '../components/OrderPrintJobLinkModal';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import { getNextAllowedStatuses } from '../utils/orderStateMachine';
import type { OrderStatus } from '../types/order.types';

export const ManagerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, refetch, isFetching } = useOrderDetail(id);
  const updateOrderMutation = useUpdateOrder(id || '');
  const { data: payments = [], refetch: refetchPayments } = usePaymentsList();
  const confirmCashMutation = useConfirmCash();

  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [printJobModalOpen, setPrintJobModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [feasibilityModalOpen, setFeasibilityModalOpen] = useState(false);
  const [feasibilityForm] = Form.useForm();
  const [isReviewing, setIsReviewing] = useState(false);

  // Fetch linked print jobs for this order
  const { refetch: refetchPrintJobs } = useQuery({
    queryKey: ['order-print-jobs', id],
    queryFn: () => printJobApi.list({ limit: 50 }),
    enabled: Boolean(id),
  });

  const items = useMemo(() => {
    if (!order) return [];
    const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
    const totalAmount = order.totalAmount ?? order.totalPrice;
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
        id: order.id + '-item',
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
        technology: (order as any).technology || 'SLA Công nghiệp',
        dimensions: (order as any).dimensions || 'Tiêu chuẩn (15cm x 10cm x 10cm)',
        color: (order as any).color || 'Bản màu gốc PolyJet / Đơn sắc hoàn thiện',
        finish: (order as any).finish || 'Xử lý UV & Phủ bóng mờ cao cấp',
        base: (order as any).base || 'Đế gỗ óc chó Walnut tự nhiên',
        personalization: order.note || (order as any).personalization,
        productionStatus: order.status,
      },
    ];
  }, [order]);

  if (isLoading || (isError && isFetching)) {
    return (
      <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => { void refetch(); }} />;
  }

  if (!order) {
    return <div style={{ padding: 24, textAlign: 'center' }}>
      <EmptyState title="Không tìm thấy đơn hàng." />
      <Button onClick={() => navigate('/manager/orders')}>Quay lại danh sách</Button>
    </div>;
  }

  const orderPayments = payments.filter((p) => p.orderId === order.id);
  const cashPayment = orderPayments.find((p) => p.paymentMethod === 'CASH');
  const orderCode = order.orderCode || order.id.slice(0, 8).toUpperCase();
  const allowedStatuses = getNextAllowedStatuses(order.status, true);

  const handleStatusTransition = async (nextStatus: OrderStatus) => {
    try {
      await updateOrderMutation.mutateAsync({ status: nextStatus });
      message.success(`Đã cập nhật trạng thái đơn hàng thành: ${nextStatus}`);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleConfirmCash = async () => {
    const targetPaymentId = cashPayment ? cashPayment.paymentId : order.id;
    try {
      await confirmCashMutation.mutateAsync(targetPaymentId);
      message.success('Xác nhận đã nhận tiền mặt thành công! Trạng thái thanh toán chuyển sang PAID.');
      refetch();
      refetchPayments();
    } catch (err: any) {
      message.error(err.message || 'Không thể xác nhận thanh toán tiền mặt');
    }
  };

  const handleUpdateShipping = async (values: any) => {
    try {
      await updateOrderMutation.mutateAsync({
        recipientName: values.recipientName,
        phone: values.phone,
        shippingAddress: values.shippingAddress,
      });
      message.success('Đã cập nhật thông tin giao nhận');
      setEditAddressOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật');
    }
  };

  const handleReviewFeasibility = async (values: any) => {
    try {
      setIsReviewing(true);
      await orderApi.reviewFeasibility(order.id, {
        status: values.status,
        notes: values.notes,
        finalPrice: values.finalPrice ? Number(values.finalPrice) : undefined,
        estimatedDays: values.estimatedDays ? Number(values.estimatedDays) : undefined,
        revisionGlbUrl: values.revisionGlbUrl || undefined,
      });
      message.success('Đã cập nhật kết quả thẩm định kỹ thuật & báo giá thành công!');
      setFeasibilityModalOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật thẩm định kỹ thuật');
    } finally {
      setIsReviewing(false);
    }
  };

  const isCash = order.paymentMethod === 'CASH';
  const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
  const totalAmount = order.totalAmount ?? order.totalPrice;


  const internalCost = order.internalCost || 0;
  const grossProfit = Math.max(0, totalAmount - internalCost);

  return (
    <div style={{ padding: '8px 0', maxWidth: 1360, margin: '0 auto' }}>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/orders')} style={{ borderRadius: 8 }}>
            Quay lại Đơn hàng
          </Button>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} style={{ borderRadius: 8 }}>
            Làm mới
          </Button>
        </Space>

        <Space wrap>
          {/* Status Transitions */}
          {allowedStatuses.map((st) => (
            <Button
              key={st}
              type={st === 'CANCELLED' ? 'default' : 'primary'}
              danger={st === 'CANCELLED'}
              onClick={() => handleStatusTransition(st)}
              loading={updateOrderMutation.isPending}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background:
                  st === 'PRINTING'
                    ? '#0ea5e9'
                    : st === 'SHIPPED'
                    ? '#f59e0b'
                    : st === 'DELIVERED'
                    ? 'var(--tertiary)'
                    : undefined,
                borderColor:
                  st === 'PRINTING'
                    ? '#0ea5e9'
                    : st === 'SHIPPED'
                    ? '#f59e0b'
                    : st === 'DELIVERED'
                    ? 'var(--tertiary)'
                    : undefined,
              }}
            >
              Chuyển sang: {st}
            </Button>
          ))}

          {(order.status === 'CONFIRMED' || order.status === 'PRINTING') && (
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => setPrintJobModalOpen(true)}
              style={{
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Lập lệnh in 3D
            </Button>
          )}

          {order.scanId && (
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => {
                feasibilityForm.setFieldsValue({
                  status: order.feasibilityStatus || 'FEASIBLE',
                  notes: order.feasibilityNotes || '',
                  finalPrice: order.totalAmount ?? order.totalPrice,
                  estimatedDays: order.estimatedProductionDays || 3,
                  revisionGlbUrl: order.revisionGlbUrl || '',
                });
                setFeasibilityModalOpen(true);
              }}
              style={{
                background: '#8b5cf6',
                borderColor: '#8b5cf6',
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Thẩm định kỹ thuật & Báo giá
            </Button>
          )}
        </Space>
      </div>

      {/* Order Banner Header */}
      <Card
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-card)',
          marginBottom: 20,
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800, fontSize: '1.4rem', fontFamily: 'monospace' }}>
                #{orderCode}
              </h1>
              <OrderStatusBadge status={order.status} />
              {order.isOutsourced && (
                <Tag color="cyan" style={{ borderRadius: 6, margin: 0, fontWeight: 600 }}>
                  GIA CÔNG NGOÀI (PARTNER LAB)
                </Tag>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: '0.825rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>Ngày tạo: <strong style={{ color: 'var(--text-primary)' }}>{formatOrderDate(order.createdAt)}</strong></span>
              <span>•</span>
              <span>Cập nhật: <strong style={{ color: 'var(--text-primary)' }}>{formatOrderDate(order.updatedAt)}</strong></span>
              <span>•</span>
              <span>Khách hàng: <strong style={{ color: 'var(--text-primary)' }}>{order.recipientName || 'Chưa cung cấp'}</strong></span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Doanh thu đơn hàng
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(totalAmount, order.currency || 'VND')}
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

      <Row gutter={[24, 24]}>
        {/* Left Column: Products, Material Specs & Internal Workshop Outsourcing */}
        <Col xs={24} lg={15}>
          {/* PHẦN ĐẶC THÙ: HỒ SƠ 3D SCAN & THẨM ĐỊNH KHẢ NĂNG SẢN XUẤT */}
          {order.scanId && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8b5cf6' }}>
                    <SafetyCertificateOutlined style={{ fontSize: 18 }} />
                    <span style={{ fontWeight: 800 }}>Hồ sơ Kỷ vật 3D & Thẩm định Khả năng Sản xuất</span>
                  </div>
                  <Tag
                    color={
                      order.feasibilityStatus === 'ACCEPTED'
                        ? 'blue'
                        : order.feasibilityStatus === 'FEASIBLE'
                        ? 'green'
                        : order.feasibilityStatus === 'REVISION_REQUESTED'
                        ? 'orange'
                        : order.feasibilityStatus === 'REJECTED'
                        ? 'red'
                        : 'gold'
                    }
                    style={{ borderRadius: 6, fontWeight: 700 }}
                  >
                    {order.feasibilityStatus === 'ACCEPTED'
                      ? 'Khách đã duyệt báo giá'
                      : order.feasibilityStatus === 'FEASIBLE'
                      ? 'Đạt điều kiện sản xuất'
                      : order.feasibilityStatus === 'REVISION_REQUESTED'
                      ? 'Yêu cầu chỉnh sửa file'
                      : order.feasibilityStatus === 'REJECTED'
                      ? 'Từ chối sản xuất'
                      : 'Chờ xưởng thẩm định'}
                  </Tag>
                </div>
              }
              style={{
                background: 'var(--surface-container)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                marginBottom: 24,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mã Scan / Reconstruction Job</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'monospace' }}>
                    {order.scanId}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Thời gian sản xuất dự kiến</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', marginTop: 2 }}>
                    {order.estimatedProductionDays ? `${order.estimatedProductionDays} ngày làm việc` : 'Chưa định lượng'}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Thời điểm khách duyệt báo giá</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {order.customerAcceptedAt ? formatOrderDate(order.customerAcceptedAt) : 'Chưa duyệt'}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ghi chú kỹ thuật từ xưởng (Feasibility Notes):</div>
                  <div style={{ color: 'var(--text-primary)', marginTop: 4, fontSize: '0.875rem' }}>
                    {order.feasibilityNotes || 'Chưa có ghi chú thẩm định từ kỹ thuật viên.'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/reconstruction/${order.scanId}`)}
                  style={{ borderRadius: 8 }}
                >
                  Xem mô hình 3D gốc
                </Button>
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => {
                    feasibilityForm.setFieldsValue({
                      status: order.feasibilityStatus || 'FEASIBLE',
                      notes: order.feasibilityNotes || '',
                      finalPrice: order.totalAmount ?? order.totalPrice,
                      estimatedDays: order.estimatedProductionDays || 3,
                      revisionGlbUrl: order.revisionGlbUrl || '',
                    });
                    setFeasibilityModalOpen(true);
                  }}
                  style={{ background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8 }}
                >
                  Cập nhật Thẩm định & Báo giá
                </Button>
              </div>
            </Card>
          )}

          {/* PHẦN 4: THÔNG TIN NỘI BỘ XƯỞNG GIA CÔNG THUÊ NGOÀI (ADMIN / MANAGER ONLY) */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8' }}>
                <ShopOutlined style={{ fontSize: 18 }} />
                <span style={{ fontWeight: 800 }}>Quản lý Sản xuất & Xưởng gia công Đối tác (Nội bộ Admin/Manager)</span>
              </div>
            }
            style={{
              background: 'var(--surface-container)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              marginBottom: 24,
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Xưởng đối tác gia công</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontSize: '0.95rem' }}>
                  {order.internalPartnerName || 'Xưởng chế tác Memento3D Lab'}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chi phí thuê xưởng / gia công (Giá vốn)</div>
                <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 2, fontSize: '0.95rem' }}>
                  {internalCost > 0 ? formatCurrency(internalCost, order.currency || 'VND') : 'Chưa nhập chi phí'}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lợi nhuận gộp ước tính</div>
                <div style={{ fontWeight: 700, color: 'var(--tertiary)', marginTop: 2, fontSize: '0.95rem' }}>
                  {formatCurrency(grossProfit, order.currency || 'VND')}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trạng thái gia công tại xưởng</div>
                <div style={{ fontWeight: 700, color: '#0284c7', marginTop: 2, fontSize: '0.95rem' }}>
                  {order.status === 'PRINTING' ? 'Đang chạy lệnh in máy SLA' : order.status === 'READY' ? 'Đã hoàn thiện & đóng gói' : 'Hàng đợi kỹ thuật'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileDoneOutlined style={{ color: 'var(--tertiary)' }} /> Ghi chú kiểm định chất lượng (QC Notes):
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: 4, fontSize: '0.875rem' }}>
                  {order.internalQcNotes || 'Chưa ghi nhận phản hồi QC. Sản phẩm đạt dung sai kích thước tiêu chuẩn ±0.2mm.'}
                </div>
              </div>
            </div>
          </Card>

          {/* Purchased Products & Detailed Material Specs */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Danh sách sản phẩm & Thông số kỹ thuật chế tác</span>
                <Tag style={{ borderRadius: 6, background: 'var(--surface-container)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                  {items.length} mục sản phẩm
                </Tag>
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
            {items.map((item, idx) => (
              <div key={item.id || idx} style={{ marginBottom: idx < items.length - 1 ? 24 : 0 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'var(--surface-container)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.thumbnailUrl || item.thumbnailSnapshot ? (
                      <img src={item.thumbnailUrl || item.thumbnailSnapshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <InboxOutlined style={{ fontSize: 28, color: 'var(--primary)' }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        {item.productName || item.productNameSnapshot || 'Kỷ vật 3D'}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {formatCurrency(item.subtotal, order.currency || 'VND')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                      <span>Mã SKU: <strong style={{ color: 'var(--text-primary)' }}>{item.sku || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Đơn giá: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.unitPrice, order.currency || 'VND')}</strong></span>
                      <span>•</span>
                      <span>Số lượng: <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong></span>
                      <span>•</span>
                      <span>Trạng thái: <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>{item.productionStatus || order.status}</Tag></span>
                    </div>

                    {/* Detailed Specifications Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <ExperimentOutlined style={{ color: 'var(--primary)' }} /> Vật liệu:
                        </span>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.material || 'Nhựa quang hóa Resin cao cấp'}</div>
                      </div>

                      <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <ToolOutlined style={{ color: '#0284c7' }} /> Công nghệ:
                        </span>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.technology || 'In đắp lớp quang hóa SLA'}</div>
                      </div>

                      <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <GoldOutlined style={{ color: '#d97706' }} /> Kích thước:
                        </span>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.dimensions || 'Tiêu chuẩn (15cm)'}</div>
                      </div>

                      <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <BgColorsOutlined style={{ color: '#db2777' }} /> Màu sắc:
                        </span>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.color || 'Bản màu PolyJet / Đơn sắc'}</div>
                      </div>

                      {item.finish && (
                        <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <SkinOutlined style={{ color: '#7c3aed' }} /> Kiểu hoàn thiện:
                          </span>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.finish}</div>
                        </div>
                      )}

                      {item.base && (
                        <div style={{ padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <GiftOutlined style={{ color: 'var(--tertiary)' }} /> Đế trưng bày:
                          </span>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.base}</div>
                        </div>
                      )}
                    </div>

                    {item.personalization && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--surface-container)', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <FormOutlined /> Ghi chú cá nhân hóa / Khắc tên:
                        </span>
                        <div style={{ color: 'var(--text-primary)', marginTop: 2, fontStyle: 'italic' }}>
                          "{item.personalization}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {idx < items.length - 1 && <Divider style={{ borderColor: 'var(--border-subtle)', margin: '18px 0' }} />}
              </div>
            ))}
          </Card>

          {/* Customer & Delivery Card */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Thông tin khách hàng & Giao nhận</span>
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
                  Sửa thông tin
                </Button>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserOutlined style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Người nhận</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.recipientName || 'Chưa cung cấp'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneOutlined style={{ color: '#38bdf8' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Số điện thoại</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.phone || 'Chưa cung cấp'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CarOutlined style={{ color: 'var(--tertiary)' }} />
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
                <EnvironmentOutlined style={{ color: '#ec4899', marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Địa chỉ nhận hàng</div>
                  <div style={{ color: 'var(--text-primary)' }}>{order.shippingAddress || 'Chưa cung cấp'}</div>
                </div>
              </div>

              {order.note && (
                <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ghi chú đơn: </span>
                  <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{order.note}</span>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Column: Pricing & Cash Confirmation */}
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Thông tin thanh toán & Quyết toán</span>}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-card)',
              position: 'sticky',
              top: 80,
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
                  {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </Tag>
              </div>

              <Divider style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tạm tính sản phẩm:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {formatCurrency(order.subtotal ?? totalAmount, order.currency || 'VND')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Phí vận chuyển:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {order.shippingFee && order.shippingFee > 0 ? formatCurrency(order.shippingFee, order.currency || 'VND') : '0 đ'}
                </span>
              </div>

              <Divider style={{ borderColor: 'var(--border-subtle)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Tổng giá trị đơn:</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(totalAmount, order.currency || 'VND')}
                </span>
              </div>

              {/* Manager Cash Confirmation Button */}
              {isCash && !isPaid && (
                <div
                  style={{
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.25)',
                    borderRadius: 10,
                    padding: 16,
                    marginTop: 8,
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: 12 }}>
                    Đơn hàng thanh toán Tiền mặt khi nhận hàng (CASH/COD). Khi tài xế hoặc khách đã nộp tiền, quản lý xác nhận tại đây:
                  </div>

                  <Popconfirm
                    title="Xác nhận đã nhận tiền mặt?"
                    description="Thao tác này sẽ chuyển trạng thái thanh toán từ Chờ thanh toán sang Đã thanh toán."
                    onConfirm={handleConfirmCash}
                    okText="Xác nhận đã thu tiền"
                    cancelText="Hủy"
                  >
                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<SafetyCertificateOutlined />}
                      loading={confirmCashMutation.isPending}
                      style={{
                        background: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        fontWeight: 700,
                        borderRadius: 8,
                      }}
                    >
                      Xác nhận đã thu tiền mặt
                    </Button>
                  </Popconfirm>
                </div>
              )}

              {isCash && isPaid && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#86efac',
                    fontSize: '0.85rem',
                  }}
                >
                  <CheckCircleOutlined />
                  <span>Đã xác nhận thu tiền mặt thành công.</span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Edit Address Modal */}
      <Modal
        open={editAddressOpen}
        onCancel={() => setEditAddressOpen(false)}
        title="Cập nhật thông tin giao nhận"
        onOk={() => form.submit()}
        confirmLoading={updateOrderMutation.isPending}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateShipping}>
          <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}>
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
          <Form.Item name="shippingAddress" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Print Job Modal */}
      <OrderPrintJobLinkModal
        open={printJobModalOpen}
        order={order}
        onClose={() => setPrintJobModalOpen(false)}
        onSuccess={() => {
          refetch();
          refetchPrintJobs();
        }}
      />

      {/* Feasibility Review Modal */}
      <Modal
        open={feasibilityModalOpen}
        onCancel={() => setFeasibilityModalOpen(false)}
        title="Thẩm định Khả năng Sản xuất & Báo giá Xưởng"
        onOk={() => feasibilityForm.submit()}
        confirmLoading={isReviewing}
        okText="Lưu thẩm định & Gửi khách"
        cancelText="Đóng"
        width={640}
      >
        <Form
          form={feasibilityForm}
          layout="vertical"
          onFinish={handleReviewFeasibility}
          initialValues={{
            status: order.feasibilityStatus || 'FEASIBLE',
            notes: order.feasibilityNotes || '',
            finalPrice: order.totalAmount ?? order.totalPrice,
            estimatedDays: order.estimatedProductionDays || 3,
            revisionGlbUrl: order.revisionGlbUrl || '',
          }}
        >
          <Form.Item
            name="status"
            label="Kết luận thẩm định kỹ thuật"
            rules={[{ required: true, message: 'Vui lòng chọn kết luận' }]}
          >
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Radio value="FEASIBLE">
                <span style={{ fontWeight: 600, color: '#22c55e' }}>Đạt điều kiện sản xuất (Feasible)</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Mô hình 3D kín, độ dày thành đạt chuẩn in, chốt báo giá cuối và số ngày sản xuất cho khách.
                </div>
              </Radio>
              <Radio value="REVISION_REQUESTED">
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>Yêu cầu chỉnh sửa mô hình (Revision Requested)</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Cần xử lý lưới mesh, lấp lỗ hổng hoặc tải phiên bản 3D đã sửa để khách phê duyệt.
                </div>
              </Radio>
              <Radio value="REJECTED">
                <span style={{ fontWeight: 600, color: '#ef4444' }}>Không thể sản xuất (Rejected)</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Mô hình vượt quá khả năng công nghệ hoặc vi phạm chính sách in ấn.
                </div>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.status !== cur.status}>
            {({ getFieldValue }) => {
              const currentStatus = getFieldValue('status');
              return (
                <>
                  {currentStatus === 'FEASIBLE' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <Form.Item
                        name="finalPrice"
                        label="Báo giá sản xuất chính thức (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập báo giá' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(v) => (v ? Number(v.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                          min={50000}
                        />
                      </Form.Item>

                      <Form.Item
                        name="estimatedDays"
                        label="Thời gian sản xuất dự kiến (ngày)"
                        rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={1} max={30} />
                      </Form.Item>
                    </div>
                  )}

                  {currentStatus === 'REVISION_REQUESTED' && (
                    <Form.Item
                      name="revisionGlbUrl"
                      label="Đường dẫn file GLB đã chỉnh sửa (nếu kỹ thuật viên sửa sẵn)"
                    >
                      <Input placeholder="https://res.cloudinary.com/.../model-fixed.glb" />
                    </Form.Item>
                  )}
                </>
              );
            }}
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú kỹ thuật & hướng dẫn xưởng gửi cho khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú thẩm định' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Mô hình đã được kiểm tra độ dày thành tối thiểu 1.5mm, phù hợp công nghệ SLA Resin. Khách hàng vui lòng duyệt báo giá để đưa vào máy in."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
