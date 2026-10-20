import React, { useState } from 'react';
import {
  Typography,
  Button,
  Pagination,
  Empty,
  Skeleton,
  Modal,
  message,
  Space,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../orders/hooks/useOrders';
import { useCancelOrder } from '../../orders/hooks/useCancelOrder';
import { OrderSummaryCard } from '../../orders/components/OrderSummaryCard';
import { OrderFilterBar } from '../../orders/components/OrderFilterBar';
import { OrderPaymentModal } from '../../orders/components/OrderPaymentModal';
import { PageHeader } from '../../../components/ui/PageHeader';
import type { OrderResponse, OrderStatus } from '../../orders/types/order.types';

const { Title, Text } = Typography;

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [paymentOrder, setPaymentOrder] = useState<OrderResponse | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderResponse | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useOrders({
    page,
    limit: pageSize,
  });

  const cancelOrderMutation = useCancelOrder();

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      await cancelOrderMutation.mutateAsync(cancellingOrder.id);
      message.success('Đã hủy đơn hàng thành công');
      setCancellingOrder(null);
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

  // Filter orders based on status and search query
  const rawOrders = data?.orders || [];
  const filteredOrders = rawOrders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      order.recipientName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      order.phone?.includes(searchQuery.trim());
    return matchesStatus && matchesSearch;
  });

  const totalCount = data?.total || filteredOrders.length;

  return (
    <div
      style={{
        padding: '0 0 32px 0',
        color: 'var(--color-text-primary)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <PageHeader
          title="Đơn hàng của tôi"
          description="Theo dõi toàn bộ trạng thái sản xuất, in 3D và tiến độ giao nhận kỷ vật của bạn."
          extra={
            <Space wrap>
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                onClick={() => refetch()}
                style={{ borderRadius: '9999px' }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/products')}
                style={{
                  borderRadius: '9999px',
                  background: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                Đặt in kỷ vật mới
              </Button>
            </Space>
          }
        />

        {/* Page Title & Intro */}
        <div style={{ marginBottom: 28 }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
            Đơn hàng in 3D của tôi
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Theo dõi tiến trình từ tạo đơn, thanh toán MoMo/ZaloPay, xếp lệnh in đến giao nhận tận nơi.
          </Text>
        </div>

        {/* Filter and Search Bar */}
        <OrderFilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content State */}
        {isLoading ? (
          <div style={{ padding: '24px 0' }}>
            <Skeleton active paragraph={{ rows: 4 }} style={{ marginBottom: 24 }} />
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : isError ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 14,
            }}
          >
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
              Không thể tải danh sách đơn hàng
            </div>
            <div style={{ color: '#94a3b8', marginBottom: 16 }}>
              {error?.message || 'Có lỗi xảy ra khi kết nối máy chủ.'}
            </div>
            <Button type="primary" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
            }}
          >
            <Empty
              description={
                <span style={{ color: '#94a3b8' }}>
                  {statusFilter !== 'ALL' || searchQuery
                    ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc.'
                    : 'Bạn chưa có đơn hàng in 3D nào.'}
                </span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/checkout')}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  borderColor: 'transparent',
                  fontWeight: 600,
                  marginTop: 12,
                }}
              >
                Tạo đơn hàng ngay
              </Button>
            </Empty>
          </div>
        ) : (
          <div>
            {filteredOrders.map((order) => (
              <OrderSummaryCard
                key={order.id}
                order={order}
                onPay={(ord) => setPaymentOrder(ord)}
                onCancel={(ord) => setCancellingOrder(ord)}
              />
            ))}

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(p) => setPage(p)}
                showTotal={(total) => `Tổng cộng ${total} đơn hàng`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <OrderPaymentModal
        open={Boolean(paymentOrder)}
        order={paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onPaymentSuccess={() => refetch()}
      />

      {/* Cancel Order Confirm Modal */}
      <Modal
        open={Boolean(cancellingOrder)}
        onCancel={() => setCancellingOrder(null)}
        onOk={handleConfirmCancel}
        okText="Xác nhận hủy"
        cancelText="Giữ lại"
        okButtonProps={{ danger: true, loading: cancelOrderMutation.isPending }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
            <ExclamationCircleOutlined />
            <span>Xác nhận hủy đơn hàng</span>
          </div>
        }
      >
        <p style={{ color: '#cbd5e1' }}>
          Bạn có chắc chắn muốn hủy đơn hàng #{cancellingOrder?.id.slice(0, 8).toUpperCase()} không?
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Lưu ý: Chỉ các đơn hàng đang ở trạng thái <strong>Chờ thanh toán</strong> mới được phép hủy trực tiếp.
        </p>
      </Modal>
    </div>
  );
};
