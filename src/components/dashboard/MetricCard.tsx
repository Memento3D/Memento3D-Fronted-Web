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
  const [tilt, setTilt] = useState<{ rx: number; ry: number; px: number; py: number }>({
    rx: 0,
    ry: 0,
    px: 50,
    py: 50,
  });
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

  // 3D Tilt calculation (strictly limited to 2.5 - 3.5 degrees)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    // Maximum 3 degrees rotation
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -3;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 3;

    setTilt({ rx, ry, px, py });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

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
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        height: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #FFFFFF)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-card, 24px)',
          border: `1px solid ${isHovered ? colors.borderHover : 'var(--border-color, #E2D9F7)'}`,
          boxShadow: isHovered
            ? `var(--shadow-floating), 0 0 20px ${colors.glow}`
            : 'var(--shadow-card)',
          padding: '22px 24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${isHovered ? '6px' : '0px'})`,
          transition: isHovered ? 'transform 0.08s ease-out, box-shadow 0.2s ease' : 'transform 0.35s ease, box-shadow 0.35s ease',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Specular shine reflection gradient */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle 200px at ${tilt.px}% ${tilt.py}%, rgba(124, 92, 252, 0.06), transparent 80%)`,
              borderRadius: 'var(--radius-card, 24px)',
            }}
          />
        )}

        {/* Card Header (Title & Icon) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isRealTimeUpdated && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--tertiary, #466253)',
                  boxShadow: '0 0 8px var(--mint, #C9E8D5)',
                  display: 'inline-block',
                }}
                title="Cập nhật trực tiếp thời gian thực"
              />
            )}
            <Tooltip title={tooltipText}>
              <span
                style={{
                  color: 'var(--text-secondary, #6A6282)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
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
              padding: '10px',
              borderRadius: 'var(--radius-default, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Card Main Value & Sparkline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '8px 0 14px' }}>
          <div
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary, #28243D)',
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>

          {/* Mini Sparkline Chart */}
          {sparklineSvgPath && (
            <svg width="80" height="28" style={{ overflow: 'visible', opacity: 0.9 }}>
              <path
                d={sparklineSvgPath}
                fill="none"
                stroke={colors.sparkColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Card Footer (Delta Comparison) */}
        {hasDelta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.775rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontWeight: 700,
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
                padding: '3px 8px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: isNeutralDelta
                  ? '1px solid var(--border-color)'
                  : isPositiveDelta
                  ? '1px solid var(--success-border)'
                  : '1px solid var(--danger-border)',
              }}
            >
              {isNeutralDelta ? (
                <Minus size={12} />
              ) : isPositiveDelta ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {isPositiveDelta ? '+' : ''}
              {deltaPct}%
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
