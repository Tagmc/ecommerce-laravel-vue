<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-primary tracking-tight mb-2">Quản lý danh mục</h1>
        <div class="h-1 w-24 bg-primary mx-auto rounded-full"></div>
      </div>
      <div 
        class="bg-white rounded-xl shadow-lg p-6 mb-8"
        @click="resetForm"
      >
        <button 
          @click="openModal" 
          class="btn btn-primary text-white w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr class="bg-primary text-white">
                <th class="py-4 px-6 text-left font-semibold">#</th>
                <th class="py-4 px-6 text-left font-semibold">Tên danh mục</th>
                <th class="py-4 px-6 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(cat, index) in categories" 
                :key="cat.id" 
                class="border-b border-gray-100 hover:bg-gray-50 transition duration-200"
              >
                <td class="py-4 px-6">{{ index + 1 }}</td>
                <td class="py-4 px-6 font-medium">{{ cat.name }}</td>
                <td class="py-3 px-6">
                  <div class="flex justify-center gap-3">
                    <button
                      class="btn btn-sm btn-info text-white rounded-md flex items-center gap-1 hover:shadow-md transition-all"
                      @click="openEditModal(cat)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      class="btn btn-sm btn-error text-white rounded-md flex items-center gap-1 hover:shadow-md transition-all"
                      @click="openDeleteModal(cat.id)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colspan="3" class="py-8 text-center text-gray-500">
                  Chưa có danh mục nào. Vui lòng thêm mới!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal" :class="{ 'modal-open': showCategoryModal }">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}
          </h3>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Tên danh mục</span>
            </label>
            <input 
              v-model="categoryName" 
              type="text" 
              placeholder="Nhập tên danh mục" 
              class="input input-bordered w-full" 
              @keyup.enter="submitCategory"
            />
          </div>
          <div class="modal-action">
            <button 
              @click="showCategoryModal = false" 
              class="btn btn-outline"
            >
              Hủy
            </button>
            <button 
              @click="submitCategory" 
              class="btn btn-primary"
              :disabled="!categoryName.trim()"
            >
              {{ editingId ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
      <div class="modal" :class="{ 'modal-open': showDeleteModal }">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.</p>
          <div class="modal-action">
            <button @click="showDeleteModal = false" class="btn btn-outline">Hủy</button>
            <button @click="deleteCat" class="btn btn-error text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa danh mục
            </button>
          </div>
        </div>
        <div class="modal-backdrop" @click="showDeleteModal = false"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../apis/category";
import type { Category } from "../../../types/category";
import { toast } from "vue3-toastify";

const categories = ref<Category[]>([]);
const categoryName = ref("");
const editingId = ref<number | null>(null);
const showCategoryModal = ref(false);
const showDeleteModal = ref(false);
const deletingId = ref<number | null>(null);

const fetchCategories = async () => {
  try {
    const res = await getCategories();
    categories.value = res.data;
  } catch (err) {
    toast.error("Lỗi khi tải danh sách danh mục");
  }
};

const resetForm = () => {
  categoryName.value = "";
  editingId.value = null;
};

const openModal = () => {
  resetForm();
  showCategoryModal.value = true;
};

const openEditModal = (cat: Category) => {
  categoryName.value = cat.name;
  editingId.value = cat.id;
  showCategoryModal.value = true;
};

const submitCategory = async () => {
  try {
    if (!categoryName.value.trim()) {
      toast.warning("Vui lòng nhập tên danh mục");
      return;
    }

    if (editingId.value) {
      await updateCategory(editingId.value, { name: categoryName.value });
      toast.success("Cập nhật danh mục thành công");
    } else {
      await createCategory({ name: categoryName.value });
      toast.success("Thêm danh mục mới thành công");
    }

    categoryName.value = "";
    editingId.value = null;
    showCategoryModal.value = false;
    await fetchCategories();
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
  }
};

const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const deleteCat = async () => {
  if (!deletingId.value) return;
  
  try {
    await deleteCategory(deletingId.value);
    toast.success("Xóa danh mục thành công");
    await fetchCategories();
    showDeleteModal.value = false;
  } catch (err) {
    toast.error("Lỗi khi xóa danh mục");
  }
};

onMounted(fetchCategories);
</script>