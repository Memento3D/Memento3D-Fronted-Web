import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerEntryRoute, isCustomerRole } from '../../auth/utils/postLoginDestination';
import { cartApi } from '../api/cartApi';
import type { Cart, AddToCartRequest } from '../types/cart.types';
import { useAuth } from '../../auth/hooks/useAuth';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (payload: AddToCartRequest, returnTo?: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canUseCart = isAuthenticated && isCustomerRole(user?.role);
  const ownerId = canUseCart ? user?.id : undefined;
  const [cartState, setCartState] = useState<{ ownerId: string; cart: Cart } | null>(null);
  // Never expose the previous account's cart after logout, expiry, or account switching.
  const cart = canUseCart && cartState?.ownerId === ownerId ? cartState?.cart || null : null;

  const requireCustomer = (returnTo?: string): boolean => {
    if (canUseCart) return true;
    navigate(getCustomerEntryRoute(isAuthenticated ? user?.role : null,
      returnTo || `${location.pathname}${location.search}`));
    return false;
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!canUseCart || !ownerId) {
      setCartState(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartApi.getCart();
      setCartState({ ownerId, cart: data });
    } catch {
      // User may not be logged in or cart empty
    } finally {
      setIsLoading(false);
    }
  }, [canUseCart, ownerId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (payload: AddToCartRequest, returnTo?: string): Promise<boolean> => {
    if (!requireCustomer(returnTo)) return false;
    try {
      await cartApi.addItem(payload);
      await refreshCart();
      message.success('Đã thêm sản phẩm vào giỏ hàng');
      return true;
    } catch {
      message.error('Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!requireCustomer()) return;
    try {
      await cartApi.updateQuantity(itemId, { quantity });
      await refreshCart();
    } catch {
      message.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!requireCustomer()) return;
    try {
      await cartApi.removeItem(itemId);
      await refreshCart();
      message.info('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch {
      message.error('Không thể xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    if (!requireCustomer()) return;
    try {
      await cartApi.clearCart();
      await refreshCart();
    } catch {
      message.error('Không thể làm trống giỏ hàng');
    }
  };

  const cartCount = cart ? cart.totalItems : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
