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
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SendOutlined,
  SmileOutlined,
  SafetyCertificateOutlined,
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
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Không tìm thấy đơn hàng</h3>
        <p style={{ color: '#94a3b8' }}>{error?.message || 'Đơn hàng không tồn tại'}</p>
        <Button onClick={() => navigate('/manager/orders')}>Quay lại danh sách</Button>
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
    // If we have cash payment record, use its id; otherwise call confirm cash
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
  const isPaid = order.paymentStatus === 'PAID';
  const totalAmount = order.totalAmount ?? order.totalPrice;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/orders')}>
            Quay lại Đơn hàng
          </Button>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Space>

        <Space wrap>
          {/* Status Transitions */}
          {allowedStatuses.map((st) => {
            const isCancel = st === 'CANCELLED';
            const isConfirmed = st === 'CONFIRMED';
            const isPrinting = st === 'PRINTING' || st === 'PROCESSING';
            const isReady = st === 'READY';
            const isCompleted = st === 'COMPLETED' || st === 'DELIVERED';

            const buttonText =
              st === 'CONFIRMED'
                ? 'Duyệt đơn (Xác nhận)'
                : st === 'PROCESSING'
                ? 'Đang xử lý kỹ thuật'
                : st === 'PRINTING'
                ? 'Chuyển sang In 3D'
                : st === 'READY'
                ? 'Hoàn thiện (Sẵn sàng)'
                : st === 'COMPLETED' || st === 'DELIVERED'
                ? 'Đã hoàn thành'
                : st === 'CANCELLED'
                ? 'Hủy đơn'
                : st;

            return (
              <Popconfirm
                key={st}
                title={`Chuyển trạng thái đơn sang ${st}?`}
                description="Hành động này sẽ cập nhật trạng thái đơn hàng trên toàn hệ thống."
                onConfirm={() => handleStatusTransition(st)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type={isCancel ? 'default' : 'primary'}
                  danger={isCancel}
                  loading={updateOrderMutation.isPending}
                  icon={
                    isConfirmed ? (
                      <CheckCircleOutlined />
                    ) : isPrinting ? (
                      <PrinterOutlined />
                    ) : isReady ? (
                      <SendOutlined />
                    ) : isCompleted ? (
                      <SmileOutlined />
                    ) : (
                      <StopOutlined />
                    )
                  }
                  style={
                    !isCancel
                      ? {
                          background: 'var(--primary)',
                          borderColor: 'var(--primary)',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-full)',
                          boxShadow: '0 4px 12px rgba(124, 92, 252, 0.25)',
                        }
                      : { borderRadius: 'var(--radius-full)' }
                  }
                >
                  {buttonText}
                </Button>
              </Popconfirm>
            );
          })}

          <Button
            icon={<PrinterOutlined />}
            onClick={() => setPrintJobModalOpen(true)}
            style={{
              background: 'var(--surface-container)',
              borderColor: 'var(--border-default)',
              color: 'var(--primary)',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
            }}
          >
            Lập lệnh in 3D
          </Button>
        </Space>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Quản lý Đơn hàng #{orderCode}
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            ID hệ thống: {order.id} | Ngày tạo: {formatOrderDate(order.createdAt)}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Lifecycle Progress */}
      <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

      <Row gutter={[24, 24]}>
        {/* Left Column: Customer & Items */}
        <Col xs={24} lg={15}>
          {/* Order Items Snapshot Table */}
          <Card
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Danh sách sản phẩm trong đơn</span>}
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
                    title: 'Sản phẩm Snapshot',
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
                    render: (p) => formatCurrency(p, order.currency || 'VND'),
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
                Đơn hàng chế tác Memento3D (Quản lý)
              </div>
            )}
          </Card>

          {/* Customer & Delivery Card */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Thông tin khách hàng & Giao hàng</span>
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
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Sửa thông tin
                </Button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Khách hàng / Người nhận:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.recipientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Số điện thoại:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{order.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Địa chỉ nhận hàng:</span>
                <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: 350 }}>
                  {order.shippingAddress}
                </span>
              </div>
              {order.note && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ghi chú đơn:</span>
                  <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{order.note}</span>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Column: Pricing & Cash Confirmation */}
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
                <span style={{ color: 'var(--text-secondary)' }}>Tổng giá trị đơn:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(totalAmount, order.currency || 'VND')}
                </span>
              </div>

              {/* Manager Cash Confirmation Button */}
              {isCash && !isPaid && (
                <div
                  style={{
                    background: 'var(--mint-bg)',
                    border: '1px solid var(--mint-border)',
                    borderRadius: 'var(--radius-default)',
                    padding: 16,
                    marginTop: 8,
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'var(--mint-text)', marginBottom: 12 }}>
                    Đơn hàng thanh toán Tiền mặt (CASH). Khi đã nhận đủ tiền từ khách hàng hoặc đơn vị vận chuyển, xác nhận tại đây:
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
                        borderRadius: 'var(--radius-full)',
                        boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                      }}
                    >
                      Xác nhận đã nhận tiền
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
                  <span>Đã xác nhận thanh toán tiền mặt thành công.</span>
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
