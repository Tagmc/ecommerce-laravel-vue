import type { Cart, CartItem, CartPayload } from "../../types/cart.ts";
import { addToCart, getCart, removeFromCart, updateCartItem, clearCart } from "../../apis/cart";

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  error: string | null;
}

interface Commit {
  (type: string, payload?: any): void;
}

const cart = {
  namespaced: true,
  state: (): CartState => ({
    items: [],
    total: 0,
    count: 0,
    loading: false,
    error: null
  }),
  mutations: {
    setCart(state: CartState, cart: Cart) {
      state.items = cart.items;
      state.total = cart.total;
      state.count = cart.count;
    },
    setLoading(state: CartState, loading: boolean) {
      state.loading = loading;
    },
    setError(state: CartState, error: string | null) {
      state.error = error;
    },
    addItem(state: CartState, cartItem: CartItem) {
      const existingItem = state.items.find(item => item.product_id === cartItem.product_id);
      
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
        existingItem.subtotal = existingItem.product.price * existingItem.quantity;
      } else {
        cartItem.subtotal = cartItem.product.price * cartItem.quantity;
        state.items.push(cartItem);
      }
      
      state.count += cartItem.quantity;
      state.total += cartItem.product.price * cartItem.quantity;
    },
    updateItem(state: CartState, { product_id, quantity } : CartPayload) {
      const item = state.items.find(item => item.product_id === product_id);
      
      if (item) {
        const oldQuantity = item.quantity;
        const priceDiff = item.product.price * (quantity - oldQuantity);
        
        item.quantity = quantity;
        item.subtotal = item.product.price * quantity;
        
        state.count += (quantity - oldQuantity);
        state.total += priceDiff;
      }
    },
    removeItem(state: CartState, productId: number) {
      const index = state.items.findIndex(item => item.product_id === productId);
      
      if (index !== -1) {
        const item = state.items[index];
        state.count -= item.quantity;
        state.total -= item.subtotal || 0;
        state.items.splice(index, 1);
      }
    },
    clearCart(state: CartState) {
      state.items = [];
      state.total = 0;
      state.count = 0;
    }
  },
  actions: {
    async fetchCart({ commit }: { commit: Commit }) {
      commit("setLoading", true);
      try {
        const response = await getCart();
        commit("setCart", response);
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể tải giỏ hàng";
        commit("setError", errorMessage);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    
    async addToCart({ commit }: { commit: Commit }, { product_id, quantity }: CartPayload) {
      commit("setLoading", true);
      try {
        const response = await addToCart(product_id, quantity);
        commit("addItem", response.item);
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể thêm vào giỏ hàng";
        commit("setError", errorMessage);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    
    async updateCartItem({ commit }: { commit: Commit }, { product_id, quantity }: CartPayload) {
      commit("setLoading", true);
      try {
        const response = await updateCartItem(product_id, quantity);
        commit("updateItem", { product_id, quantity });
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể cập nhật giỏ hàng";
        commit("setError", errorMessage);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    
    async removeFromCart({ commit }: { commit: Commit }, productId: number) {
      commit("setLoading", true);
      try {
        const response = await removeFromCart(productId);
        commit("removeItem", productId);
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể xóa sản phẩm khỏi giỏ hàng";
        commit("setError", errorMessage);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    
    async clearCart({ commit }: { commit: Commit }) {
      commit("setLoading", true);
      try {
        const response = await clearCart();
        commit("clearCart");
        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Không thể xóa giỏ hàng";
        commit("setError", errorMessage);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    }
  },
  getters: {
    cartItems: (state: CartState) => state.items,
    cartTotal: (state: CartState) => state.total,
    cartCount: (state: CartState) => state.count,
    isLoading: (state: CartState) => state.loading,
    error: (state: CartState) => state.error
  }
};

export default cart;