import type { Category } from "./category";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categories: Category[];
  updated_at: string;
  created_at: string;
}

export interface ProductPayload {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: File[];
  category_ids?: number[];
}

export interface ProductFilterParams {
  category_ids?: number[];
  category_id?: number;
  category_slug?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  all?: boolean;
  page?: number;
}

export interface ProductsResponse {
  current_page: number;
  data: Product[];
  from: number;
  per_page: number;
  to: number;
  total: number
}