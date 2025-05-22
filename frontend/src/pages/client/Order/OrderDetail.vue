<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <li>
            <router-link to="/orders" class="text-gray-500 hover:text-gray-700">
              Đơn hàng
            </router-link>
          </li>
          <li>
            <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          </li>
          <li>
            <span class="text-gray-700 font-medium" aria-current="page">
              Chi tiết đơn hàng #{{ currentOrder?.order_number || orderId }}
            </span>
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <div class="loader"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Đã xảy ra lỗi</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6 flex justify-center gap-4">
          <router-link to="/orders" class="btn btn-outline">
            Quay lại
          </router-link>
          <button @click="fetchOrderDetails" class="btn btn-primary">
            Thử lại
          </button>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!currentOrder" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
        <p class="mt-1 text-sm text-gray-500">
          Đơn hàng bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <div class="mt-6">
          <router-link to="/orders" class="btn btn-primary">
            Quay lại danh sách đơn hàng
          </router-link>
        </div>
      </div>

      <!-- Order details -->
      <div v-else>
        <!-- Order header -->
        <div class="bg-white shadow rounded-lg px-6 py-5 mb-6">
          <div class="flex flex-wrap justify-between items-center mb-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                Đơn hàng #{{ currentOrder.order_number }}
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                Ngày đặt: {{ formatDate(currentOrder.created_at) }}
              </p>
            </div>
            <div class="mt-2 sm:mt-0">
              <span class="px-3 py-1 rounded-full text-sm font-medium" 
                    :class="getStatusClass(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </span>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Thông tin khách hàng</h3>
                <div class="mt-2 text-sm text-gray-900">
                  <p class="font-medium">{{ currentOrder.name || 'Không có tên' }}</p>
                  <p>{{ currentOrder.email || 'Không có email' }}</p>
                  <p>{{ currentOrder.phone || 'Không có số điện thoại' }}</p>
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Địa chỉ giao hàng</h3>
                <div class="mt-2 text-sm text-gray-900">
                  <p>{{ currentOrder.shipping_address || 'Không có địa chỉ giao hàng' }}</p>
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Phương thức thanh toán</h3>
                <div class="mt-2 text-sm text-gray-900">
                  <p>{{ getPaymentMethod(currentOrder.payment_method) }}</p>
                  <p class="mt-1" :class="getPaymentStatusClass(currentOrder.payment_status)">
                    {{ getPaymentStatusText(currentOrder.payment_status) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-4 pt-4 border-t border-gray-200" v-if="currentOrder.status === 'pending'">
            <button 
              @click="showCancelConfirm" 
              class="btn btn-outline btn-error"
              :disabled="isCancelling">
              <span v-if="isCancelling" class="loading loading-spinner loading-xs mr-2"></span>
              Hủy đơn hàng
            </button>
          </div>
        </div>

        <!-- Order items -->
        <div class="bg-white shadow rounded-lg px-6 py-5 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h2>
          
          <div v-if="!currentOrder.items || currentOrder.items.length === 0" 
               class="text-center py-6 text-gray-500">
            Không có thông tin sản phẩm
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div v-for="item in currentOrder.items" :key="item.id" class="py-4 flex flex-wrap sm:flex-nowrap">
              <div class="sm:w-20 w-full sm:mr-4 mb-3 sm:mb-0">
                <img 
                  :src="getItemImage(item)" 
                  :alt="item.product?.name || 'Sản phẩm'" 
                  class="w-20 h-20 object-cover rounded-md border border-gray-200"
                  @error="useDefaultImage" />
              </div>
              
              <div class="flex-1">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">
                      {{ item.product?.name || 'Sản phẩm không xác định' }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">Số lượng: {{ item.quantity }}</p>
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatPrice(item.price) }}
                  </div>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  <div class="flex justify-between">
                    <span>Đơn giá:</span>
                    <span>{{ formatPrice(item.price) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Thành tiền:</span>
                    <span class="font-medium text-gray-900">{{ formatPrice(item.subtotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order summary -->
        <div class="bg-white shadow rounded-lg px-6 py-5">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Tổng thanh toán</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Tạm tính</span>
              <span class="text-gray-900">{{ formatPrice(currentOrder.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Phí vận chuyển</span>
              <span class="text-gray-900">{{ formatPrice(currentOrder.shipping_fee) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Giảm giá</span>
              <span class="text-gray-900">-{{ formatPrice(currentOrder.discount || 0) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-3 flex justify-between">
              <span class="text-base font-medium text-gray-900">Tổng cộng</span>
              <span class="text-base font-medium text-gray-900">{{ formatPrice(currentOrder.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel confirmation modal -->
      <div class="modal" :class="{ 'modal-open': showCancelModal }">
        <div class="modal-box">
          <h3 class="font-bold text-lg text-gray-900">Xác nhận hủy đơn hàng</h3>
          <p class="py-4 text-gray-600">
            Bạn có chắc chắn muốn hủy đơn hàng #{{ currentOrder?.order_number }}?
          </p>
          <div class="modal-action">
            <button @click="showCancelModal = false" class="btn btn-outline">Không</button>
            <button 
              @click="cancelOrder" 
              class="btn btn-error" 
              :disabled="isCancelling">
              <span v-if="isCancelling" class="loading loading-spinner loading-xs mr-2"></span>
              Hủy đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getProductImageUrl } from '../../../utils/image';

const route = useRoute();
const router = useRouter();
const store = useStore();

// State
const orderId = computed(() => Number(route.params.id));
const currentOrder = computed(() => store.getters['order/currentOrder']);
const isLoading = computed(() => store.getters['order/isLoading']);
const error = computed(() => store.getters['order/error']);
const showCancelModal = ref(false);
const isCancelling = ref(false);

// Methods
const fetchOrderDetails = async () => {
  if (!orderId.value) {
    toast.error('ID đơn hàng không hợp lệ');
    return;
  }
  
  try {
    await store.dispatch('order/fetchOrderById', orderId.value);
    
    // Log dữ liệu order để debug
    console.log('Fetched order details:', currentOrder.value);
    
    if (!currentOrder.value) {
      toast.error('Không tìm thấy đơn hàng');
    }
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    toast.error('Không thể tải thông tin đơn hàng');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'processing': return 'Đang xử lý';
    case 'shipped': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentMethod = (method) => {
  switch (method) {
    case 'cod': return 'Thanh toán khi nhận hàng (COD)';
    case 'bank_transfer': return 'Chuyển khoản ngân hàng';
    case 'vnpay': return 'VNPay';
    case 'momo': return 'Ví MoMo';
    default: return method || 'Không xác định';
  }
};

const getPaymentStatusText = (status) => {
  switch (status) {
    case 'paid': return 'Đã thanh toán';
    case 'pending': return 'Chưa thanh toán';
    case 'cancelled': return 'Đã hủy';
    default: return status || 'Không xác định';
  }
};

const getPaymentStatusClass = (status) => {
  switch (status) {
    case 'paid': return 'text-green-600';
    case 'pending': return 'text-yellow-600';
    case 'cancelled': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const getItemImage = (item) => {
  if (item.product && item.product.images && item.product.images.length > 0) {
    return getProductImageUrl(item.product.images);
  }
  
  return '/images/placeholder.png';
};

const useDefaultImage = (event) => {
  event.target.src = '/images/placeholder.png';
};

const showCancelConfirm = () => {
  showCancelModal.value = true;
};

const cancelOrder = async () => {
  if (!currentOrder.value) return;
  
  isCancelling.value = true;
  try {
    await store.dispatch('order/cancelOrder', currentOrder.value.id);
    toast.success('Đơn hàng đã được hủy thành công');
    showCancelModal.value = false;
    await fetchOrderDetails(); // Refresh order details
  } catch (error) {
    console.error('Failed to cancel order:', error);
    toast.error('Không thể hủy đơn hàng');
  } finally {
    isCancelling.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchOrderDetails();
});

// Watch route change (in case user navigates between order details pages)
watch(() => route.params.id, (newId) => {
  if (newId && newId !== String(currentOrder.value?.id)) {
    fetchOrderDetails();
  }
});
</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>