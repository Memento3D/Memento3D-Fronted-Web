import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBoxProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value: controlledValue,
  defaultValue = '',
  placeholder = 'Tìm kiếm dữ liệu...',
  onChange,
  onSearch,
  debounceMs = 300,
  width = 280,
  className = '',
  style = {},
}) => {
  const [internalValue, setInternalValue] = useState<string>(controlledValue ?? defaultValue);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange]);

  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };

  return (
    <div
      className={`search-box-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width,
        maxWidth: '100%',
        ...style,
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--color-text-secondary)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '38px',
          paddingLeft: '36px',
          paddingRight: internalValue ? '32px' : '14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-input, var(--color-surface))',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          fontSize: '0.85rem',
          outline: 'none',
          transition: 'all var(--transition-fast)',
        }}
      />
      {internalValue && (
        <button
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
