import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import type { OrderStatus } from '../types/order.types';
import { ORDER_STATUS_CONFIG } from '../utils/orderFormatters';

interface OrderFilterBarProps {
  statusFilter?: OrderStatus | 'ALL';
  onStatusChange: (status: OrderStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts?: Partial<Record<OrderStatus | 'ALL', number>>;
}

interface FilterOption {
  label: string;
  value: OrderStatus | 'ALL';
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  statusFilter = 'ALL',
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
}) => {
  // Local input state for zero-lag instant typing, debounced to parent
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQuery !== searchQuery) {
        onSearchChange(localQuery);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localQuery, searchQuery, onSearchChange]);

  const filterOptions: FilterOption[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: ORDER_STATUS_CONFIG.PENDING_PAYMENT.label, value: 'PENDING_PAYMENT' },
    { label: ORDER_STATUS_CONFIG.CONFIRMED.label, value: 'CONFIRMED' },
    { label: ORDER_STATUS_CONFIG.PRINTING.label, value: 'PRINTING' },
    { label: ORDER_STATUS_CONFIG.SHIPPED.label, value: 'SHIPPED' },
    { label: ORDER_STATUS_CONFIG.DELIVERED.label, value: 'DELIVERED' },
    { label: ORDER_STATUS_CONFIG.CANCELLED.label, value: 'CANCELLED' },
  ];

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
      }}
    >
      {/* Segmented Filter Chips Container */}
      <div className="order-filter-scroll-container">
        {filterOptions.map((opt) => {
          const isActive = statusFilter === opt.value;
          const count = statusCounts ? statusCounts[opt.value] : undefined;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`order-filter-chip ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
            >
              <span>{opt.label}</span>
              {typeof count === 'number' && (
                <span className="order-filter-badge">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar matching height & SaaS styling */}
      <div style={{ flex: '1 1 280px', maxWidth: 340, minWidth: 260 }}>
        <Input
          placeholder="Tìm mã đơn hoặc người nhận..."
          prefix={<SearchOutlined style={{ color: 'var(--text-muted)', fontSize: 15 }} />}
          suffix={
            localQuery ? (
              <CloseCircleFilled
                onClick={handleClear}
                style={{
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              />
            ) : null
          }
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          allowClear={false}
          className="order-search-input"
        />
      </div>
    </div>
  );
};

