import React, { useState } from 'react';
import { Tag, Button } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  EyeOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import { useAuth } from '../../auth/hooks/useAuth';
import { getCustomerEntryRoute, isCustomerRole } from '../../auth/utils/postLoginDestination';
import { useCart } from '../../cart/context/CartContext';
import './productCard.css';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, e: React.MouseEvent) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  className = '',
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('memento3d-favorites') || '[]');
      return Array.isArray(favs) && favs.includes(product.id);
    } catch {
      return false;
    }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('memento3d-favorites') || '[]');
      let nextFavs: string[];
      if (favs.includes(product.id)) {
        nextFavs = favs.filter((id: string) => id !== product.id);
        setIsFavorite(false);
      } else {
        nextFavs = [...favs, product.id];
        setIsFavorite(true);
      }
      localStorage.setItem('memento3d-favorites', JSON.stringify(nextFavs));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug || product.id}`);
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustomerRole(user?.role)) {
      navigate(getCustomerEntryRoute(user?.role, `/products/${product.slug || product.id}`));
      return;
    }
    if (onAddToCart) {
      onAddToCart(product, e);
      return;
    }

    try {
      setIsAdding(true);
      const success = await addToCart({
        productId: product.id,
        quantity: 1,
      }, `/products/${product.slug || product.id}`);
      if (success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1800);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Determine badge
  const displayBadge =
    product.badge ||
    (product.featured
      ? 'Hot'
      : product.originalPrice && product.originalPrice > product.price
      ? 'Sale'
      : undefined);

  // Rating and review count defaults if not provided in backend
  const ratingValue = product.rating ?? 4.9;
  const reviewCount = product.reviewCount ?? 28;

  // Image source: thumbnailUrl, first image in images array, or placeholder
  const thumbnail =
    !imageError && (product.thumbnailUrl || (product.images && product.images[0]))
      ? product.thumbnailUrl || product.images[0]
      : null;

  return (
    <div
      className={`memento-product-card ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
    >
      {/* Thumbnail Container */}
      <div className="product-card-media">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="product-card-placeholder">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="placeholder-icon"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="placeholder-text">Memento 3D</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="product-card-badges">
          {displayBadge && (
            <span
              className={`product-badge ${
                displayBadge.toLowerCase() === 'sale'
                  ? 'badge-sale'
                  : displayBadge.toLowerCase() === 'hot'
                  ? 'badge-hot'
                  : 'badge-new'
              }`}
            >
              {displayBadge}
            </span>
          )}
          {product.category?.name && (
            <span className="product-category-chip">{product.category.name}</span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          className={`product-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          {isFavorite ? (
            <HeartFilled style={{ color: '#ef4444' }} />
          ) : (
            <HeartOutlined />
          )}
        </button>

        {/* Quick View Hover Pill */}
        <div className="product-quick-overlay">
          <span className="quick-view-text">
            <EyeOutlined style={{ marginRight: 6 }} /> Xem chi tiết
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="product-card-body">
        {/* Rating and Reviews */}
        <div className="product-rating-row">
          <div className="product-rating-stars">
            <StarFilled className="star-icon" />
            <span className="rating-score">{ratingValue.toFixed(1)}</span>
            <span className="review-count">({reviewCount})</span>
          </div>
          {product.availability === 'OUT_OF_STOCK' && (
            <Tag color="red" style={{ fontSize: '0.7rem', margin: 0 }}>
              Hết hàng
            </Tag>
          )}
        </div>

        {/* Product Title */}
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="product-card-desc">{product.shortDescription}</p>
        )}

        {/* Price & Add to Cart Row */}
        <div className="product-card-footer">
          <div className="product-price-block">
            <span className="product-price">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-original-price">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <Button
            type="primary"
            className={`product-add-btn ${justAdded ? 'btn-just-added' : ''}`}
            loading={isAdding}
            disabled={product.availability === 'OUT_OF_STOCK'}
            onClick={handleAddToCartClick}
            icon={justAdded ? <CheckOutlined /> : <ShoppingCartOutlined />}
          >
            {justAdded ? 'Đã thêm' : 'Thêm vào giỏ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
