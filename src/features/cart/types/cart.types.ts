export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  thumbnailUrl?: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customization?: Record<string, any>;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  customization?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
