import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

export const CHART_COLORS = {
  primary: am5.color(0x0ea5e9),       // Cyan Neon #0ea5e9
  primaryLight: am5.color(0x38bdf8),  // Light Cyan #38bdf8
  accent: am5.color(0x8b5cf6),        // Violet Purple #8b5cf6
  accentLight: am5.color(0xa855f7),   // Light Purple #a855f7
  teal: am5.color(0x10b981),          // Emerald Teal #10b981
  amber: am5.color(0xf59e0b),         // Warning Amber #f59e0b
  rose: am5.color(0xf43f5e),          // Danger Rose #f43f5e
  indigo: am5.color(0x6366f1),        // Indigo #6366f1
  slate: am5.color(0x64748b),         // Slate Muted #64748b
  darkSurface: am5.color(0x0f172a),   // Deep Slate Surface
  border: am5.color(0x1e293b),        // Border Color
  gridLine: am5.color(0x334155),      // Grid line
  textMuted: am5.color(0x94a3b8),     // Text Muted
  textLight: am5.color(0xf8fafc),     // Text White
};

export const COLOR_PALETTE_HEX = [
  '#0ea5e9', // Primary Cyan
  '#8b5cf6', // Accent Purple
  '#10b981', // Emerald Teal
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
];

/**
 * Creates custom Memento3D high-tech Dark Theme rules for amCharts root
 */
export const applyMementoChartTheme = (root: am5.Root) => {
  root.setThemes([
    am5themes_Animated.new(root),
    am5themes_Dark.new(root),
  ]);

  // Set default color set to Memento3D palette
  const customColorSet = am5.ColorSet.new(root, {
    colors: [
      CHART_COLORS.primary,
      CHART_COLORS.accent,
      CHART_COLORS.teal,
      CHART_COLORS.amber,
      CHART_COLORS.rose,
      CHART_COLORS.indigo,
    ],
  });

  return customColorSet;
};
