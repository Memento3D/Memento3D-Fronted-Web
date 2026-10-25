import React, { useRef, useState, useMemo } from 'react';
import { Tooltip } from 'antd';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  deltaPct?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  sparkline?: number[];
  colorTheme?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'peach' | 'mint';
  tooltipText?: string;
  isRealTimeUpdated?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  deltaPct,
  deltaLabel = 'so với kỳ trước',
  icon,
  sparkline = [10, 15, 12, 18, 24, 20, 28],
  colorTheme = 'purple',
  tooltipText,
  isRealTimeUpdated = false,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const colors = useMemo(() => {
    switch (colorTheme) {
      case 'amber':
      case 'peach':
        return {
          glow: 'rgba(255, 191, 174, 0.35)',
          borderHover: '#FFBFAE',
          iconBg: 'var(--secondary-container, #FFE5DF)',
          iconColor: '#7A3E2D',
          sparkColor: '#E2765A',
        };
      case 'emerald':
      case 'mint':
        return {
          glow: 'rgba(201, 232, 213, 0.4)',
          borderHover: '#A5D7B7',
          iconBg: 'var(--success-bg, #C9E8D5)',
          iconColor: '#466253',
          sparkColor: '#466253',
        };
      case 'rose':
        return {
          glow: 'rgba(186, 26, 26, 0.25)',
          borderHover: '#FFB4AB',
          iconBg: 'var(--danger-bg, #FFDAD6)',
          iconColor: '#BA1A1A',
          sparkColor: '#BA1A1A',
        };
      case 'cyan':
      case 'indigo':
        return {
          glow: 'rgba(95, 58, 221, 0.25)',
          borderHover: '#DDD6F7',
          iconBg: 'var(--info-bg, #ECE3FF)',
          iconColor: '#5F3ADD',
          sparkColor: '#5F3ADD',
        };
      case 'purple':
      default:
        return {
          glow: 'var(--primary-glow)',
          borderHover: 'rgba(124, 92, 252, 0.45)',
          iconBg: 'var(--surface-container, #F1EBFF)',
          iconColor: 'var(--primary, #7C5CFC)',
          sparkColor: 'var(--primary, #7C5CFC)',
        };
    }
  }, [colorTheme]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Generate lightweight SVG path for Sparkline
  const sparklineSvgPath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return '';
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = sparkline.map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  }, [sparkline]);

  const hasDelta = deltaPct !== undefined && !isNaN(deltaPct);
  const isPositiveDelta = hasDelta && (deltaPct as number) > 0;
  const isNeutralDelta = hasDelta && (deltaPct as number) === 0;

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        height: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: 'var(--radius-card, 10px)',
          border: `1px solid ${isHovered ? colors.borderHover : 'var(--border-color, #E2D9F7)'}`,
          boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          padding: '18px 20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Card Header (Title & Icon) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isRealTimeUpdated && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--tertiary, #466253)',
                  display: 'inline-block',
                }}
                title="Cập nhật trực tiếp thời gian thực"
              />
            )}
            <Tooltip title={tooltipText}>
              <span
                style={{
                  color: 'var(--text-secondary, #6A6282)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {title}
              </span>
            </Tooltip>
          </div>

          <div
            style={{
              background: colors.iconBg,
              color: colors.iconColor,
              padding: '8px',
              borderRadius: 'var(--radius-sm, 6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Card Main Value & Sparkline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '6px 0 10px' }}>
          <div
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #28243D)',
              lineHeight: 1.15,
            }}
          >
            {value}
          </div>

          {/* Mini Sparkline Chart */}
          {sparklineSvgPath && (
            <svg width="76" height="24" style={{ overflow: 'visible', opacity: 0.9 }}>
              <path
                d={sparklineSvgPath}
                fill="none"
                stroke={colors.sparkColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Card Footer (Delta Comparison) */}
        {hasDelta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontWeight: 600,
                color: isNeutralDelta
                  ? 'var(--text-secondary)'
                  : isPositiveDelta
                  ? 'var(--text-on-success, #1E3B2C)'
                  : 'var(--text-on-danger, #93000A)',
                background: isNeutralDelta
                  ? 'var(--surface-container)'
                  : isPositiveDelta
                  ? 'var(--success-bg, #C9E8D5)'
                  : 'var(--danger-bg, #FFDAD6)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm, 4px)',
                border: isNeutralDelta
                  ? '1px solid var(--border-color)'
                  : isPositiveDelta
                  ? '1px solid var(--success-border)'
                  : '1px solid var(--danger-border)',
                fontSize: '0.7rem',
              }}
            >
              {isNeutralDelta ? (
                <Minus size={11} />
              ) : isPositiveDelta ? (
                <ArrowUpRight size={11} />
              ) : (
                <ArrowDownRight size={11} />
              )}
              {isPositiveDelta ? '+' : ''}
              {deltaPct}%
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.725rem' }}>{deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
