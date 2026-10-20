import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  extra?: React.ReactNode;
  tags?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  extra,
  tags,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`page-header-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '24px',
        ...style,
      }}
    >
      {breadcrumb && <div style={{ marginBottom: '4px' }}>{breadcrumb}</div>}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {title}
            </h1>
            {tags && <div>{tags}</div>}
          </div>

          {description && (
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
                lineHeight: 1.5,
                maxWidth: 720,
              }}
            >
              {description}
            </div>
          )}
        </div>

        {extra && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};
