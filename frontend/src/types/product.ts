export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category_ids: number[];
}

export interface CreateProductPayload {
  name: string;
  description: string | null;
  price: number;
  images: File[];
  category_ids?: number[];
}

export interface UpdateProductPayload {
  name: string;
  description: string | null;
  price: number;
  images: File[];
  category_ids?: number[];
}

export interface CreateProductResponse {
  message: string;
  product: Product;
}

export interface UpdateProductResponse {
  message: string;
  product: Product;
}
