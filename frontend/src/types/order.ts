import type { Product } from "./product";
import type { User } from "./auth";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderPayload {
  status: string,
  order_id: number;
}


export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_price: number;
  shipping_address: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  shipping_phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user: User;
}

export interface OrderPagination {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  pagination: OrderPagination;
  loading: boolean;
  error: string | null;
}