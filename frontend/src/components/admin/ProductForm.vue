<template>
  <form @submit.prevent="submitForm" class="p-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text"
            >Tên sản phẩm <span class="text-error">*</span></span
          >
        </label>
        <input
          v-model="form.name"
          type="text"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.name }"
          required
        />
        <span v-if="errors.name" class="text-error text-xs mt-1">{{
          errors.name
        }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text"
            >Giá (VND) <span class="text-error">*</span></span
          >
        </label>
        <input
          v-model.number="form.price"
          type="number"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.price }"
          min="0"
          step="1000"
          required
        />
        <span v-if="errors.price" class="text-error text-xs mt-1">{{
          errors.price
        }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text"
            >Tồn kho <span class="text-error">*</span></span
          >
        </label>
        <input
          v-model.number="form.stock"
          type="number"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.stock }"
          min="0"
          required
        />
        <span v-if="errors.stock" class="text-error text-xs mt-1">{{
          errors.stock
        }}</span>
      </div>

      <div class="form-control w-full md:col-span-1">
        <label class="label">
          <span class="label-text">Mô tả sản phẩm</span>
          <span class="info-tooltip">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="tooltip-text"
              >Mô tả chi tiết về sản phẩm, tính năng và đặc điểm nổi bật</span
            >
          </span>
        </label>
        <div class="description-wrapper">
          <textarea
            v-model="form.description"
            class="textarea textarea-bordered h-24"
            :class="{ 'textarea-error': errors.description }"
            placeholder="Nhập mô tả chi tiết về sản phẩm..."
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ form.description.length }}/500</div>
        </div>
        <span v-if="errors.description" class="text-error text-xs mt-1">{{
          errors.description
        }}</span>
      </div>
      <div class="form-control w-full md:col-span-2">
        <label class="label">
          <span class="label-text">Danh mục</span>
          <span class="info-tooltip">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="tooltip-text"
              >Chọn một hoặc nhiều danh mục cho sản phẩm</span
            >
          </span>
        </label>

        <div class="category-select-container">
          <div class="selected-categories" v-if="form.category_ids.length > 0">
            <div
              v-for="id in form.category_ids"
              :key="id"
              class="badge badge-primary gap-1"
            >
              {{ getCategoryName(id) }}
              <button
                type="button"
                @click="removeCategory(id)"
                class="btn-close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-else class="text-xs text-gray-500 mb-2 italic">
            Chưa có danh mục nào được chọn
          </div>

          <!-- Dropdown select -->
          <select
            v-model="selectedCategory"
            class="select select-bordered w-full"
            :class="{ 'select-error': errors.category_ids }"
          >
            <option value="" disabled>-- Chọn danh mục --</option>
            <option
              v-for="category in availableCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
            <option v-if="availableCategories.length === 0" disabled>
              Đã chọn tất cả danh mục
            </option>
          </select>
        </div>
        <span v-if="errors.category_ids" class="text-error text-xs mt-1">{{
          errors.category_ids
        }}</span>
      </div>

      <div class="form-control w-full md:col-span-2">
        <label class="label">
          <span class="label-text">Hình ảnh sản phẩm</span>
        </label>
        <div class="flex items-center">
          <label class="btn btn-outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Chọn ảnh</span>
            <input
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            />
          </label>
          <span class="ml-2 text-sm text-gray-500">
            {{ selectedFiles.length }} ảnh mới đã chọn
          </span>
        </div>
        <span v-if="errors.images" class="text-error text-xs mt-1">{{
          errors.images
        }}</span>
      </div>
    </div>
    <div
      v-if="imagePreviews.length > 0 || existingImages.length > 0"
      class="mt-6"
    >
      <h3 class="font-medium mb-3 pb-2 border-b">Hình ảnh sản phẩm:</h3>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <!-- Existing images (when editing) -->
        <div
          v-for="(image, index) in existingImages"
          :key="`existing-${index}`"
          class="image-preview-card group"
        >
          <div class="image-container bg-gray-100">
            <img
              :src="getImageUrl(image)"
              class="preview-image"
              alt="Product"
              @error="handleImageError"
              @load="(e) => console.log(e)"
            />
            <div class="image-overlay group-hover:opacity-100">
              <button
                type="button"
                @click="removeExistingImage(index)"
                class="btn btn-sm btn-circle btn-error"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="image-label">Ảnh hiện tại #{{ index + 1 }}</div>
        </div>

        <!-- New images -->
        <div
          v-for="(preview, index) in imagePreviews"
          :key="`new-${index}`"
          class="image-preview-card group"
        >
          <div class="image-container">
            <img :src="preview" class="preview-image" alt="Preview" />
            <div class="image-overlay group-hover:opacity-100">
              <button
                type="button"
                @click="removeSelectedImage(index)"
                class="btn btn-sm btn-circle btn-error"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="image-label">Ảnh mới #{{ index + 1 }}</div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <button type="button" class="btn btn-outline" @click="$emit('cancel')">
        Hủy
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        <span
          v-if="isSubmitting"
          class="loading loading-spinner loading-xs mr-2"
        ></span>
        {{ product ? "Cập nhật" : "Thêm mới" }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";

// Props
const props = defineProps({
  product: {
    type: Object as () => Product | null,
    default: null,
  },
  categories: {
    type: Array as () => Category[],
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["submit", "cancel"]);

// State
const form = reactive({
  name: "",
  price: 0,
  stock: 0,
  description: "",
  category_ids: [] as number[],
});

const imagePreviews = ref<string[]>([]);
const existingImages = ref<string[]>([]);
const selectedFiles = ref<File[]>([]);
const removedImageIndexes = ref<number[]>([]);
const isSubmitting = ref(false);
// Thêm selectedCategory để xử lý lựa chọn danh mục
const selectedCategory = ref<number | string>("");

const errors = reactive({
  name: "",
  price: "",
  stock: "",
  description: "",
  category_ids: "",
  images: "",
});

// Computed để lọc ra các danh mục chưa được chọn
const availableCategories = computed(() => {
  return props.categories.filter(
    (category) => !form.category_ids.includes(category.id)
  );
});

// Hàm lấy tên danh mục từ ID
const getCategoryName = (id: number) => {
  const category = props.categories.find((cat) => cat.id === id);
  return category ? category.name : "";
};

// Xử lý khi chọn danh mục từ dropdown
watch(selectedCategory, (newVal) => {
  if (newVal && typeof newVal === "number") {
    form.category_ids.push(newVal);
    selectedCategory.value = ""; // Reset selection
  }
});

// Xử lý xóa danh mục đã chọn
const removeCategory = (id: number) => {
  const index = form.category_ids.indexOf(id);
  if (index !== -1) {
    form.category_ids.splice(index, 1);
  }
};

const resetForm = () => {
  form.name = "";
  form.price = 0;
  form.stock = 0;
  form.description = "";
  form.category_ids = [];
  imagePreviews.value = [];
  selectedFiles.value = [];
  existingImages.value = [];
  removedImageIndexes.value = [];
  selectedCategory.value = "";
};

// Hàm xử lý URL ảnh cho đúng
const getImageUrl = (path: string): string => {
  console.log("Original image path:", path); // Debug log để xem đường dẫn gốc

  if (!path) {
    console.log("Empty path, using placeholder");
    return "/images/placeholder.png";
  }

  // Nếu đã là URL đầy đủ
  if (path.startsWith("http://") || path.startsWith("https://")) {
    console.log("Full URL detected:", path);
    return path;
  }

  // Nếu bắt đầu bằng /storage
  if (path.startsWith("/storage/")) {
    console.log("Path already has /storage/ prefix");
    const baseUrl = "http://localhost:8000";
    if (baseUrl && !path.startsWith(baseUrl)) {
      const fullUrl = baseUrl + path;
      console.log("Added base URL:", fullUrl);
      return fullUrl;
    }

    return path;
  }
  if (path.startsWith("storage/")) {
    const fixedPath = "/" + path;
    console.log("Fixed storage path:", fixedPath);
    return fixedPath;
  }
  if (!path.startsWith("/")) {
    const fixedPath = "/storage/" + path;
    console.log("Added /storage/ prefix:", fixedPath);
    return fixedPath;
  }
  console.log("Using original path:", path);
  return path;
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  const originalSrc = target.src;
  target.src = "/images/placeholder.png";
  console.error("Image failed to load:", originalSrc);
  setTimeout(() => {
    if (originalSrc.includes("/storage/")) {
      const alternativePath = originalSrc.replace("/storage/", "/");
      console.log("Trying alternative path:", alternativePath);
    }
  }, 100);
};

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      form.name = newProduct.name;
      form.price = newProduct.price;
      form.stock = newProduct.stock;
      form.description = newProduct.description || "";
      form.category_ids = newProduct.categories?.map((cat) => cat.id) || [];
      console.log("Product images data:", newProduct.images);
      if (newProduct.images && Array.isArray(newProduct.images)) {
        existingImages.value = [...newProduct.images];
        console.log("Set existing images:", existingImages.value);
      } else if (typeof newProduct.images === "string") {
        try {
          const parsedImages = JSON.parse(newProduct.images);
          existingImages.value = Array.isArray(parsedImages)
            ? parsedImages
            : [];
          console.log("Parsed images from string:", existingImages.value);
        } catch (e) {
          existingImages.value = [newProduct.images];
          console.log("Set single image from string:", existingImages.value);
        }
      } else {
        existingImages.value = [];
        console.log("No images found");
      }

      removedImageIndexes.value = [];
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Methods của bạn
const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = "";
  });

  // Validate name
  if (!form.name.trim()) {
    errors.name = "Tên sản phẩm là bắt buộc";
    isValid = false;
  }

  // Validate price
  if (form.price < 0) {
    errors.price = "Giá không được âm";
    isValid = false;
  }

  // Validate stock
  if (form.stock < 0) {
    errors.stock = "Tồn kho không được âm";
    isValid = false;
  }

  return isValid;
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const files = target.files;
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!file.type.startsWith("image/")) {
      errors.images = "Chỉ chấp nhận file hình ảnh";
      continue;
    }

    if (file.size > MAX_SIZE) {
      errors.images = "Kích thước file không được vượt quá 2MB";
      continue;
    }

    selectedFiles.value.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  // Reset input so the same file can be selected again
  target.value = "";
};

const removeSelectedImage = (index: number) => {
  imagePreviews.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};

const removeExistingImage = (index: number) => {
  removedImageIndexes.value.push(index);
  existingImages.value.splice(index, 1);
};

const prepareFormData = () => {
  const formData = new FormData();

  // Basic fields
  formData.append("name", form.name || '');
  
  // Kiểm tra và đảm bảo price và stock là số hợp lệ trước khi gọi toString()
  const price = form.price !== undefined && form.price !== null ? form.price : 0;
  const stock = form.stock !== undefined && form.stock !== null ? form.stock : 0;
  
  formData.append("price", price.toString());
  formData.append("stock", stock.toString());

  if (form.description) {
    formData.append("description", form.description);
  }
  if (form.category_ids && form.category_ids.length > 0) {
    form.category_ids.forEach((id, index) => {
      if (id !== undefined && id !== null) {
        formData.append(`category_ids[${index}]`, id.toString());
      }
    });
  }
  if (selectedFiles.value && selectedFiles.value.length > 0) {
    selectedFiles.value.forEach((file) => {
      formData.append("images[]", file);
    });
  }
  if (removedImageIndexes.value && removedImageIndexes.value.length > 0) {
    formData.append(
      "removed_images",
      JSON.stringify(removedImageIndexes.value)
    );
  }

  return formData;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const formData = prepareFormData();

    // Add method if updating
    if (props.product) {
      formData.append("_method", "PUT");
    }

    emit("submit", formData);
  } catch (error) {
    console.error("Form submission error:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.category-select-container {
  @apply w-full rounded-lg border border-gray-200 bg-white p-2 transition-all;
  @apply hover:border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-opacity-50;
}

.selected-categories {
  @apply flex flex-wrap gap-1.5 mb-3;
}

.badge.badge-primary {
  @apply py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all shadow-sm;
  @apply hover:shadow-md;
}

.btn-close {
  @apply bg-transparent border-0 p-0 ml-1.5 text-white/90 hover:text-white focus:outline-none;
  @apply transition-transform hover:scale-110;
}

/* Mô tả sản phẩm */
.textarea-bordered {
  @apply transition-all duration-300 resize-none;
  @apply focus:border-primary focus:ring-1 focus:ring-primary focus:ring-opacity-50;
  line-height: 1.6;
}

.textarea-bordered:focus {
  @apply shadow-sm;
}

/* Thêm highlight cho label khi input được focus */
.form-control:focus-within .label-text {
  @apply text-primary transition-colors duration-300;
}

/* Tạo gợn sóng khi hover vào textarea */
.textarea-bordered:hover:not(:focus) {
  @apply border-gray-300;
}

/* Tùy chỉnh badge categories */
.badge.badge-primary {
  @apply flex items-center;
}

/* Animation cho badge khi thêm mới */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selected-categories .badge {
  animation: fadeIn 0.3s ease-out;
}

/* Custom select dropdown */
select.select-bordered {
  @apply bg-white cursor-pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

/* Count cho characters trong mô tả */
.description-wrapper {
  @apply relative;
}

.char-count {
  @apply absolute bottom-2 right-2 text-xs text-gray-400;
  @apply transition-opacity opacity-0;
}

.textarea-bordered:focus + .char-count {
  @apply opacity-100;
}

/* Đường viền nhẹ dưới các label */
.label {
  @apply border-b border-gray-50 mb-1;
}

/* CSS cho tooltip chỉ dẫn */
.info-tooltip {
  @apply relative inline-block ml-1 text-gray-400 cursor-help;
}

.info-tooltip:hover .tooltip-text {
  @apply visible opacity-100;
}

.tooltip-text {
  @apply invisible absolute z-10 w-64 bg-gray-800 text-white text-xs rounded p-2 -mt-1 ml-2 opacity-0;
  @apply transition-opacity duration-300;
}

/* Image preview section */
.image-preview-card {
  @apply border rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-200;
  @apply hover:shadow-md;
}

.image-container {
  @apply relative h-32 w-full bg-gray-50 flex items-center justify-center;
}

.preview-image {
  @apply w-full h-full object-cover;
}

.image-overlay {
  @apply absolute inset-0 bg-black bg-opacity-40 opacity-0 transition-opacity duration-200;
  @apply flex items-center justify-center;
}

.image-label {
  @apply text-xs text-center py-1.5 bg-gray-50 border-t text-gray-600;
}

/* Error state */
img.border-red-500 {
  @apply border-2;
}
</style>
