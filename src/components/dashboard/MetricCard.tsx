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
  colorTheme?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';
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
  colorTheme = 'cyan',
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
      case 'purple':
        return {
          glow: 'rgba(139, 92, 246, 0.35)',
          borderHover: 'rgba(139, 92, 246, 0.45)',
          iconBg: 'rgba(139, 92, 246, 0.12)',
          iconColor: '#a855f7',
          sparkColor: '#8b5cf6',
        };
      case 'emerald':
        return {
          glow: 'rgba(16, 185, 129, 0.35)',
          borderHover: 'rgba(16, 185, 129, 0.45)',
          iconBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#10b981',
          sparkColor: '#10b981',
        };
      case 'amber':
        return {
          glow: 'rgba(245, 158, 11, 0.35)',
          borderHover: 'rgba(245, 158, 11, 0.45)',
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: '#fbbf24',
          sparkColor: '#f59e0b',
        };
      case 'rose':
        return {
          glow: 'rgba(239, 68, 68, 0.35)',
          borderHover: 'rgba(239, 68, 68, 0.45)',
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconColor: '#f43f5e',
          sparkColor: '#f43f5e',
        };
      case 'indigo':
        return {
          glow: 'rgba(99, 102, 241, 0.35)',
          borderHover: 'rgba(99, 102, 241, 0.45)',
          iconBg: 'rgba(99, 102, 241, 0.12)',
          iconColor: '#6366f1',
          sparkColor: '#6366f1',
        };
      case 'cyan':
      default:
        return {
          glow: 'rgba(14, 165, 233, 0.35)',
          borderHover: 'rgba(56, 189, 248, 0.45)',
          iconBg: 'rgba(14, 165, 233, 0.12)',
          iconColor: '#38bdf8',
          sparkColor: '#0ea5e9',
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

    // Maximum 3.2 degrees rotation
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -3.2;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 3.2;

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
          background: 'linear-gradient(145deg, rgba(18, 25, 41, 0.95) 0%, rgba(13, 18, 31, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          border: `1px solid ${isHovered ? colors.borderHover : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: isHovered
            ? `0 14px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${colors.glow}`
            : '0 4px 16px rgba(0, 0, 0, 0.35)',
          padding: '20px 22px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${isHovered ? '8px' : '0px'})`,
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
              background: `radial-gradient(circle 180px at ${tilt.px}% ${tilt.py}%, rgba(255, 255, 255, 0.08), transparent 80%)`,
              borderRadius: 14,
            }}
          />
        )}

        {/* Card Header (Title & Icon) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isRealTimeUpdated && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block',
                }}
                title="Cập nhật trực tiếp thời gian thực"
              />
            )}
            <Tooltip title={tooltipText}>
              <span
                style={{
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${colors.glow}`,
            }}
          >
            {icon}
          </div>
        </div>

        {/* Card Main Value & Sparkline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '8px 0 12px' }}>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>

          {/* Mini Sparkline Chart */}
          {sparklineSvgPath && (
            <svg width="80" height="28" style={{ overflow: 'visible', opacity: 0.85 }}>
              <path
                d={sparklineSvgPath}
                fill="none"
                stroke={colors.sparkColor}
                strokeWidth="2.2"
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
                fontWeight: 700,
                color: isNeutralDelta ? '#94a3b8' : isPositiveDelta ? '#10b981' : '#f43f5e',
                background: isNeutralDelta
                  ? 'rgba(148, 163, 184, 0.1)'
                  : isPositiveDelta
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
                padding: '2px 6px',
                borderRadius: 6,
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
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
