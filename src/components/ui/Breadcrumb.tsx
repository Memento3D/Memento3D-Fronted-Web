import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: React.ReactNode;
  path?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homePath?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  homePath = '/',
  className = '',
  style = {},
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`atelier-breadcrumb ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {showHome && (
        <>
          <Link
            to={homePath}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
            title="Trang chủ"
          >
            <Home size={14} />
          </Link>
          {items.length > 0 && <ChevronRight size={12} color="var(--color-border)" />}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {item.path && !isLast ? (
              <Link
                to={item.path}
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  transition: 'color var(--transition-fast)',
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isLast ? 600 : 500,
                }}
              >
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight size={12} color="var(--color-border)" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
