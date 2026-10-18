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
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { useUpdateOrder } from '../hooks/useUpdateOrder';
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

  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [printJobModalOpen, setPrintJobModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch linked print jobs for this order
  const { data: printJobsData, refetch: refetchPrintJobs } = useQuery({
    queryKey: ['order-print-jobs', id],
    queryFn: () => printJobApi.list({ limit: 50 }),
    enabled: Boolean(id),
  });

  const linkedPrintJobs = (printJobsData?.content || []).filter((j) => j.orderId === id);

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

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/manager/orders')}
            className="btn btn-secondary"
          >
            Quay lại
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Mã UUID: {order.id} | Khách hàng UUID: {order.userId}
            </div>
          </div>
        </div>

        <Space wrap>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} className="btn btn-secondary">
            Làm mới
          </Button>

          {/* Workflow Action Buttons */}
          {allowedStatuses.map((st) => {
            const isCancel = st === 'CANCELLED';
            const isPrinting = st === 'PRINTING';
            const isConfirmed = st === 'CONFIRMED';
            const isShipped = st === 'SHIPPED';
            const isDelivered = st === 'DELIVERED';

            const buttonText =
              st === 'CONFIRMED'
                ? 'Duyệt đơn (Xác nhận)'
                : st === 'PRINTING'
                ? 'Chuyển sang In 3D'
                : st === 'SHIPPED'
                ? 'Bàn giao Vận chuyển'
                : st === 'DELIVERED'
                ? 'Đánh dấu Đã giao'
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
                    ) : isShipped ? (
                      <SendOutlined />
                    ) : isDelivered ? (
                      <SmileOutlined />
                    ) : (
                      <StopOutlined />
                    )
                  }
                  style={
                    !isCancel
                      ? {
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                          borderColor: 'transparent',
                          fontWeight: 600,
                        }
                      : {}
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
              background: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              fontWeight: 600,
            }}
          >
            Lập lệnh in 3D
          </Button>
        </Space>
      </div>

      {/* Lifecycle Progress */}
      <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />

      <Row gutter={[24, 24]}>
        {/* Left Column: Customer & Delivery Details */}
        <Col xs={24} lg={15}>
          {/* Recipient Card */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Thông tin khách hàng & Giao hàng</span>
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
                >
                  Sửa thông tin
                </Button>
              </div>
            }
            style={{
              background: 'var(--card-bg, #0f172a)',
              borderColor: 'var(--border-color)',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Người nhận</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                  {order.recipientName || 'Chưa cung cấp'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Số điện thoại</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                  {order.phone || 'Chưa cung cấp'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Địa chỉ giao hàng</div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>
                  {order.shippingAddress || 'Chưa cung cấp'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Scan Session liên kết</div>
                <div style={{ color: '#0ea5e9', fontWeight: 600 }}>
                  {order.scanId ? `#${order.scanId}` : 'Mô hình chuẩn'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ngày tạo đơn</div>
                <div style={{ color: '#cbd5e1' }}>{formatOrderDate(order.createdAt)}</div>
              </div>
            </div>
          </Card>

          {/* Linked Print Jobs Section */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Lệnh in 3D liên kết (Print Jobs)</span>
                <Button
                  size="small"
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={() => setPrintJobModalOpen(true)}
                  style={{ background: '#8b5cf6', borderColor: 'transparent' }}
                >
                  Tạo Print Job
                </Button>
              </div>
            }
            style={{
              background: 'var(--card-bg, #0f172a)',
              borderColor: 'var(--border-color)',
            }}
          >
            {linkedPrintJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                Chưa có Print Job nào được liên kết cho đơn hàng này.
                <div style={{ marginTop: 8 }}>
                  <Button size="small" onClick={() => setPrintJobModalOpen(true)}>
                    Tạo lệnh in ngay
                  </Button>
                </div>
              </div>
            ) : (
              <Table
                dataSource={linkedPrintJobs}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Job Number',
                    dataIndex: 'jobNumber',
                    key: 'jobNumber',
                    render: (j: string) => <span style={{ fontWeight: 700, color: '#a855f7' }}>{j}</span>,
                  },
                  {
                    title: 'Vật liệu',
                    dataIndex: 'materialName',
                    key: 'materialName',
                    render: (m: string, r) => <span>{m || r.materialSku}</span>,
                  },
                  {
                    title: 'Khối lượng (g)',
                    dataIndex: 'estimatedGram',
                    key: 'estimatedGram',
                    render: (g: number) => <span>{g} g</span>,
                  },
                  {
                    title: 'Trạng thái Job',
                    dataIndex: 'status',
                    key: 'status',
                    render: (st: string) => <Tag color="purple">{st}</Tag>,
                  },
                  {
                    title: 'Xem',
                    key: 'action',
                    render: (_, r) => (
                      <Button
                        size="small"
                        onClick={() => navigate(`/manager/print-jobs?search=${r.jobNumber}`)}
                      >
                        Trạm in
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* Right Column: Pricing & Manager Actions */}
        <Col xs={24} lg={9}>
          <Card
            title={<span style={{ color: '#fff', fontWeight: 700 }}>Thông tin thanh toán</span>}
            style={{
              background: 'var(--card-bg, #0f172a)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Tổng giá trị:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                  {formatCurrency(order.totalPrice, order.currency)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Tiền tệ:</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{order.currency}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Trạng thái đơn:</span>
                <OrderStatusBadge status={order.status} />
              </div>

              <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Lưu ý: Quản trị viên và Quản lý vận hành có quyền thay đổi trạng thái theo quy trình máy in 3D.
              </div>
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
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateShipping}>
          <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true },
              { pattern: /^[0-9+()\-\s]{8,20}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="shippingAddress" label="Địa chỉ" rules={[{ required: true }]}>
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
