/**
 * Utilities for formatting numbers, currency, dates, and units across Dashboard & amCharts
 */

export const formatVndCurrency = (amount: number): string => {
  if (isNaN(amount)) return '₫0';
  if (amount >= 1_000_000_000) {
    return `₫${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `₫${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₫${(amount / 1_000).toFixed(0)}K`;
  }
  return `₫${Math.round(amount).toLocaleString('vi-VN')}`;
};

export const formatVndFull = (amount: number): string => {
  if (isNaN(amount)) return '0 ₫';
  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
};

export const formatCompactNumber = (val: number): string => {
  if (isNaN(val)) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toLocaleString('vi-VN');
};

export const formatGrams = (grams: number): string => {
  if (isNaN(grams)) return '0g';
  if (grams >= 1_000) {
    return `${(grams / 1_000).toFixed(2)} kg`;
  }
  return `${Math.round(grams)} g`;
};

export const formatDateShort = (ts: number | string | Date): string => {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const formatTimeShort = (ts: number | string | Date): string => {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export const formatPercent = (val: number): string => {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(1)}%`;
};
