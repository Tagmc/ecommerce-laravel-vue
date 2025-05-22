<template>
  <div class="order-confirmation-page bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumbs -->
      <div class="text-sm breadcrumbs mb-6">
        <ul>
          <li><router-link to="/">Trang chủ</router-link></li>
          <li><router-link to="/orders">Đơn hàng</router-link></li>
          <li>Xác nhận đơn hàng</li>
        </ul>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      
      <div v-else-if="!order" class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-red-500 mb-6">
          <div class="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-circle text-4xl"></i>
          </div>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
        <p class="text-gray-600 mb-6">
          Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi để được hỗ trợ.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/orders" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem lịch sử đơn hàng
          </router-link>
          
          <router-link 
            to="/products" 
            class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>
      
      <div v-else class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-green-500 mb-6">
          <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-check-circle text-4xl"></i>
          </div>
        </div>
        
        <h1 class="text-2xl font-bold mb-4">Đặt hàng thành công!</h1>
        <p class="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
        </p>
        
        <div class="mb-8 text-left">
          <div class="border-t border-b border-gray-200 py-4 mb-4">
            <h2 class="font-semibold text-lg mb-2">Thông tin đơn hàng</h2>
            <p class="text-gray-600"><span class="font-medium">Mã đơn hàng:</span> #{{ order.id }}</p>
            <p class="text-gray-600"><span class="font-medium">Ngày đặt:</span> {{ formatDate(order.created_at) }}</p>
            <p class="text-gray-600"><span class="font-medium">Tổng tiền:</span> {{ formatPrice(order.total_price) }}</p>
            <p class="text-gray-600"><span class="font-medium">Trạng thái:</span> 
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Chờ xác nhận
              </span>
            </p>
            <p class="text-gray-600"><span class="font-medium">Phương thức thanh toán:</span> {{ getPaymentMethodText(order.payment_method) }}</p>
          </div>
          
          <p class="text-gray-600 text-sm mb-2">
            Chúng tôi đã gửi email xác nhận đơn hàng tới địa chỉ email của bạn.
          </p>
          <p class="text-gray-600 text-sm">
            Bạn có thể theo dõi trạng thái đơn hàng trong phần "Lịch sử đơn hàng" trên tài khoản của bạn.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            :to="`/orders/${order.id}`" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-eye mr-2"></i>
            Xem chi tiết đơn hàng
          </router-link>
          
          <router-link 
            to="/products" 
            class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i class="fas fa-shopping-bag mr-2"></i>
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

const store = useStore();
const route = useRoute();
const router = useRouter();

const orderId = computed(() => Number(route.params.id));
const order = computed(() => store.getters['order/selectedOrder']);
const isLoading = computed(() => store.getters['order/isLoading']);

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const getPaymentMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    'cod': 'Thanh toán khi nhận hàng (COD)',
    'bank_transfer': 'Chuyển khoản ngân hàng',
    'vnpay': 'VNPay',
    'momo': 'Ví MoMo'
  };
  
  return methodMap[method] || method;
};

onMounted(async () => {
  if (!orderId.value) {
    toast.error('Không tìm thấy thông tin đơn hàng');
    router.push('/orders');
    return;
  }
  
  try {
    await store.dispatch('order/fetchOrderById', orderId.value);
  } catch (error: any) {
    console.error('Failed to fetch order:', error);
    toast.error('Không thể tải thông tin đơn hàng');
  }
});
</script>