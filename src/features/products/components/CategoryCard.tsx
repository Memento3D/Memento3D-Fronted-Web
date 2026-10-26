import React from 'react';
import {
  UserOutlined,
  KeyOutlined,
  ReadOutlined,
  HeartOutlined,
  SmileOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { ProductCategory } from '../types/product.types';
import './categoryCard.css';

export interface CategoryCardProps {
  category: ProductCategory;
  productCount?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Map slugs or names to curated icons
const getCategoryIcon = (category: ProductCategory): React.ReactNode => {
  const name = (category.name || '').toLowerCase();
  const slug = (category.slug || '').toLowerCase();

  if (name.includes('figure') || slug.includes('figure')) return <UserOutlined />;
  if (name.includes('keychain') || name.includes('móc khóa') || slug.includes('keychain')) return <KeyOutlined />;
  if (name.includes('tốt nghiệp') || name.includes('graduation') || slug.includes('grad')) return <ReadOutlined />;
  if (name.includes('cặp đôi') || name.includes('couple') || slug.includes('couple')) return <HeartOutlined />;
  if (name.includes('thú cưng') || name.includes('pet') || slug.includes('pet')) return <SmileOutlined />;
  if (name.includes('trang trí') || name.includes('decor') || slug.includes('decor')) return <AppstoreOutlined />;
  if (name.includes('phụ kiện') || name.includes('access') || slug.includes('access')) return <ThunderboltOutlined />;
  if (name.includes('tùy chỉnh') || name.includes('custom') || slug.includes('custom')) return <ExperimentOutlined />;
  return <InboxOutlined />;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  productCount,
  icon,
  onClick,
  className = '',
}) => {
  const displayIcon = icon || getCategoryIcon(category);

  return (
    <div
      className={`memento-category-card ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      <div className="category-card-glow" />

      {/* Visual Header / Icon */}
      <div className="category-icon-wrapper">
        {typeof displayIcon === 'string' ? (
          <span className="category-emoji">{displayIcon}</span>
        ) : (
          displayIcon
        )}
      </div>

      {/* Content */}
      <div className="category-card-body">
        <h4 className="category-name">{category.name}</h4>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </div>

      {/* Badge / Count */}
      <div className="category-card-footer">
        <span className="category-link-cta">
          {productCount !== undefined && productCount > 0
            ? `${productCount} sản phẩm`
            : 'Khám phá'}
        </span>
        <svg
          className="category-arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </div>
  );
};

export default CategoryCard;
