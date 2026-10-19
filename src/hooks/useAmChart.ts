import { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import { applyMementoChartTheme } from '../utils/chartTheme';

export interface UseAmChartOptions {
  /**
   * Optional dependencies to re-trigger chart initialization.
   * If omitted, chart only initializes on mount and disposes on unmount.
   */
  deps?: React.DependencyList;
}

/**
 * Reusable hook to handle amCharts 5 Root lifecycle in React.
 * Prevents memory leaks by strictly invoking root.dispose() upon unmount.
 */
export const useAmChart = <T extends HTMLElement = HTMLDivElement>(
  initChart: (root: am5.Root) => void | (() => void),
  deps: React.DependencyList = []
) => {
  const containerRef = useRef<T | null>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose old root if exists
    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    // Initialize Root
    const root = am5.Root.new(containerRef.current);
    rootRef.current = root;

    // Apply custom Memento3D Theme
    applyMementoChartTheme(root);

    // Optional: Hide amCharts watermark if licensed or in dark background
    if (root._logo) {
      root._logo.set('opacity', 0.25);
    }

    // Run user initialization
    const cleanup = initChart(root);

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, rootRef };
};
