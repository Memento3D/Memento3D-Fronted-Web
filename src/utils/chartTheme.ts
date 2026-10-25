import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

/**
 * Atelier Forge Chart Palette
 * Violet #7C5CFC, Peach #FFBFAE, Mint #C9E8D5, Lavender #ECE3FF, Deep Ink #28243D
 */
export const CHART_COLORS = {
  primary: am5.color(0x7C5CFC),       // Violet #7C5CFC
  primaryLight: am5.color(0x9B82FF),  // Soft Violet #9B82FF
  peach: am5.color(0xFFBFAE),         // Peach Accent #FFBFAE
  peachLight: am5.color(0xFFD3C7),    // Light Peach #FFD3C7
  mint: am5.color(0xC9E8D5),          // Mint Success #C9E8D5
  mintDark: am5.color(0x466253),      // Dark Mint #466253
  lavender: am5.color(0xECE3FF),      // Lavender #ECE3FF
  lavenderLight: am5.color(0xF3EEFF),  // Light Lavender #F3EEFF
  deepInk: am5.color(0x28243D),       // Deep Ink #28243D
  error: am5.color(0xBA1A1A),         // Semantic Error #BA1A1A
  errorContainer: am5.color(0xFFDAD6),// Error Container #FFDAD6

  // Canvas elements
  darkSurface: am5.color(0x1D192B),   // Dark Surface
  border: am5.color(0xE2D9F7),        // Border Color
  gridLine: am5.color(0xF1EBFF),      // Light Grid Line
  textMuted: am5.color(0x6A6282),     // Secondary Text
  textDark: am5.color(0x28243D),      // Deep Ink Text
  textLight: am5.color(0xF8F4FF),     // Light Text
};

export const COLOR_PALETTE_HEX = [
  '#7C5CFC', // Violet
  '#FFBFAE', // Peach
  '#C9E8D5', // Mint
  '#ECE3FF', // Lavender
  '#28243D', // Deep Ink
  '#5F3ADD', // Deep Violet
  '#5F7B6B', // Forest Mint
  '#FFA994', // Vivid Peach
];

/**
 * Creates custom Memento3D Atelier Forge Theme rules for amCharts root
 */
export const applyMementoChartTheme = (root: am5.Root, isDark = false) => {
  const themes: am5.Theme[] = [am5themes_Animated.new(root)];

  if (isDark) {
    themes.push(am5themes_Dark.new(root));
  }

  root.setThemes(themes);

  // Set default color set to Atelier Forge palette
  const customColorSet = am5.ColorSet.new(root, {
    colors: [
      CHART_COLORS.primary,
      CHART_COLORS.peach,
      CHART_COLORS.mint,
      CHART_COLORS.lavender,
      CHART_COLORS.deepInk,
      CHART_COLORS.primaryLight,
      CHART_COLORS.peachLight,
    ],
  });

  return customColorSet;
};

/**
 * Returns dynamic am5 Colors and Hex strings tailored to Light / Dark mode
 */
export const getChartThemeTokens = (isDark: boolean) => ({
  isDark,
  textColor: isDark ? am5.color(0xF8F4FF) : am5.color(0x28243D),
  textHex: isDark ? '#F8F4FF' : '#28243D',
  textSecondary: isDark ? am5.color(0xC9C0DD) : am5.color(0x6A6282),
  textSecondaryHex: isDark ? '#C9C0DD' : '#6A6282',
  textMuted: isDark ? am5.color(0x8E86A8) : am5.color(0x8E86A8),
  textMutedHex: isDark ? '#8E86A8' : '#8E86A8',
  gridColor: isDark ? am5.color(0xFFFFFF) : am5.color(0x7C5CFC),
  gridOpacity: isDark ? 0.08 : 0.08,
  surfaceBg: isDark ? am5.color(0x1D192B) : am5.color(0xFFFFFF),
  trackColor: isDark ? am5.color(0x252036) : am5.color(0xF1EBFF),
  borderColor: isDark ? am5.color(0x45405A) : am5.color(0xE2D9F7),
  sliceStroke: isDark ? am5.color(0x1D192B) : am5.color(0xFFFFFF),
});
