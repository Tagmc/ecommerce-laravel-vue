<template>
  <div class="product-list">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Quản lý sản phẩm</h1>
      <button @click="openAddProductModal" class="btn btn-primary">
        <i class="fas fa-plus mr-2"></i> Thêm sản phẩm
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="form-label">Tìm kiếm</label>
          <input
            v-model="filters.search"
            type="text"
            class="input input-bordered w-full"
            placeholder="Tên sản phẩm..."
            @input="debouncedSearch"
          />
        </div>

        <div>
          <label class="form-label">Danh mục</label>
          <select
            v-model="filters.category_id"
            class="select select-bordered w-full"
          >
            <option :value="undefined">Tất cả danh mục</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">Sắp xếp</label>
          <div class="flex space-x-2">
            <select
              v-model="filters.sort_by"
              class="select select-bordered flex-grow"
            >
              <option value="created_at">Ngày tạo</option>
              <option value="name">Tên</option>
              <option value="price">Giá</option>
              <option value="stock">Tồn kho</option>
            </select>
            <select
              v-model="filters.sort_direction"
              class="select select-bordered w-28"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button @click="applyFilters" class="btn btn-primary">
          <i class="fas fa-filter mr-2"></i> Lọc
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <div class="flex-1">
        <label>{{ error }}</label>
      </div>
      <button @click="fetchProducts" class="btn btn-sm btn-outline">
        Thử lại
      </button>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Danh mục</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="hover">
              <td>{{ product.id }}</td>
              <td>
                <div class="avatar">
                  <div class="w-16 h-16 rounded">
                    <img
                      :src="getProductImageUrl(product.images)"
                      :alt="product.name"
                      class="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-sm text-gray-500 truncate w-48">
                  {{ product.description || "Không có mô tả" }}
                </div>
              </td>
              <td>{{ formatPrice(product.price) }}</td>
              <td>
                <span :class="getStockClass(product.stock)">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="category in product.categories"
                    :key="category.id"
                    class="badge badge-sm"
                  >
                    {{ category.name }}
                  </span>
                </div>
              </td>
              <td class="text-right">
                <button
                  @click="editProduct(product)"
                  class="btn btn-sm btn-outline btn-info mr-2"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDeleteProduct(product)"
                  class="btn btn-sm btn-outline btn-error"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="7" class="text-center py-10 text-gray-500">
                Không có sản phẩm nào. Hãy thêm sản phẩm mới!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="pagination.totalPages >= 1"
        class="px-4 py-3 flex justify-center"
      >
        <div class="btn-group">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            class="btn btn-sm"
            :disabled="pagination.currentPage <= 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
            v-for="page in generatePageNumbers()"
            :key="page"
            @click="page > 0 ? goToPage(page) : undefined"
            class="btn btn-sm"
            :class="{
              'btn-active': page === pagination.currentPage,
              'btn-disabled': page < 0,
            }"
          >
            {{ page > 0 ? page : "..." }}
          </button> 

          <button
            @click="goToPage(pagination.currentPage + 1)"
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.totalPages"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Xác nhận xóa</h3>
        <p class="py-4">
          Bạn có chắc chắn muốn xóa sản phẩm "{{ productToDelete?.name }}"?
          <br />
          Hành động này không thể hoàn tác.
        </p>
        <div class="modal-action">
          <button @click="cancelDelete" class="btn">Hủy</button>
          <button
            @click="deleteProduct"
            class="btn btn-error"
            :disabled="isDeleting"
          >
            <span
              v-if="isDeleting"
              class="loading loading-spinner loading-xs mr-2"
            ></span>
            Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div class="modal" :class="{ 'modal-open': showProductModal }">
      <div class="modal-box max-w-3xl">
        <h3 class="font-bold text-lg">
          {{ selectedProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới" }}
        </h3>
        <ProductForm
          :product="selectedProduct"
          :categories="categories"
          @submit="handleProductFormSubmit"
          @cancel="closeProductModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import ProductForm from "../../../components/admin/ProductForm.vue";
import type { Product, ProductFilterParams } from "../../../types/product";
import type { Category } from "../../../types/category";
import { getCategories } from "../../../apis/category";
import { getProductImageUrl } from "../../../utils/image";

// Store
const store = useStore();

// Refs
const categories = ref<Category[]>([]);
const showDeleteModal = ref(false);
const showProductModal = ref(false);
const productToDelete = ref<Product | null>(null);
const selectedProduct = ref<Product | null>(null);
const isDeleting = ref(false);

// Filters
const filters = ref<ProductFilterParams>({
  search: "",
  category_id: undefined,
  sort_by: "created_at",
  sort_direction: "desc",
  page: 1,
  per_page: 10,
});

// Computed
const products = computed(() => store.getters["product/allProducts"]);
const isLoading = computed(() => store.getters["product/isLoading"]);
const error = computed(() => store.getters["product/error"]);
const pagination = computed(() => store.getters["product/pagination"]);

// Methods
const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = Array.isArray(response) ? response : response.data;
  } catch (error) {
    toast.error("Không thể tải danh sách danh mục");
    console.error("Error fetching categories:", error);
  }
};

const fetchProducts = async () => {
  try {
    await store.dispatch("product/fetchProducts", filters.value);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const debouncedSearch = (() => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      filters.value.page = 1;
      fetchProducts();
    }, 500);
  };
})();

const applyFilters = () => {
  filters.value.page = 1;
  fetchProducts();
};

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  filters.value.page = page;
  fetchProducts();
};

const generatePageNumbers = () => {
  const { currentPage, totalPages } = pagination.value;
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  if (currentPage > 3) {
    pages.push(-1);
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const getStockClass = (stock: number) => {
  if (stock <= 0) return "text-error";
  if (stock < 10) return "text-warning";
  return "text-success";
};
const openAddProductModal = () => {
  selectedProduct.value = null;
  showProductModal.value = true;
};

const editProduct = (product: Product) => {
  selectedProduct.value = product;
  showProductModal.value = true;
};

const closeProductModal = () => {
  selectedProduct.value = null;
  showProductModal.value = false;
};

const handleProductFormSubmit = async (formData: any) => {
  try {
    if (selectedProduct.value) {
      await store.dispatch("product/updateProduct", {
        id: selectedProduct.value.id,
        data: formData,
      });
      toast.success("Cập nhật sản phẩm thành công!");
    } else {
      await store.dispatch("product/createProduct", formData);
      toast.success("Thêm sản phẩm thành công!");
    }
    closeProductModal();
    fetchProducts();
  } catch (error: any) {
    toast.error(error.message || "Có lỗi xảy ra");
  }
};

const confirmDeleteProduct = (product: Product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  productToDelete.value = null;
  showDeleteModal.value = false;
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;

  isDeleting.value = true;
  try {
    await store.dispatch("product/deleteProduct", productToDelete.value.id);
    toast.success("Xóa sản phẩm thành công!");
    cancelDelete();
  } catch (error: any) {
    toast.error(error.message || "Không thể xóa sản phẩm");
  } finally {
    isDeleting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchProducts();
  fetchCategories();
});

// Watcher
watch(
  () => filters.value.category_id,
  () => {
    filters.value.page = 1;
  }
);
</script>

<style scoped>
.form-label {
  @apply block mb-1 text-sm font-medium text-gray-700;
}
</style>
