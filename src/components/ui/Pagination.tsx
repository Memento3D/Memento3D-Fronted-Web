import React from 'react';
import { Pagination as AntdPagination } from 'antd';
import type { PaginationProps as AntdPaginationProps } from 'antd';

export interface PaginationProps extends AntdPaginationProps {
  showTotalText?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  current = 1,
  pageSize = 10,
  total = 0,
  showTotalText = true,
  className = '',
  style = {},
  ...rest
}) => {
  return (
    <div
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '20px',
        paddingTop: '12px',
        ...style,
      }}
    >
      {showTotalText && (
        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Hiển thị{' '}
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {total === 0 ? 0 : (current - 1) * pageSize + 1}
          </span>
          –
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {Math.min(current * pageSize, total)}
          </span>{' '}
          trên tổng số{' '}
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{total}</span> mục
        </div>
      )}

      <AntdPagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        pageSizeOptions={['10', '20', '50', '100']}
        {...rest}
      />
    </div>
  );
};
