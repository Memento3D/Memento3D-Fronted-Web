import React, { useState } from 'react';
import {
  Button,
  Pagination,
  Empty,
  Skeleton,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderStatusCounts } from '../../orders/hooks/useOrders';
import { useCancelOrder } from '../../orders/hooks/useCancelOrder';
import { OrderSummaryCard } from '../../orders/components/OrderSummaryCard';
import { OrderFilterBar } from '../../orders/components/OrderFilterBar';
import { OrderPaymentModal } from '../../orders/components/OrderPaymentModal';
import type { OrderResponse, OrderStatus } from '../../orders/types/order.types';
import { useEventSubscription } from '../../../shared/realtime';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [paymentOrder, setPaymentOrder] = useState<OrderResponse | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderResponse | null>(null);

  // Reset to page 1 whenever status filter or search query changes
  const handleStatusChange = (status: OrderStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Direct server-side filtered & paginated query
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders({
    page,
    limit: pageSize,
    status: statusFilter,
    search: searchQuery,
  });

  const { data: statusCounts } = useOrderStatusCounts();

  // Real-time automatic synchronization
  useEventSubscription('ORDER_STATUS_CHANGED', () => refetch());
  useEventSubscription('PAYMENT_STATUS_CHANGED', () => refetch());

  const cancelOrderMutation = useCancelOrder();

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      await cancelOrderMutation.mutateAsync(cancellingOrder.id);
      message.success('Đã hủy đơn hàng thành công');
      setCancellingOrder(null);
      refetch();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng');
    }
  };

  const orders = data?.orders || [];
  const totalCount = data?.total || 0;

  return (
    <div
      style={{
        padding: '0 0 32px 0',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 1. Header: Single unified title & description on left, action buttons on right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
                lineHeight: 1.25,
              }}
            >
              Đơn hàng của tôi
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
                maxWidth: 620,
              }}
            >
              Theo dõi đơn hàng, quá trình sản xuất và tiến độ giao nhận kỷ vật của bạn.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              style={{
                borderRadius: 8,
                height: 38,
                background: 'var(--surface-container)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products')}
              style={{
                borderRadius: 8,
                height: 38,
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                color: 'var(--text-on-primary)',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(124, 92, 252, 0.25)',
              }}
            >
              Đặt in kỷ vật mới
            </Button>
          </div>
        </div>

        {/* 2. Toolbar: Segmented Tabs & Search Bar */}
        <OrderFilterBar
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusCounts={statusCounts}
        />

        {/* Content State */}
        {isLoading ? (
          <div style={{ padding: '16px 0' }}>
            <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 20 }} />
            <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 20 }} />
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ) : isError ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 12,
            }}
          >
            <div style={{ color: 'var(--error)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
              Không thể tải danh sách đơn hàng
            </div>
            <div style={{ color: 'var(--text-on-danger)', marginBottom: 16 }}>
              {error?.message || 'Có lỗi xảy ra khi kết nối máy chủ.'}
            </div>
            <Button type="primary" onClick={() => refetch()} style={{ borderRadius: 8 }}>
              Thử lại
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Empty
              description={
                <span style={{ color: 'var(--text-secondary)' }}>
                  {statusFilter !== 'ALL' || searchQuery
                    ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc và tìm kiếm.'
                    : 'Bạn chưa có đơn hàng nào.'}
                </span>
              }
            >
              {statusFilter !== 'ALL' || searchQuery ? (
                <Button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearchQuery('');
                    setPage(1);
                  }}
                  style={{
                    borderRadius: 8,
                    marginTop: 12,
                    background: 'var(--surface-container)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/products')}
                  style={{
                    borderRadius: 8,
                    background: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    color: 'var(--text-on-primary)',
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  Tạo đơn hàng ngay
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderSummaryCard
                key={order.id}
                order={order}
                onPay={(ord) => setPaymentOrder(ord)}
                onCancel={(ord) => setCancellingOrder(ord)}
              />
            ))}

            {/* Server-side Pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(p) => setPage(p)}
                showTotal={(total) => `Tổng cộng ${total} đơn hàng`}
                showSizeChanger={false}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error)' }}>
            <ExclamationCircleOutlined />
            <span>Xác nhận hủy đơn hàng</span>
          </div>
        }
      >
        <p style={{ color: 'var(--text-primary)' }}>
          Bạn có chắc chắn muốn hủy đơn hàng #{cancellingOrder?.orderCode || cancellingOrder?.id.slice(0, 8).toUpperCase()} không?
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Lưu ý: Chỉ các đơn hàng đang ở trạng thái <strong>Chờ thanh toán</strong> mới được phép hủy trực tiếp.
        </p>
      </Modal>
    </div>
  );
};

