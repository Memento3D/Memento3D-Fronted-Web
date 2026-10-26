import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number | ((index: number) => number);
  height?: number | string;
  maxHeight?: number | string;
  overscan?: number;
  emptyPlaceholder?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * High-performance virtualized list powered by TanStack Virtual (@tanstack/react-virtual).
 * Renders only the visible subset of items in DOM, ensuring 60fps scrolling
 * even with thousands of items.
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 56,
  height,
  maxHeight = 380,
  overscan = 5,
  emptyPlaceholder,
  className,
  style,
  getItemKey,
}: VirtualListProps<T>): React.ReactElement {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan,
  });

  if (items.length === 0 && emptyPlaceholder) {
    return <div style={{ height, maxHeight, ...style }}>{emptyPlaceholder}</div>;
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height,
        maxHeight,
        overflowY: 'auto',
        contain: 'strict',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.key;

          return (
            <div
              key={key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
