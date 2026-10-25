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
  Popconfirm,
  Skeleton,
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
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useUpdateOrder } from '../hooks/useUpdateOrder';
import { usePaymentsList, useConfirmCash } from '../hooks/useOrderPayment';
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

  const { data: order, isLoading, isError, error, refetch, isFetching } = useOrderDetail(id);
  const updateOrderMutation = useUpdateOrder(id || '');
  const { data: payments = [], refetch: refetchPayments } = usePaymentsList();
  const confirmCashMutation = useConfirmCash();

  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [printJobModalOpen, setPrintJobModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch linked print jobs for this order
  const { refetch: refetchPrintJobs } = useQuery({
    queryKey: ['order-print-jobs', id],
    queryFn: () => printJobApi.list({ limit: 50 }),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 1300, margin: '0 auto' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Không tìm thấy đơn hàng</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error?.message || 'Đơn hàng không tồn tại'}</p>
        <Button onClick={() => navigate('/manager/orders')} style={{ borderRadius: 8 }}>
          Quay lại danh sách
        </Button>
      </div>
    );
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

  const isCash = order.paymentMethod === 'CASH';
  const isPaid = order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
  const totalAmount = order.totalAmount ?? order.totalPrice;
  const items = order.items && order.items.length > 0 ? order.items : [];

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
                    ? '#22c55e'
                    : undefined,
                borderColor:
                  st === 'PRINTING'
                    ? '#0ea5e9'
                    : st === 'SHIPPED'
                    ? '#f59e0b'
                    : st === 'DELIVERED'
                    ? '#22c55e'
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
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                borderColor: 'transparent',
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Lập lệnh in 3D
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
          {/* PHẦN 4: THÔNG TIN NỘI BỘ XƯỞNG GIA CÔNG THUÊ NGOÀI (ADMIN / MANAGER ONLY) */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8' }}>
                <ShopOutlined style={{ fontSize: 18 }} />
                <span style={{ fontWeight: 800 }}>Quản lý Sản xuất & Xưởng gia công Đối tác (Nội bộ Admin/Manager)</span>
              </div>
            }
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: 12,
              marginBottom: 24,
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Xưởng đối tác gia công</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontSize: '0.95rem' }}>
                  {order.internalPartnerName || 'Xưởng chế tác Memento3D Lab'}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chi phí thuê xưởng / gia công (Giá vốn)</div>
                <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 2, fontSize: '0.95rem' }}>
                  {internalCost > 0 ? formatCurrency(internalCost, order.currency || 'VND') : 'Chưa nhập chi phí'}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lợi nhuận gộp ước tính</div>
                <div style={{ fontWeight: 700, color: '#22c55e', marginTop: 2, fontSize: '0.95rem' }}>
                  {formatCurrency(grossProfit, order.currency || 'VND')}
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trạng thái gia công tại xưởng</div>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: 2, fontSize: '0.95rem' }}>
                  {order.status === 'PRINTING' ? 'Đang chạy lệnh in máy SLA' : order.status === 'READY' ? 'Đã hoàn thiện & đóng gói' : 'Hàng đợi kỹ thuật'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'var(--surface-container)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileDoneOutlined style={{ color: '#22c55e' }} /> Ghi chú kiểm định chất lượng (QC Notes):
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: 4, fontSize: '0.875rem' }}>
                  {order.internalQcNotes || 'Chưa ghi nhận phản hồi QC. Sản phẩm đạt dung sai kích thước tiêu chuẩn ±0.2mm.'}
                </div>
              </div>
            </div>
          </Card>

          {/* Purchased Products & Detailed Material Specs */}
          <Card
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Danh sách sản phẩm & Thông số kỹ thuật</span>}
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
              <div key={item.id || idx} style={{ marginBottom: idx < items.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.thumbnailUrl || item.thumbnailSnapshot ? (
                      <img src={item.thumbnailUrl || item.thumbnailSnapshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <InboxOutlined style={{ fontSize: 24, color: '#7c5cfc' }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {item.productName || item.productNameSnapshot || 'Kỷ vật 3D'}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(item.subtotal, order.currency || 'VND')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      <span>SKU: <strong style={{ color: 'var(--text-primary)' }}>{item.sku || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Đơn giá: {formatCurrency(item.unitPrice, order.currency || 'VND')}</span>
                      <span>•</span>
                      <span>Số lượng: x{item.quantity}</span>
                    </div>

                    {/* Material Specs */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: '0.8rem' }}>
                      <Tag color="blue" style={{ borderRadius: 6, margin: 0 }}>Vật liệu: {item.material || 'Chưa xác định'}</Tag>
                      <Tag color="cyan" style={{ borderRadius: 6, margin: 0 }}>Công nghệ: {item.technology || 'SLA'}</Tag>
                      <Tag color="gold" style={{ borderRadius: 6, margin: 0 }}>Kích thước: {item.dimensions || 'Tiêu chuẩn'}</Tag>
                      <Tag color="purple" style={{ borderRadius: 6, margin: 0 }}>Màu sắc: {item.color || 'Tự nhiên'}</Tag>
                    </div>
                  </div>
                </div>

                {idx < items.length - 1 && <Divider style={{ borderColor: 'var(--border-subtle)', margin: '16px 0' }} />}
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
    </div>
  );
};
