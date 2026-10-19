import React, { useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { SearchOutlined, CloseCircleFilled, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../products/api/productApi';
import type { Product } from '../../products/types/product.types';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import './homeSearchBar.css';

const QUICK_CHIPS = [
  { label: 'Tất cả', query: '' },
  { label: 'Figure', query: 'figure' },
  { label: 'Keychain', query: 'keychain' },
  { label: 'Quà tốt nghiệp', query: 'tốt nghiệp' },
  { label: 'Couple', query: 'couple' },
  { label: 'Pet', query: 'pet' },
  { label: 'Decoration', query: 'decor' },
];

export const HomeSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChip, setActiveChip] = useState<string>('Tất cả');

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced live search autocomplete
  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Cancel in-flight request if user keeps typing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.list({
          keyword: trimmed,
          size: 6,
        });
        const content = Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res)
          ? res
          : [];
        setSuggestions(content);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [keyword]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    const trimmed = keyword.trim();
    if (trimmed) {
      navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setIsOpen(false);
    navigate(`/products/${product.slug || product.id}`);
  };

  const handleChipClick = (chip: { label: string; query: string }) => {
    setActiveChip(chip.label);
    if (!chip.query) {
      navigate('/products');
    } else {
      navigate(`/products?keyword=${encodeURIComponent(chip.query)}`);
    }
  };

  return (
    <section className="home-search-section" id="search-section">
      <div className="home-container">
        <div className="search-bar-wrapper" ref={containerRef}>
          {/* Main Search Input Form */}
          <form className="search-input-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-inner">
              <SearchOutlined className="search-icon-leading" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Tìm mô hình, quà tặng, figure, keychain, phụ kiện..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0 || keyword.trim().length > 0) {
                    setIsOpen(true);
                  }
                }}
              />

              {keyword && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setKeyword('');
                    setSuggestions([]);
                    setIsOpen(false);
                  }}
                  aria-label="Xóa từ khóa"
                >
                  <CloseCircleFilled />
                </button>
              )}

              {isLoading && (
                <div className="search-spinner">
                  <Spin size="small" />
                </div>
              )}

              <button type="submit" className="search-submit-btn">
                <span>Tìm kiếm</span>
                <ArrowRightOutlined className="submit-icon" />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && keyword.trim().length > 0 && (
            <div className="search-dropdown-menu">
              {isLoading && suggestions.length === 0 ? (
                <div className="search-dropdown-loading">
                  <Spin size="small" />
                  <span>Đang tìm kiếm gợi ý...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="search-suggestions-list">
                  <div className="search-dropdown-header">
                    <span>Gợi ý sản phẩm ({suggestions.length})</span>
                  </div>
                  {suggestions.map((item) => {
                    const thumb =
                      item.thumbnailUrl || (item.images && item.images[0]) || '';
                    return (
                      <div
                        key={item.id}
                        className="search-suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <div className="suggestion-thumb-box">
                          {thumb ? (
                            <img src={thumb} alt={item.name} className="suggestion-thumb" />
                          ) : (
                            <div className="suggestion-thumb-placeholder">3D</div>
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-title">{item.name}</span>
                          <span className="suggestion-cat">
                            {item.category?.name || 'Mô hình 3D'}
                          </span>
                        </div>
                        <div className="suggestion-price">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    );
                  })}
                  <div className="search-dropdown-footer" onClick={() => handleSearchSubmit()}>
                    <span>Xem tất cả kết quả cho &quot;{keyword}&quot;</span>
                    <ArrowRightOutlined style={{ fontSize: 12 }} />
                  </div>
                </div>
              ) : (
                <div className="search-dropdown-empty">
                  <span>Không tìm thấy sản phẩm nào khớp với &quot;{keyword}&quot;</span>
                </div>
              )}
            </div>
          )}

          {/* Filter Quick Chips */}
          <div className="search-quick-chips">
            <span className="chips-label">Gợi ý nhanh:</span>
            <div className="chips-scroller">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`search-chip-btn ${activeChip === chip.label ? 'active' : ''}`}
                  onClick={() => handleChipClick(chip)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSearchBar;
