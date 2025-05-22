<template>
  <div class="product-list-page">
    <div class="container mx-auto px-4 py-12">
      <div class="flex items-center mb-6 text-sm text-gray-600">
        <router-link to="/" class="hover:text-blue-600 transition-colors">
          <i class="fas fa-home mr-1"></i> Trang chủ
        </router-link>
        <span class="mx-2">/</span>
        <span class="font-medium text-gray-800">Danh sách sản phẩm</span>
        <span v-if="selectedCategoryName" class="mx-2">/</span>
        <span v-if="selectedCategoryName" class="font-medium text-gray-800">{{ selectedCategoryName }}</span>
      </div>
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar filters -->
        <div class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Bộ lọc</h2>
            
            <!-- Search filter -->
            <div class="mb-6">
              <label class="block mb-2 font-medium">Tìm kiếm</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tên sản phẩm..."
                  @input="debouncedSearch"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''; applyFilters()"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Category filter -->
            <div class="mb-6">
              <label class="block mb-2 font-medium">Danh mục</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="flex items-center"
                >
                  <input
                    type="radio"
                    :id="`category-${category.id}`"
                    :value="category.id"
                    v-model="filters.category_id"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    @change="applyFilters()"
                  />
                  <label
                    :for="`category-${category.id}`"
                    class="ml-2 text-sm cursor-pointer"
                  >
                    {{ category.name }}
                  </label>
                </div>
                <div class="flex items-center mt-2">
                  <input
                    type="radio"
                    id="category-all"
                    :value="null"
                    v-model="filters.category_id"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    @change="applyFilters()"
                  />
                  <label
                    for="category-all"
                    class="ml-2 text-sm font-medium cursor-pointer"
                  >
                    Tất cả danh mục
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Price filter -->
            <div class="mb-6">
              <label class="block mb-2 font-medium">Khoảng giá</label>
              <div class="flex items-center space-x-2">
                <input
                  v-model.number="filters.min_price"
                  type="number"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Từ"
                  min="0"
                />
                <span>-</span>
                <input
                  v-model.number="filters.max_price"
                  type="number"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Đến"
                  min="0"
                />
              </div>
              <button
                @click="applyFilters()"
                class="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Áp dụng
              </button>
            </div>
            
            <!-- Reset filters -->
            <button
              @click="resetFilters()"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        
        <!-- Products display area -->
        <div class="flex-1">
          <!-- Sort and view controls -->
          <div class="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Sắp xếp theo:</span>
              <select
                v-model="filters.sort_by"
                class="px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @change="applyFilters()"
              >
                <option value="created_at">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="price">Giá</option>
              </select>
              <select
                v-model="filters.sort_direction"
                class="px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @change="applyFilters()"
              >
                <option value="desc">Tăng dần</option>
                <option value="asc">Giảm dần</option>
              </select>
            </div>
            
            <div class="flex items-center space-x-3">
              <button
                @click="viewMode = 'grid'"
                class="p-2 rounded-md transition-colors"
                :class="viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              >
                <i class="fas fa-th-large"></i>
              </button>
              <button
                @click="viewMode = 'list'"
                class="p-2 rounded-md transition-colors"
                :class="viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <div class="loader"></div>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="products.length === 0" class="bg-white p-8 rounded-lg shadow-sm text-center">
            <div class="text-gray-500 mb-4">
              <i class="fas fa-search text-4xl"></i>
            </div>
            <h3 class="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
            <p class="text-gray-500 mb-4">
              Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
            <button
              @click="resetFilters()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
          
          <!-- Grid view -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="product in products"
              :key="product.id"
              class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
            >
              <router-link :to="`/products/${product.id}`" class="block relative">
                <div class="product-image aspect-square overflow-hidden bg-gray-50">
                  <img 
                    :src="getProductImageUrl(product.images)" 
                    :alt="product.name"
                    class="w-full h-full object-cover transition-transform hover:scale-105"
                    @error="useDefaultImage"
                  />
                </div>
                <div class="p-4">
                  <h3 class="font-medium text-gray-900 line-clamp-2">{{ product.name }}</h3>
                  <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-blue-600 font-semibold">{{ formatPrice(product.price) }}</span>
                    <span v-if="product.stock <= 5" class="text-sm text-red-500">
                      Còn lại: {{ product.stock }}
                    </span>
                  </div>
                </div>
              </router-link>
              <!-- Thêm nút thêm vào giỏ hàng -->
              <div class="p-4 pt-0 mt-2">
                <button 
                  @click="addToCart(product)"
                  class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  :disabled="product.stock <= 0 || isAddingToCart[product.id]"
                >
                  <i class="fas fa-spinner fa-spin mr-2" v-if="isAddingToCart[product.id]"></i>
                  <i class="fas fa-shopping-cart mr-2" v-else></i>
                  {{ product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- List view -->
          <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              v-for="product in products"
              :key="product.id"
              class="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div class="flex p-4 flex-wrap md:flex-nowrap">
                <router-link :to="`/products/${product.id}`" class="w-full md:w-auto flex md:flex-grow">
                  <div class="w-24 h-24 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                    <img 
                      :src="getProductImageUrl(product.images)" 
                      :alt="product.name"
                      class="w-full h-full object-cover"
                      @error="useDefaultImage"
                    />
                  </div>
                  <div class="ml-4 flex-1">
                    <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
                    <p class="text-sm text-gray-500 line-clamp-2 mt-1">
                      {{ product.description || "Không có mô tả" }}
                    </p>
                    <div class="mt-2 flex items-baseline justify-between">
                      <span class="text-blue-600 font-semibold">{{ formatPrice(product.price) }}</span>
                      <div>
                        <span v-if="product.stock <= 5" class="text-sm text-red-500 mr-2">
                          Còn lại: {{ product.stock }}
                        </span>
                        <span class="text-sm text-gray-500">
                          Danh mục: {{ getCategoryName(product.category_id) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </router-link>
                <!-- Thêm nút thêm vào giỏ hàng view danh sách -->
                <div class="w-full md:w-auto flex items-center justify-end mt-4 md:mt-0 md:ml-4">
                  <div class="flex items-center">
                    <div class="mr-2">
                      <select 
                        v-model="quantityMap[product.id]" 
                        class="p-2 border border-gray-300 rounded-md"
                      >
                        <option v-for="n in Math.min(10, product.stock)" :key="n" :value="n">
                          {{ n }}
                        </option>
                      </select>
                    </div>
                    <button 
                      @click="addToCart(product)"
                      class="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      :disabled="product.stock <= 0 || isAddingToCart[product.id]"
                    >
                      <i class="fas fa-spinner fa-spin mr-2" v-if="isAddingToCart[product.id]"></i>
                      <i class="fas fa-shopping-cart mr-2" v-else></i>
                      {{ product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex space-x-1">
              <button
                @click="goToPage(pagination.currentPage - 1)"
                class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="pagination.currentPage <= 1"
              >
                <i class="fas fa-chevron-left text-sm"></i>
              </button>
              
              <button
                v-for="page in generatePageNumbers()"
                :key="page"
                @click="page > 0 ? goToPage(page) : undefined"
                class="px-3 py-2 rounded-md border"
                :class="{
                  'bg-blue-600 text-white border-blue-600': page === pagination.currentPage,
                  'text-gray-700 hover:bg-gray-50 border-gray-300': page !== pagination.currentPage,
                  'bg-gray-100 text-gray-400 cursor-default': page < 0
                }"
              >
                {{ page > 0 ? page : "..." }}
              </button>
              
              <button
                @click="goToPage(pagination.currentPage + 1)"
                class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="pagination.currentPage >= pagination.totalPages"
              >
                <i class="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Toast notification -->
    <div 
      v-if="showToastMessage" 
      class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
    >
      <i class="fas fa-check-circle mr-2"></i>
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getProductImageUrl } from "../../../utils/image";
import { getCategories } from "../../../apis/category";
import type { Category } from "../../../types/category";
import type { Product } from "../../../types/product";

// Store, route and router
const store = useStore();
const route = useRoute();
const router = useRouter();

// State
const isLoading = ref(false);
const categories = ref<Category[]>([]);
const searchQuery = ref("");
const viewMode = ref("grid");
const showToastMessage = ref(false);
const toastMessage = ref("");
const isAddingToCart = reactive<Record<number, boolean>>({});
const quantityMap = reactive<Record<number, number>>({});

// Filters - Matching the structure in ProductManager
const filters = reactive({
  search: "",
  category_id: null as number | null,  
  min_price: null as number | null,
  max_price: null as number | null,
  sort_by: "created_at",  
  sort_direction: "desc", 
  page: 1,
  per_page: 12,
});

const products = computed(() => store.getters["product/allProducts"]);
const pagination = computed(() => store.getters["product/pagination"]);

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    console.log("Sending filters to API:", JSON.stringify(filters));
    await store.dispatch("product/fetchProducts", filters);
    console.log("Products received:", products.value.length);
    updateQueryParams();
    
    products.value.forEach((product: Product) => {
      if (!quantityMap[product.id]) {
        quantityMap[product.id] = 1;
      }
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    showToast("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.", "error");
  } finally {
    isLoading.value = false;
  }
};

const selectedCategoryName = computed(() => {
  if (!filters.category_id) return null;
  const category = categories.value.find(c => c.id === filters.category_id);
  return category ? category.name : null;
});

const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = Array.isArray(response) ? response : response.data;
    console.log("Categories loaded:", categories.value.length);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    showToast("Không thể tải danh mục sản phẩm.", "error");
  }
};

const debouncedSearch = (() => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      filters.search = searchQuery.value;
      filters.page = 1;
      fetchProducts();
    }, 500);
  };
})();

const applyFilters = () => {
  filters.search = searchQuery.value;
  filters.page = 1;
  fetchProducts();
};

const resetFilters = () => {
  searchQuery.value = "";
  filters.search = "";
  filters.category_id = null; 
  filters.min_price = null;
  filters.max_price = null;
  filters.sort_by = "created_at";
  filters.sort_direction = "desc";
  filters.page = 1;
  fetchProducts();
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    filters.page = page;
    fetchProducts();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
};

const generatePageNumbers = () => {
  const { currentPage, totalPages } = pagination.value;
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  if (currentPage > 3) {
    pages.push(-1); // Dots
  }

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push(-2); 
  }

  pages.push(totalPages);

  return pages;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const useDefaultImage = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/images/product-placeholder.png";
};

const getCategoryName = (categoryId: number | null): string => {
  if (!categoryId) return "Không có";
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : "Không xác định";
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (product: Product) => {
  if (product.stock <= 0) return;
  
  isAddingToCart[product.id] = true;
  try {
    const quantity = quantityMap[product.id] || 1;
    await store.dispatch("cart/addToCart", {
      product_id: product.id,
      quantity: quantity
    });
    
    showToast(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, "success");
    
    // Reset quantity after adding
    quantityMap[product.id] = 1;
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    showToast("Không thể thêm sản phẩm vào giỏ hàng", "error");
  } finally {
    isAddingToCart[product.id] = false;
  }
};

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastMessage.value = message;
  showToastMessage.value = true;
  
  // Handle different toast types
  if (type === 'error') {
    console.error(message);
  } else {
    console.log(`[${type}] ${message}`);
  }
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    showToastMessage.value = false;
  }, 3000);
};

const updateQueryParams = () => {
  const query: Record<string, string> = {};
  
  if (filters.search) query.search = filters.search;
  if (filters.category_id) query.category = filters.category_id.toString();
  if (filters.min_price) query.min_price = filters.min_price.toString();
  if (filters.max_price) query.max_price = filters.max_price.toString();
  if (filters.sort_by !== "created_at") query.sort_by = filters.sort_by;
  if (filters.sort_direction !== "desc") query.sort_direction = filters.sort_direction;
  if (filters.page > 1) query.page = filters.page.toString();
  
  router.replace({
    path: route.path,
    query
  });
};

onMounted(async () => {
  await fetchCategories();
  
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
    filters.search = searchQuery.value;
  }
  
  if (route.query.category) {
    const categoryId = parseInt(route.query.category as string);
    if (!isNaN(categoryId)) {
      filters.category_id = categoryId;
    }
  }
  
  if (route.query.min_price) {
    filters.min_price = parseInt(route.query.min_price as string);
  }
  
  if (route.query.max_price) {
    filters.max_price = parseInt(route.query.max_price as string);
  }
  
  if (route.query.sort_by) {
    filters.sort_by = route.query.sort_by as string;
  }
  
  if (route.query.sort_direction) {
    filters.sort_direction = route.query.sort_direction as string;
  }
  
  if (route.query.page) {
    filters.page = parseInt(route.query.page as string);
  }
  
  await fetchProducts();
});

watch(
  () => filters.category_id,
  () => {
    filters.page = 1;
  }
);
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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