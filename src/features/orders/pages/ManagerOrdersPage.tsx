import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Radio,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
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

  const { data, isLoading, refetch, isFetching } = useOrders({
    page,
    limit: pageSize,
  });

  // Real-time automatic updates on order/payment changes
  useEventSubscription('ORDER_STATUS_CHANGED', () => refetch());
  useEventSubscription('PAYMENT_STATUS_CHANGED', () => refetch());

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
    <div style={{ padding: '4px 0' }}>
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
          <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
            Quản lý Đơn hàng in 3D (Order Fulfillment)
          </Title>
          <Text style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Điều phối quy trình từ duyệt đơn, xác nhận thanh toán, xếp lịch in 3D và bàn giao giao nhận.
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            className="btn btn-secondary"
          >
            Làm mới dữ liệu
          </Button>
        </Space>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Radio.Group
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="ALL">Tất cả</Radio.Button>
          <Radio.Button value="PENDING_PAYMENT">Chờ thanh toán</Radio.Button>
          <Radio.Button value="CONFIRMED">Đã xác nhận</Radio.Button>
          <Radio.Button value="PRINTING">Đang in</Radio.Button>
          <Radio.Button value="SHIPPED">Đang giao</Radio.Button>
          <Radio.Button value="DELIVERED">Đã giao</Radio.Button>
          <Radio.Button value="CANCELLED">Đã hủy</Radio.Button>
        </Radio.Group>

        <Input
          placeholder="Tìm mã đơn, tên người nhận, SĐT..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* Table */}
      <Table
        dataSource={filteredOrders}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng số ${total} đơn hàng`,
        }}
        columns={[
          {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => (
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                #{id.slice(0, 8).toUpperCase()}
              </span>
            ),
          },
          {
            title: 'Người nhận / SĐT',
            key: 'recipient',
            render: (_, r: OrderResponse) => (
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.recipientName || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.phone || '—'}</div>
              </div>
            ),
          },
          {
            title: 'Địa chỉ giao hàng',
            dataIndex: 'shippingAddress',
            key: 'shippingAddress',
            ellipsis: true,
            render: (addr: string) => <span style={{ color: '#cbd5e1' }}>{addr || '—'}</span>,
          },
          {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (amt: number, r: OrderResponse) => (
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
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
            render: (d: string) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatOrderDate(d)}</span>,
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
                        background: 'rgba(139, 92, 246, 0.15)',
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        color: '#c084fc',
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
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      borderRadius: 6,
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />

      {/* Print Job Link Modal */}
      <OrderPrintJobLinkModal
        open={Boolean(printJobOrder)}
        order={printJobOrder}
        onClose={() => setPrintJobOrder(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
