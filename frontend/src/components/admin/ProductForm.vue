<template>
  <form @submit.prevent="submitForm" class="p-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Tên sản phẩm <span class="text-error">*</span></span>
        </label>
        <input
          v-model="form.name"
          type="text"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.name }"
          required
        />
        <span v-if="errors.name" class="text-error text-xs mt-1">{{ errors.name }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Giá (VND) <span class="text-error">*</span></span>
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
        <span v-if="errors.price" class="text-error text-xs mt-1">{{ errors.price }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Tồn kho <span class="text-error">*</span></span>
        </label>
        <input
          v-model.number="form.stock"
          type="number"
          class="input input-bordered w-full"
          :class="{ 'input-error': errors.stock }"
          min="0"
          required
        />
        <span v-if="errors.stock" class="text-error text-xs mt-1">{{ errors.stock }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Danh mục</span>
        </label>
        <select
          v-model="form.category_ids"
          multiple
          class="select select-bordered w-full"
          :class="{ 'select-error': errors.category_ids }"
        >
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <span class="text-xs text-gray-500 mt-1">
          Giữ phím Ctrl để chọn nhiều danh mục
        </span>
        <span v-if="errors.category_ids" class="text-error text-xs mt-1">{{ errors.category_ids }}</span>
      </div>

      <div class="form-control w-full md:col-span-2">
        <label class="label">
          <span class="label-text">Mô tả sản phẩm</span>
        </label>
        <textarea
          v-model="form.description"
          class="textarea textarea-bordered h-24"
          :class="{ 'textarea-error': errors.description }"
        ></textarea>
        <span v-if="errors.description" class="text-error text-xs mt-1">{{ errors.description }}</span>
      </div>

      <div class="form-control w-full md:col-span-2">
        <label class="label">
          <span class="label-text">Hình ảnh sản phẩm</span>
        </label>
        <div class="flex items-center">
          <label class="btn btn-outline">
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
            {{ selectedFiles.length }} ảnh đã chọn
          </span>
        </div>
        <span v-if="errors.images" class="text-error text-xs mt-1">{{ errors.images }}</span>
      </div>
    </div>

    <!-- Image preview section -->
    <div v-if="imagePreviews.length > 0 || existingImages.length > 0" class="mt-4">
      <h3 class="font-medium mb-2">Hình ảnh đã chọn:</h3>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- New images -->
        <div
          v-for="(preview, index) in imagePreviews"
          :key="`new-${index}`"
          class="relative group"
        >
          <img
            :src="preview"
            class="h-32 w-full object-cover rounded border"
            alt="Preview"
          />
          <button
            type="button"
            @click="removeSelectedImage(index)"
            class="absolute top-1 right-1 bg-error hover:bg-opacity-100 bg-opacity-70 text-white rounded-full p-1"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Existing images (when editing) -->
        <div
          v-for="(image, index) in existingImages"
          :key="`existing-${index}`"
          class="relative group"
        >
          <img
            :src="image"
            class="h-32 w-full object-cover rounded border"
            alt="Product"
          />
          <button
            type="button"
            @click="removeExistingImage(index)"
            class="absolute top-1 right-1 bg-error hover:bg-opacity-100 bg-opacity-70 text-white rounded-full p-1"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <button
        type="button"
        class="btn btn-outline"
        @click="$emit('cancel')"
      >
        Hủy
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="loading loading-spinner loading-xs mr-2"></span>
        {{ product ? 'Cập nhật' : 'Thêm mới' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';

// Props
const props = defineProps({
  product: {
    type: Object as () => Product | null,
    default: null
  },
  categories: {
    type: Array as () => Category[],
    default: () => []
  }
});

// Emits
const emit = defineEmits(['submit', 'cancel']);

// State
const form = reactive({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  category_ids: [] as number[]
});

const imagePreviews = ref<string[]>([]);
const existingImages = ref<string[]>([]);
const selectedFiles = ref<File[]>([]);
const removedImageIndexes = ref<number[]>([]);
const isSubmitting = ref(false);
const errors = reactive({
  name: '',
  price: '',
  stock: '',
  description: '',
  category_ids: '',
  images: ''
});

const resetForm = () => {
  form.name = '';
  form.price = 0;
  form.stock = 0;
  form.description = '';
  form.category_ids = [];
  imagePreviews.value = [];
  selectedFiles.value = [];
  existingImages.value = [];
  removedImageIndexes.value = [];
};

// Initialize form when editing
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.name = newProduct.name;
    form.price = newProduct.price;
    form.stock = newProduct.stock;
    form.description = newProduct.description || '';
    form.category_ids = newProduct.categories.map(cat => cat.id);
    existingImages.value = [...(newProduct.images || [])];
    removedImageIndexes.value = [];
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods


const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Tên sản phẩm là bắt buộc';
    isValid = false;
  }
  
  // Validate price
  if (form.price < 0) {
    errors.price = 'Giá không được âm';
    isValid = false;
  }
  
  // Validate stock
  if (form.stock < 0) {
    errors.stock = 'Tồn kho không được âm';
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
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.images = 'Chỉ chấp nhận file hình ảnh';
      continue;
    }
    
    // Check file size
    if (file.size > MAX_SIZE) {
      errors.images = 'Kích thước file không được vượt quá 2MB';
      continue;
    }
    
    selectedFiles.value.push(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
  
  // Reset input so the same file can be selected again
  target.value = '';
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
  formData.append('name', form.name);
  formData.append('price', form.price.toString());
  formData.append('stock', form.stock.toString());
  
  if (form.description) {
    formData.append('description', form.description);
  }
  
  // Categories
  if (form.category_ids.length > 0) {
    form.category_ids.forEach((id, index) => {
      formData.append(`category_ids[${index}]`, id.toString());
    });
  }
  
  // New images
  selectedFiles.value.forEach(file => {
    formData.append('images[]', file);
  });
  
  // Removed images
  if (removedImageIndexes.value.length > 0) {
    formData.append('removed_images', JSON.stringify(removedImageIndexes.value));
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
      formData.append('_method', 'PUT');
    }
    
    emit('submit', formData);
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>