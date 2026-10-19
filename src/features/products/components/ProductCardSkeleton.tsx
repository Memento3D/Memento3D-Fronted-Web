import React from 'react';
import './productSkeleton.css';

export interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="product-card-skeleton">
          <div className="skeleton-media">
            <div className="memento-skeleton-box" />
          </div>
          <div className="skeleton-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="memento-skeleton-box" style={{ width: '40%', height: 14 }} />
              <div className="memento-skeleton-box" style={{ width: '20%', height: 14 }} />
            </div>
            <div className="memento-skeleton-box" style={{ width: '85%', height: 18 }} />
            <div className="memento-skeleton-box" style={{ width: '60%', height: 14 }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                paddingTop: 8,
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div className="memento-skeleton-box" style={{ width: '35%', height: 20 }} />
              <div className="memento-skeleton-box" style={{ width: '40%', height: 32, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const CategorySkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="category-card-skeleton">
          <div className="memento-skeleton-box" style={{ width: 48, height: 48, borderRadius: 10 }} />
          <div className="memento-skeleton-box" style={{ width: '70%', height: 18 }} />
          <div className="memento-skeleton-box" style={{ width: '90%', height: 14 }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: 10,
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div className="memento-skeleton-box" style={{ width: '30%', height: 14 }} />
            <div className="memento-skeleton-box" style={{ width: 16, height: 16, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </>
  );
};

export const HomeSectionSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="memento-skeleton-box" style={{ width: 140, height: 24, borderRadius: 999 }} />
        <div className="memento-skeleton-box" style={{ width: 320, height: 32 }} />
        <div className="memento-skeleton-box" style={{ width: 480, height: 16 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        <ProductCardSkeleton count={4} />
      </div>
    </div>
  );
};
