import { apiClient } from '../../../services/apiClient';
import type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types/cart.types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await apiClient.get<Cart>('/cart');
    return res.data;
  },

  addItem: async (payload: AddToCartRequest): Promise<CartItem> => {
    const res = await apiClient.post<CartItem>('/cart/items', payload);
    return res.data;
  },

  updateQuantity: async (itemId: string, payload: UpdateCartItemRequest): Promise<CartItem> => {
    const res = await apiClient.patch<CartItem>(`/cart/items/${itemId}`, payload);
    return res.data;
  },

  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },
};
