<template>
  <div class="checkout-page">
    <div class="container mx-auto px-4 py-12">
      <!-- Breadcrumbs -->
      <div class="text-sm breadcrumbs mb-6">
        <ul>
          <li><router-link to="/">Trang chủ</router-link></li>
          <li><router-link to="/cart">Giỏ hàng</router-link></li>
          <li>Thanh toán</li>
        </ul>
      </div>
      
      <h1 class="text-3xl font-bold mb-8">Thanh toán</h1>
      
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>
      
      <div v-else-if="items.length === 0" class="bg-white p-10 rounded-lg shadow-sm text-center">
        <div class="text-gray-500 mb-4">
          <i class="fas fa-shopping-cart text-6xl"></i>
        </div>
        <h2 class="text-2xl font-medium mb-4">Giỏ hàng trống</h2>
        <p class="text-gray-600 mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <router-link 
          to="/products" 
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tiếp tục mua sắm
        </router-link>
      </div>
      
      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- Shipping form -->
        <div class="lg:w-2/3">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
            
            <form @submit.prevent="placeOrder">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="col-span-1 md:col-span-2">
                  <label for="shipping_address" class="block mb-2 text-sm font-medium">Địa chỉ giao hàng <span class="text-red-500">*</span></label>
                  <textarea
                    id="shipping_address"
                    v-model="orderData.shipping_address"
                    rows="3"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Địa chỉ nhà, số nhà, tòa nhà, đường..."
                  ></textarea>
                  <p v-if="validationErrors.shipping_address" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.shipping_address }}
                  </p>
                </div>
                
                <div>
                  <label for="shipping_city" class="block mb-2 text-sm font-medium">Thành phố <span class="text-red-500">*</span></label>
                  <input
                    id="shipping_city"
                    v-model="orderData.shipping_city"
                    type="text"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Thành phố..."
                  />
                  <p v-if="validationErrors.shipping_city" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.shipping_city }}
                  </p>
                </div>
                
                <div>
                  <label for="shipping_country" class="block mb-2 text-sm font-medium">Quốc gia <span class="text-red-500">*</span></label>
                  <input
                    id="shipping_country"
                    v-model="orderData.shipping_country"
                    type="text"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Quốc gia..."
                  />
                  <p v-if="validationErrors.shipping_country" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.shipping_country }}
                  </p>
                </div>
                
                <div>
                  <label for="shipping_postal_code" class="block mb-2 text-sm font-medium">Mã bưu chính <span class="text-red-500">*</span></label>
                  <input
                    id="shipping_postal_code"
                    v-model="orderData.shipping_postal_code"
                    type="text"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Mã bưu chính..."
                  />
                  <p v-if="validationErrors.shipping_postal_code" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.shipping_postal_code }}
                  </p>
                </div>
                
                <div>
                  <label for="shipping_phone" class="block mb-2 text-sm font-medium">Số điện thoại <span class="text-red-500">*</span></label>
                  <input
                    id="shipping_phone"
                    v-model="orderData.shipping_phone"
                    type="tel"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Số điện thoại liên hệ..."
                  />
                  <p v-if="validationErrors.shipping_phone" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.shipping_phone }}
                  </p>
                </div>
              </div>
              
              <div class="mb-6">
                <label class="block mb-2 text-sm font-medium">Phương thức thanh toán <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    class="border rounded-lg p-4 cursor-pointer transition-colors"
                    :class="orderData.payment_method === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'"
                    @click="orderData.payment_method = 'cod'"
                  >
                    <div class="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        id="payment_cod" 
                        name="payment_method" 
                        value="cod" 
                        v-model="orderData.payment_method"
                        class="radio radio-primary"
                      />
                      <label for="payment_cod" class="flex items-center cursor-pointer">
                        <i class="fas fa-money-bill-wave mr-2 text-green-600 text-lg"></i>
                        <div>
                          <div class="font-medium">Thanh toán khi nhận hàng (COD)</div>
                          <div class="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div
                    class="border rounded-lg p-4 cursor-pointer transition-colors"
                    :class="orderData.payment_method === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'"
                    @click="orderData.payment_method = 'bank_transfer'"
                  >
                    <div class="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        id="payment_bank" 
                        name="payment_method" 
                        value="bank_transfer" 
                        v-model="orderData.payment_method"
                        class="radio radio-primary"
                      />
                      <label for="payment_bank" class="flex items-center cursor-pointer">
                        <i class="fas fa-university mr-2 text-blue-600 text-lg"></i>
                        <div>
                          <div class="font-medium">Chuyển khoản ngân hàng</div>
                          <div class="text-sm text-gray-500">Thanh toán bằng chuyển khoản ngân hàng</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <p v-if="validationErrors.payment_method" class="mt-1 text-sm text-red-500">
                  {{ validationErrors.payment_method }}
                </p>
              </div>
              
              <div class="mb-6">
                <label for="notes" class="block mb-2 text-sm font-medium">Ghi chú</label>
                <textarea
                  id="notes"
                  v-model="orderData.notes"
                  rows="2"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ghi chú về đơn hàng, vd: thời gian hay địa chỉ giao hàng chi tiết"
                ></textarea>
              </div>
              
              <div class="mt-6 flex justify-between">
                <router-link 
                  to="/cart" 
                  class="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <i class="fas fa-arrow-left mr-1"></i>
                  Quay lại giỏ hàng
                </router-link>
                
                <button 
                  type="submit"
                  class="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isSubmitting || items.length === 0"
                >
                  <span v-if="isSubmitting">
                    <i class="fas fa-spinner fa-spin mr-1"></i>
                    Đang xử lý...
                  </span>
                  <span v-else>
                    <i class="fas fa-check-circle mr-1"></i>
                    Đặt hàng
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Order summary -->
        <div class="lg:w-1/3">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 class="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Sản phẩm đã chọn ({{ items.length }})</h3>
              <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
                <div v-for="item in items" :key="item.product_id" class="flex border-b pb-3">
                  <div class="w-16 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img 
                      :src="getProductImageUrl(item.product.images)" 
                      :alt="item.product.name" 
                      class="w-full h-full object-cover"
                      @error="useDefaultImage"
                    />
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium line-clamp-1">{{ item.product.name }}</p>
                    <p class="text-xs text-gray-500">Số lượng: {{ item.quantity }}</p>
                    <p class="text-sm font-medium text-blue-600">{{ formatPrice(item.product.price * item.quantity) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="border-t border-gray-200 pt-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Tạm tính</span>
                <span>{{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Phí vận chuyển</span>
                <span>{{ formatPrice(0) }}</span>
              </div>
              <div class="border-t border-gray-200 pt-3 mt-3">
                <div class="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span class="text-lg">{{ formatPrice(cartTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { getProductImageUrl } from '../../../utils/image';

const store = useStore();
const router = useRouter();

const items = computed(() => store.getters['cart/cartItems']);
const cartTotal = computed(() => store.getters['cart/cartTotal']);
const isLoading = computed(() => store.getters['cart/isLoading']);
const isSubmitting = ref(false);

const orderData = ref({
  shipping_address: '',
  shipping_city: '',
  shipping_country: 'Việt Nam',
  shipping_postal_code: '',
  shipping_phone: '',
  payment_method: 'cod',
  notes: ''
});

const validationErrors = reactive({
  shipping_address: '',
  shipping_city: '',
  shipping_country: '',
  shipping_postal_code: '',
  shipping_phone: '',
  payment_method: ''
});

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const validateForm = () => {
  let isValid = true;
  
  // Reset validation errors
  (Object.keys(validationErrors) as Array<keyof typeof validationErrors>).forEach(key => {
    validationErrors[key] = '';
  });
  
  // Validate shipping address
  if (!orderData.value.shipping_address.trim()) {
    validationErrors.shipping_address = 'Vui lòng nhập địa chỉ giao hàng';
    isValid = false;
  }
  
  // Validate city
  if (!orderData.value.shipping_city.trim()) {
    validationErrors.shipping_city = 'Vui lòng nhập thành phố';
    isValid = false;
  }
  
  // Validate country
  if (!orderData.value.shipping_country.trim()) {
    validationErrors.shipping_country = 'Vui lòng nhập quốc gia';
    isValid = false;
  }
  
  // Validate postal code
  if (!orderData.value.shipping_postal_code.trim()) {
    validationErrors.shipping_postal_code = 'Vui lòng nhập mã bưu chính';
    isValid = false;
  }
  
  // Validate phone
  if (!orderData.value.shipping_phone.trim()) {
    validationErrors.shipping_phone = 'Vui lòng nhập số điện thoại';
    isValid = false;
  } else {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(orderData.value.shipping_phone.replace(/\s/g, ''))) {
      validationErrors.shipping_phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }
  }
  
  // Validate payment method
  if (!orderData.value.payment_method) {
    validationErrors.payment_method = 'Vui lòng chọn phương thức thanh toán';
    isValid = false;
  }
  
  return isValid;
};

const placeOrder = async () => {
  if (!validateForm()) {
    toast.error('Vui lòng kiểm tra lại thông tin đơn hàng');
    return;
  }
  
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    const response = await store.dispatch('order/createOrder', orderData.value);
    
    toast.success('Đặt hàng thành công!');
    
    // Clear cart after successful order
    await store.dispatch('cart/fetchCart');
    
    // Redirect to order confirmation page
    router.push(`/orders/${response.order.id}/confirmation`);
  } catch (error: any) {
    console.error('Failed to place order:', error);
    
    // Handle validation errors from the server
    if (error.response && error.response.data && error.response.data.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        if (serverErrors[key][0]) {
          const errorKey = key as keyof typeof validationErrors;
          if (errorKey in validationErrors) {
            validationErrors[errorKey] = serverErrors[key][0];
          }
        }
      });
      toast.error('Vui lòng kiểm tra lại thông tin đơn hàng');
    } else {
      const errorMessage = error.response?.data?.message || 'Không thể đặt hàng, vui lòng thử lại sau';
      toast.error(errorMessage);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const useDefaultImage = (event: Event) => {
  (event.target as HTMLImageElement).src = '/images/product-placeholder.png';
};

onMounted(async () => {
  try {
    await store.dispatch('cart/fetchCart');
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    toast.error('Không thể tải thông tin giỏ hàng');
  }
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>