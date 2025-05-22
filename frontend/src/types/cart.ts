import type { Product } from "./product.ts";

export interface CartItem {
  id: number;
  product_id: number;
  user_id: number;
  product: Product;
  quantity: number;
  subtotal?: number;
}

export interface CartPayload {
  product_id: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}