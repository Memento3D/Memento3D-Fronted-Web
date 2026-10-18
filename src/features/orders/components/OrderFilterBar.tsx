import { Input, Radio } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { OrderStatus } from '../types/order.types';
import { ORDER_STATUS_CONFIG } from '../utils/orderFormatters';

interface OrderFilterBarProps {
  statusFilter?: OrderStatus | 'ALL';
  onStatusChange: (status: OrderStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  statusFilter = 'ALL',
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  const filterOptions: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'Tất cả', value: 'ALL' },
    { label: ORDER_STATUS_CONFIG.PENDING_PAYMENT.label, value: 'PENDING_PAYMENT' },
    { label: ORDER_STATUS_CONFIG.CONFIRMED.label, value: 'CONFIRMED' },
    { label: ORDER_STATUS_CONFIG.PRINTING.label, value: 'PRINTING' },
    { label: ORDER_STATUS_CONFIG.SHIPPED.label, value: 'SHIPPED' },
    { label: ORDER_STATUS_CONFIG.DELIVERED.label, value: 'DELIVERED' },
    { label: ORDER_STATUS_CONFIG.CANCELLED.label, value: 'CANCELLED' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <Radio.Group
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        buttonStyle="solid"
        size="middle"
      >
        {filterOptions.map((opt) => (
          <Radio.Button key={opt.value} value={opt.value}>
            {opt.label}
          </Radio.Button>
        ))}
      </Radio.Group>

      <Input
        placeholder="Tìm theo Mã đơn / Người nhận..."
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        style={{
          maxWidth: 320,
          background: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          color: '#f8fafc',
          borderRadius: 8,
        }}
      />
    </div>
  );
};
