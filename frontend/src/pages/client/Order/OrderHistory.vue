<template>
  <div class="order-history-page bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <p class="mt-2 text-sm text-gray-500">
          Xem trạng thái và chi tiết các đơn hàng của bạn
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.status"
          @click="setActiveTab(tab.status)"
          class="py-3 px-4 text-sm font-medium mr-2 focus:outline-none relative whitespace-nowrap"
          :class="[
            activeTab === tab.status
              ? 'text-primary border-primary border-b-2'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
          ]"
        >
          {{ tab.name }}
          <span v-if="getOrderCountByStatus(tab.status) > 0" 
                class="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5">
            {{ getOrderCountByStatus(tab.status) }}
          </span>
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <div class="loader"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="mx-auto h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-red-100">
          <svg class="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Đã xảy ra lỗi</h3>
        <p class="mt-2 text-sm text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button @click="fetchOrders" class="btn btn-primary">
            Thử lại
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!orders || orders.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="mx-auto h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
          <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ activeTab === 'all' ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn hàng nào ở trạng thái này.' }}
        </p>
        <div class="mt-6">
          <router-link to="/products" class="btn btn-primary">
            Mua sắm ngay
          </router-link>
        </div>
      </div>

      <!-- Order list -->
      <div v-else class="space-y-4">
        <div v-for="order in filteredOrders" :key="order.id" 
             class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="border-b border-gray-200 p-4 flex flex-wrap items-center justify-between">
            <div class="mb-2 md:mb-0">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-900">Mã đơn hàng: {{ order.order_number }}</span>
                <span class="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                Ngày đặt: {{ formatDate(order.created_at) }}
              </div>
            </div>
            <div class="flex flex-col md:flex-row items-center">
              <div class="mr-4 font-bold text-gray-900">
                {{ formatPrice(order.total) }}
              </div>
              <div class="flex space-x-2 mt-2 md:mt-0">
                <router-link :to="`/orders/${order.id}`" class="btn btn-sm btn-outline btn-primary">
                  Chi tiết
                </router-link>
                <button 
                  v-if="order.status === 'pending'" 
                  @click="showCancelConfirm(order)"
                  class="btn btn-sm btn-outline btn-error">
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>
          
          <!-- Order items preview -->
          <div class="p-4">
            <div class="flex flex-col sm:flex-row items-start">
              <div class="flex-1">
                <div class="flex flex-wrap">
                  <div v-for="(item, idx) in getOrderItems(order)" :key="idx" 
                       class="mr-3 mb-3 relative">
                    <img :src="getItemImage(item)" 
                         :alt="item.product?.name || 'Sản phẩm'"
                         class="h-16 w-16 object-cover rounded-md border border-gray-200"
                         @error="useDefaultImage" />
                    <span class="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {{ item.quantity }}
                    </span>
                  </div>
                  <div v-if="getOrderItems(order).length > 3" class="flex items-center justify-center mr-3 mb-3 h-16 w-16 bg-gray-100 rounded-md">
                    <span class="text-sm text-gray-600">+{{ getOrderItems(order).length - 3 }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 sm:mt-0 text-sm">
                <div class="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-gray-600">{{ order.shipping_address || 'Không có địa chỉ' }}</span>
                </div>
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-gray-600">{{ order.phone || 'Không có số điện thoại' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="orders && orders.length > 0 && pagination.totalPages > 1" class="mt-6 flex justify-center">
        <div class="btn-group">
          <button 
            class="btn btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="changePage(pagination.currentPage - 1)"
          >
            «
          </button>
          
          <button 
            v-for="page in paginationRange" 
            :key="page"
            class="btn btn-sm"
            :class="{ 'btn-active': page === pagination.currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="btn btn-sm"
            :disabled="pagination.currentPage === pagination.totalPages"
            @click="changePage(pagination.currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>

      <!-- Cancel confirmation modal -->
      <div class="modal" :class="{ 'modal-open': showCancelModal }">
        <div class="modal-box">
          <h3 class="font-bold text-lg text-gray-900">Xác nhận hủy đơn hàng</h3>
          <p class="py-4 text-gray-600">
            Bạn có chắc chắn muốn hủy đơn hàng #{{ orderToCancel?.order_number }}?
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
import { useStore } from 'vuex';
import { useToast } from '../../../composables/useToast';
import { getProductImageUrl } from '../../../utils/image';

const store = useStore();
const { showToast } = useToast();

// State
const isLoading = computed(() => store.getters['order/isLoading']);
const error = computed(() => store.getters['order/error']);
const orders = computed(() => store.getters['order/allOrders'] || []);
const pagination = computed(() => store.getters['order/pagination']);

const activeTab = ref('all');
const showCancelModal = ref(false);
const orderToCancel = ref(null);
const isCancelling = ref(false);

// Tabs
const tabs = [
  { status: 'all', name: 'Tất cả' },
  { status: 'pending', name: 'Chờ xác nhận' },
  { status: 'processing', name: 'Đang xử lý' },
  { status: 'shipped', name: 'Đang giao' },
  { status: 'delivered', name: 'Đã giao' },
  { status: 'cancelled', name: 'Đã hủy' }
];

// Computed
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === activeTab.value);
});

const paginationRange = computed(() => {
  const totalPages = pagination.value.totalPages;
  const currentPage = pagination.value.currentPage;
  
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Always show first page, last page, and pages around current page
  const pages = [1];
  
  if (currentPage > 3) {
    pages.push('...');
  }
  
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
  
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }
  
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
  
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
});

// Methods
const fetchOrders = async () => {
  try {
    console.log('Fetching orders with filters:', {
      ...filters.value,
      status: activeTab.value !== 'all' ? activeTab.value : undefined
    });
    
    await store.dispatch('order/fetchOrders', {
      ...filters.value,
      status: activeTab.value !== 'all' ? activeTab.value : undefined
    });
    
    console.log('Orders fetched:', orders.value);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    showToast('Không thể tải danh sách đơn hàng', 'error');
  }
};

const filters = ref({
  page: 1,
  per_page: 10
});

const setActiveTab = (status) => {
  if (activeTab.value !== status) {
    activeTab.value = status;
    filters.value.page = 1; // Reset to first page when changing tab
    fetchOrders();
  }
};

const changePage = (page) => {
  if (typeof page === 'number' && page !== filters.value.page) {
    filters.value.page = page;
    fetchOrders();
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

const getOrderCountByStatus = (status) => {
  if (status === 'all') {
    return orders.value.length;
  }
  return orders.value.filter(order => order.status === status).length;
};

const getOrderItems = (order) => {
  // Kiểm tra và đảm bảo order.items tồn tại
  if (!order || !order.items || !Array.isArray(order.items)) {
    return [];
  }
  
  // Chỉ lấy 3 items đầu tiên để hiển thị
  return order.items.slice(0, 3);
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

const showCancelConfirm = (order) => {
  orderToCancel.value = order;
  showCancelModal.value = true;
};

const cancelOrder = async () => {
  if (!orderToCancel.value) return;
  
  isCancelling.value = true;
  try {
    await store.dispatch('order/cancelOrder', orderToCancel.value.id);
    showToast('Đơn hàng đã được hủy thành công', 'success');
    showCancelModal.value = false;
    fetchOrders(); // Fetch lại danh sách đơn hàng
  } catch (error) {
    console.error('Failed to cancel order:', error);
    showToast('Không thể hủy đơn hàng', 'error');
  } finally {
    isCancelling.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchOrders();
});

// Watch khi pagination hoặc filter thay đổi
watch(() => filters.value, (newFilters) => {
  console.log('Filters changed:', newFilters);
}, { deep: true });
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

.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>