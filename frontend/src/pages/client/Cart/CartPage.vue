<template>
  <div class="cart-page container mx-auto px-4 py-12">
    <!-- Breadcrumbs -->
    <div class="text-sm breadcrumbs mb-6">
      <ul>
        <li><router-link to="/">Trang chủ</router-link></li>
        <li>Giỏ hàng</li>
      </ul>
    </div>

    <h1 class="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="cartItems.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
      <div class="text-6xl mb-4 text-gray-300">
        <i class="fas fa-shopping-cart"></i>
      </div>
      <h2 class="text-2xl font-semibold mb-4">Giỏ hàng trống</h2>
      <p class="text-gray-600 mb-6">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng.</p>
      <router-link to="/products" class="btn btn-primary">
        <i class="fas fa-shopping-bag mr-2"></i>
        Tiếp tục mua sắm
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-center">Số lượng</th>
                <th class="text-right">Đơn giá</th>
                <th class="text-right">Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.product_id" class="hover">
                <td>
                  <div class="flex items-center space-x-3">
                    <div class="avatar">
                      <div class="w-16 h-16 rounded">
                        <img
                          :src="getProductImageUrl(item.product.images)"
                          :alt="item.product.name"
                          @error="useDefaultImage"
                          class="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <router-link 
                        :to="`/products/${item.product_id}`" 
                        class="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {{ item.product.name }}
                      </router-link>
                      <div v-if="item.product.stock <= 5" class="text-xs text-red-500 mt-1">
                        Chỉ còn {{ item.product.stock }} sản phẩm
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <div class="flex items-center justify-center">
                    <button 
                      @click="decrementQuantity(item)"
                      class="btn btn-xs btn-square border border-gray-300 hover:bg-gray-100"
                      :disabled="item.quantity <= 1 || isUpdating[item.product_id]"
                    >
                      <i class="fas fa-minus text-xs"></i>
                    </button>
                    <input
                      v-model.number="item.quantity"
                      @change="updateQuantity(item)"
                      type="number"
                      min="1"
                      :max="item.product.stock"
                      class="w-12 text-center mx-1 input input-sm input-bordered"
                      :disabled="isUpdating[item.product_id]"
                    />
                    <button 
                      @click="incrementQuantity(item)"
                      class="btn btn-xs btn-square border border-gray-300 hover:bg-gray-100"
                      :disabled="item.quantity >= item.product.stock || isUpdating[item.product_id]"
                    >
                      <i class="fas fa-plus text-xs"></i>
                    </button>
                    <div v-if="isUpdating[item.product_id]" class="ml-2">
                      <span class="loading loading-spinner loading-xs"></span>
                    </div>
                  </div>
                </td>
                <td class="text-right">{{ formatPrice(item.product.price) }}</td>
                <td class="text-right font-medium">{{ formatPrice(item.product.price * item.quantity) }}</td>
                <td>
                  <button 
                    @click="confirmRemoveItem(item)"
                    class="btn btn-sm btn-circle btn-outline btn-error"
                    :disabled="isRemoving[item.product_id]"
                  >
                    <span v-if="isRemoving[item.product_id]" class="loading loading-spinner loading-xs"></span>
                    <i v-else class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6">
          <router-link to="/products" class="btn btn-outline">
            <i class="fas fa-arrow-left mr-2"></i> Tiếp tục mua sắm
          </router-link>
          <button @click="clearCartConfirm" class="btn btn-outline btn-error" :disabled="isClearingCart">
            <span v-if="isClearingCart" class="loading loading-spinner loading-xs mr-2"></span>
            <i v-else class="fas fa-trash mr-2"></i> Xóa giỏ hàng
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
          <h2 class="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
          
          <div class="divider my-2"></div>
          
          <div class="flex justify-between items-center mb-2">
            <span>Tạm tính:</span>
            <span>{{ formatPrice(cartTotal) }}</span>
          </div>
          
          <div class="flex justify-between items-center mb-2">
            <span>Phí vận chuyển:</span>
            <span>{{ formatPrice(0) }}</span>
          </div>
          
          <div class="divider my-2"></div>
          
          <div class="flex justify-between items-center mb-4">
            <span class="font-semibold">Tổng cộng:</span>
            <span class="text-xl font-bold text-primary">{{ formatPrice(cartTotal) }}</span>
          </div>
          
          <router-link to="/checkout" class="btn btn-primary btn-block">
            <i class="fas fa-credit-card mr-2"></i>
            Tiến hành thanh toán
          </router-link>
        </div>
      </div>
    </div>

    <!-- Clear Cart Modal -->
    <div class="modal" :class="{ 'modal-open': showClearCartModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Xác nhận xóa giỏ hàng</h3>
        <p class="py-4">Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn tác.</p>
        <div class="modal-action">
          <button @click="showClearCartModal = false" class="btn btn-outline">Hủy</button>
          <button @click="clearCart" class="btn btn-error" :disabled="isClearingCart">
            <span v-if="isClearingCart" class="loading loading-spinner loading-xs mr-2"></span>
            Xóa giỏ hàng
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Item Modal -->
    <div class="modal" :class="{ 'modal-open': showRemoveItemModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Xác nhận xóa sản phẩm</h3>
        <p class="py-4">Bạn có chắc chắn muốn xóa sản phẩm "{{ itemToRemove?.product?.name }}" khỏi giỏ hàng?</p>
        <div class="modal-action">
          <button @click="cancelRemoveItem" class="btn btn-outline">Hủy</button>
          <button @click="removeItem" class="btn btn-error" :disabled="isRemoving[itemToRemove?.product_id || 0]">
            <span v-if="isRemoving[itemToRemove?.product_id || 0]" class="loading loading-spinner loading-xs mr-2"></span>
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { toast } from 'vue3-toastify';
import { getProductImageUrl } from '../../../utils/image';
import type { CartItem } from '../../../types/cart';

const store = useStore();
const showClearCartModal = ref(false);
const showRemoveItemModal = ref(false);
const itemToRemove = ref<CartItem | null>(null);
const isUpdating = reactive<Record<number, boolean>>({});
const isRemoving = reactive<Record<number, boolean>>({});
const isClearingCart = ref(false);

const cartItems = computed(() => store.getters['cart/cartItems']);
const cartTotal = computed(() => store.getters['cart/cartTotal']);
const isLoading = computed(() => store.getters['cart/isLoading']);

const fetchCart = async () => {
  try {
    await store.dispatch('cart/fetchCart');
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    toast.error('Không thể tải thông tin giỏ hàng');
  }
};

const incrementQuantity = (item: CartItem) => {
  if (item.quantity < item.product.stock) {
    updateCartItem(item.product_id, item.quantity + 1);
  }
};

const decrementQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    updateCartItem(item.product_id, item.quantity - 1);
  }
};

const updateQuantity = (item: CartItem) => {
  // Make sure quantity is valid
  if (item.quantity < 1) {
    item.quantity = 1;
  } else if (item.quantity > item.product.stock) {
    item.quantity = item.product.stock;
    toast.warning(`Chỉ còn ${item.product.stock} sản phẩm trong kho`);
  }

  updateCartItem(item.product_id, item.quantity);
};

const updateCartItem = async (product_id: number, quantity: number) => {
  if (isUpdating[product_id]) return;
  
  isUpdating[product_id] = true;
  try {
    await store.dispatch('cart/updateCartItem', { 
      product_id, 
      quantity 
    });
    toast.success('Đã cập nhật giỏ hàng');
  } catch (error: any) {
    console.error('Failed to update cart item:', error);
    const errorMessage = error.response?.data?.message || 'Không thể cập nhật giỏ hàng';
    toast.error(errorMessage);
    // Fetch cart again to get correct state
    fetchCart();
  } finally {
    isUpdating[product_id] = false;
  }
};

const confirmRemoveItem = (item: CartItem) => {
  itemToRemove.value = item;
  showRemoveItemModal.value = true;
};

const cancelRemoveItem = () => {
  showRemoveItemModal.value = false;
  setTimeout(() => {
    itemToRemove.value = null;
  }, 300);
};

const removeItem = async () => {
  if (!itemToRemove.value) return;
  
  const productId = itemToRemove.value.product_id;
  isRemoving[productId] = true;
  
  try {
    await store.dispatch('cart/removeFromCart', productId);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    showRemoveItemModal.value = false;
  } catch (error: any) {
    console.error('Failed to remove item from cart:', error);
    const errorMessage = error.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng';
    toast.error(errorMessage);
  } finally {
    isRemoving[productId] = false;
    setTimeout(() => {
      itemToRemove.value = null;
    }, 300);
  }
};

const clearCartConfirm = () => {
  showClearCartModal.value = true;
};

const clearCart = async () => {
  isClearingCart.value = true;
  try {
    await store.dispatch('cart/clearCart');
    showClearCartModal.value = false;
    toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng');
  } catch (error: any) {
    console.error('Failed to clear cart:', error);
    const errorMessage = error.response?.data?.message || 'Không thể xóa giỏ hàng';
    toast.error(errorMessage);
  } finally {
    isClearingCart.value = false;
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const useDefaultImage = (event: Event) => {
  (event.target as HTMLImageElement).src = '/images/product-placeholder.png';
};

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>