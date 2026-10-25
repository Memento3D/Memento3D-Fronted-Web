import React from 'react';
import { Button } from './Button';
import { RotateCcw } from 'lucide-react';

export interface FilterBarProps {
  children?: React.ReactNode;
  searchComponent?: React.ReactNode;
  extraActions?: React.ReactNode;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  searchComponent,
  extraActions,
  onReset,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`filter-bar-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card, 10px)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: 260 }}>
        {searchComponent}
        {children}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw size={14} />}
            title="Đặt lại bộ lọc"
          >
            Đặt lại
          </Button>
        )}
      </div>

      {extraActions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {extraActions}
        </div>
      )}
    </div>
  );
};
