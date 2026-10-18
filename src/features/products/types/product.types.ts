export type ProductAvailability = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  thumbnailUrl?: string;
  images: string[];
  category?: ProductCategory;
  active: boolean;
  featured: boolean;
  availability: ProductAvailability;
  stock?: number;
  customizationOptions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'priceAsc' | 'priceDesc' | 'popular';
  featured?: boolean;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  thumbnailUrl?: string;
  images?: string[];
  categoryId: string;
  featured?: boolean;
  availability?: ProductAvailability;
  customizationOptions?: Record<string, any>;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  thumbnailUrl?: string;
  images?: string[];
  categoryId?: string;
  active?: boolean;
  featured?: boolean;
  availability?: ProductAvailability;
  customizationOptions?: Record<string, any>;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  displayOrder?: number;
}
