import { ReadState } from '../../../components/ui/ReadState';
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrders, useManagerOrderStatusCounts } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderFilterBar } from '../components/OrderFilterBar';
import { OrderPrintJobLinkModal } from '../components/OrderPrintJobLinkModal';
import { formatCurrency, formatOrderDate } from '../utils/orderFormatters';
import type { OrderResponse, OrderStatus } from '../types/order.types';
import { useEventSubscription } from '../../../shared/realtime';

const { Title, Text } = Typography;

export const ManagerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [printJobOrder, setPrintJobOrder] = useState<OrderResponse | null>(null);

  const handleStatusChange = (status: OrderStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const { data, isLoading, isError, refetch, isFetching } = useOrders({
    page,
    limit: pageSize,
    status: statusFilter,
    search: searchQuery,
  });

  const { data: statusCounts } = useManagerOrderStatusCounts();

  // Real-time automatic updates on order/payment changes
  useEventSubscription('ORDER_STATUS_CHANGED', () => refetch());
  useEventSubscription('PAYMENT_STATUS_CHANGED', () => refetch());

  const orders = data?.orders || [];
  const totalCount = data?.total || 0;

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header bar */}
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
        <div>
          <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Quản lý Đơn hàng in 3D (Order Fulfillment)
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Điều phối quy trình từ duyệt đơn, xác nhận thanh toán, xếp lịch in 3D và bàn giao giao nhận.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            style={{
              borderRadius: 8,
              height: 38,
              background: 'var(--surface-container)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            Làm mới dữ liệu
          </Button>
        </Space>
      </div>

      {/* Modern Filter Chips & Debounced Search */}
      <OrderFilterBar
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusCounts={statusCounts}
      />

      {/* Table */}
      <ReadState isLoading={isLoading} isError={isError} isFetching={isFetching} onRetry={() => { void refetch(); }}>
      <Table
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng số ${total} đơn hàng`,
          showSizeChanger: false,
        }}
        columns={[
          {
            title: 'Mã đơn',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (code: string, r: OrderResponse) => (
              <span style={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                #{code || r.id.slice(0, 8).toUpperCase()}
              </span>
            ),
          },
          {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, r: OrderResponse) => {
              const firstItem = r.items && r.items.length > 0 ? r.items[0] : null;
              const title = r.representativeProductName || firstItem?.productName || 'Kỷ vật 3D';
              const thumb = r.representativeThumbnailUrl || firstItem?.thumbnailUrl;
              const count = r.itemCount || (r.items ? r.items.length : 1);

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <InboxOutlined style={{ color: '#7c5cfc' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary, #ffffff)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                      {title}
                    </div>
                    {count > 1 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                        Tổng {count} sản phẩm
                      </div>
                    )}
                  </div>
                </div>
              );
            },
          },
          {
            title: 'Người nhận / SĐT',
            key: 'recipient',
            render: (_, r: OrderResponse) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>{r.recipientName || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>{r.phone || '—'}</div>
              </div>
            ),
          },
          {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (amt: number, r: OrderResponse) => (
              <span style={{ fontWeight: 800, color: 'var(--primary, #7c5cfc)' }}>
                {formatCurrency(amt, r.currency)}
              </span>
            ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: OrderStatus) => <OrderStatusBadge status={status} />,
          },
          {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (d: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatOrderDate(d)}</span>,
          },
          {
            title: 'Hành động',
            key: 'actions',
            align: 'right',
            render: (_, r: OrderResponse) => {
              return (
                <Space>
                  {(r.status === 'CONFIRMED' || r.status === 'PRINTING') && (
                    <Button
                      size="small"
                      icon={<PrinterOutlined />}
                      onClick={() => setPrintJobOrder(r)}
                      style={{
                        background: 'var(--primary-subtle)',
                        borderColor: 'var(--primary-glow)',
                        color: 'var(--primary)',
                        borderRadius: 6,
                      }}
                      title="Lập lệnh in 3D"
                    >
                      Lệnh in
                    </Button>
                  )}

                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/manager/orders/${r.id}`)}
                    style={{
                      background: 'var(--surface-container)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      borderRadius: 6,
                    }}
                  >
                    Xem
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
      </ReadState>

      {/* Link Print Job Modal */}
      {printJobOrder && (
        <OrderPrintJobLinkModal
          open={Boolean(printJobOrder)}
          order={printJobOrder}
          onClose={() => setPrintJobOrder(null)}
          onSuccess={() => {
            setPrintJobOrder(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
