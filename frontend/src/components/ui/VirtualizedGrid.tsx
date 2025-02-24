import React, { useRef, useState, useLayoutEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  minItemWidth: number;
  width?: string | number;
  itemHeight: number;
  gap?: number;
  containerHeight?: number | string;
  overscan?: number;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  minItemWidth,
  width,
  itemHeight,
  gap = 16,
  containerHeight = '80vh',
  overscan = 5,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const recalc = () => {
      if (parentRef.current) {
        setContainerWidth(parentRef.current.getBoundingClientRect().width);
      }
    };
    recalc();
    const resizeObserver = new ResizeObserver(() => recalc());
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const columnCount = Math.max(Math.floor((containerWidth + gap) / (minItemWidth + gap)), 1);
  const actualItemWidth =
    columnCount === 1
      ? containerWidth - gap * 2
      : (containerWidth - gap * (columnCount + 1)) / columnCount;
  const rowCount = Math.ceil(items.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
  });

  const totalHeight = gap + rowCount * (itemHeight + gap);

  return (
    <div
      ref={parentRef}
      style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const rowIndex = virtualRow.index;
          const startIndex = rowIndex * columnCount;
          const rowItems = items.slice(startIndex, startIndex + columnCount);
          return rowItems.map((item, idx) => {
            const cellIndex = startIndex + idx;
            const colIndex = idx;
            const top = virtualRow.start + gap;
            const left = gap + colIndex * (actualItemWidth + gap);
            return (
              <div
                key={cellIndex}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  width: width || actualItemWidth,
                  height: itemHeight,
                }}
              >
                {renderItem(item, cellIndex)}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
