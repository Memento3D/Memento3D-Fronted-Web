import React, { useCallback, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Button,
  Select,
  Tag,
  Card,
  Drawer,
  Descriptions,
  Divider,
} from 'antd';
import {
  RefreshCw,
  Eye,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { getStatusLabel } from '../../../locales/i18n';
import dayjs from 'dayjs';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

export const AdminOrdersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { sorting, pagination, setSorting, setPagination, resetPage, params } = useServerTableState();

  // Stable identity: SearchBox re-arms its debounce when onChange changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch((prev) => {
        if (prev !== value) resetPage();
        return value;
      });
    },
    [resetPage],
  );

  const ordersFilters = {
    ...params,
    search: search.trim() || undefined,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
  };

  const { data: ordersPage, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.orders(ordersFilters),
    queryFn: ({ signal }) => adminApi.getOrders(ordersFilters, signal),
    placeholderData: keepPreviousData,
  });

  const getOrderStatusTag = (status: string) => {
    let color = 'default';
    if (status === 'COMPLETED' || status === 'DELIVERED') color = 'success';
    else if (status === 'PROCESSING' || status === 'CONFIRMED') color = 'processing';
    else if (status === 'PRINTING') color = 'purple';
    else if (status === 'SHIPPED') color = 'cyan';
    else if (status === 'CANCELLED') color = 'error';
    else if (status === 'PENDING_PAYMENT') color = 'warning';
    return <Tag color={color}>{getStatusLabel(status)}</Tag>;
  };

  const legacyColumns: LegacyColumn<any>[] = [
    {
      title: 'Mã đơn hàng',
      // Sorts server-side by createdAt (the cell also shows the creation time)
      key: 'createdAt',
      sorter: true,
      render: (_: any, r: any) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {r.orderNumber || r.id?.substring(0, 8)}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, r: any) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {r.customerName || r.shippingName || 'Khách vãng lai'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {r.customerEmail || r.shippingPhone || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => getOrderStatusTag(st),
    },
    {
      title: 'Thanh toán',
      key: 'paymentStatus',
      render: (_: any, r: any) => {
        const isPaid = r.paymentStatus === 'PAID' || r.isPaid;
        return (
          <Tag color={isPaid ? 'green' : 'orange'}>
            {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: '#10b981' }}>
          {(val || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      hideable: false,
      render: (_: any, r: any) => (
        <Button
          size="small"
          icon={<Eye size={13} />}
          onClick={() => setSelectedOrder(r)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const { table } = useServerTable<any>({
    data: ordersPage?.content ?? [],
    columns: toServerColumns(legacyColumns),
    rowCount: ordersPage?.totalElements ?? 0,
    sorting,
    onSortingChange: setSorting,
    pagination,
    onPaginationChange: setPagination,
    getRowId: (o) => String(o.id),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-orders-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản trị Đơn hàng Toàn Nền tảng
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Giám sát trạng thái đơn hàng, đối soát thanh toán và luồng giao nhận
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ColumnVisibilityMenu table={table} />
          <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </div>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchBox
            placeholder="Tìm theo mã đơn, khách hàng hoặc số điện thoại..."
            value={search}
            onChange={handleSearchChange}
            debounceMs={350}
            width="100%"
            style={{ minWidth: 280, flex: 1 }}
          />

          <Select
            placeholder="Trạng thái đơn hàng"
            allowClear
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            style={{ width: 180 }}
          >
            <Select.Option value="PENDING_PAYMENT">Chờ thanh toán</Select.Option>
            <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
            <Select.Option value="PRINTING">Đang in 3D</Select.Option>
            <Select.Option value="SHIPPED">Đang giao hàng</Select.Option>
            <Select.Option value="COMPLETED">Hoàn tất</Select.Option>
            <Select.Option value="CANCELLED">Đã hủy</Select.Option>
          </Select>

          <Select
            placeholder="Trạng thái thanh toán"
            allowClear
            value={paymentStatusFilter}
            onChange={(v) => {
              setPaymentStatusFilter(v);
              resetPage();
            }}
            style={{ width: 170 }}
          >
            <Select.Option value="PAID">Đã thanh toán</Select.Option>
            <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
            <Select.Option value="FAILED">Thất bại</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <ServerDataTable<any>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
        />
      </Card>

      {/* Order Detail Drawer */}
      <Drawer
        title={`Chi tiết đơn hàng: #${selectedOrder?.orderNumber || selectedOrder?.id}`}
        placement="right"
        width={560}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã đơn hàng">
                <span style={{ fontWeight: 700 }}>{selectedOrder.orderNumber || selectedOrder.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customerName || selectedOrder.shippingName} ({selectedOrder.customerEmail || selectedOrder.shippingPhone})
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {selectedOrder.shippingAddress || 'Nhận tại xưởng'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                {getOrderStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {selectedOrder.paymentStatus || 'PENDING'} ({selectedOrder.paymentMethod || 'COD / Chuyển khoản'})
              </Descriptions.Item>
              <Descriptions.Item label="Tổng thanh toán">
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                  {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '8px 0' }} />
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Sản phẩm trong đơn</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.productName || item.name || `Sản phẩm #${idx + 1}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Số lượng: x{item.quantity} • Đơn giá: {(item.unitPrice || item.price || 0).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>
                      {((item.quantity || 1) * (item.unitPrice || item.price || 0)).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Không có chi tiết mặt hàng</div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOrdersPage;
