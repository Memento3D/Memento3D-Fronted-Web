import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { cartApi } from '../api/cartApi';
import type { Cart, AddToCartRequest } from '../types/cart.types';
import { useAuth } from '../../auth/hooks/useAuth';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (payload: AddToCartRequest) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // User may not be logged in or cart empty
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (payload: AddToCartRequest): Promise<boolean> => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return false;
    }
    try {
      await cartApi.addItem(payload);
      await refreshCart();
      message.success('Đã thêm sản phẩm vào giỏ hàng');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartApi.updateQuantity(itemId, { quantity });
      await refreshCart();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId);
      await refreshCart();
      message.info('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await refreshCart();
    } catch (err: any) {
      message.error(err.message || 'Không thể làm trống giỏ hàng');
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
