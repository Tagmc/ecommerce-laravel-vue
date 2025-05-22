<!-- frontend/src/pages/admin/User/UserManager.vue -->
<template>
  <div class="user-manager">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Quản lý người dùng</h1>
      <button @click="openAddUserModal" class="btn btn-primary">
        <i class="fas fa-plus mr-2"></i> Thêm người dùng
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
            placeholder="Tên hoặc email..."
            @input="debouncedSearch"
          />
        </div>

        <div>
          <label class="form-label">Vai trò</label>
          <select
            v-model="filters.role"
            class="select select-bordered w-full"
            @change="applyFilters"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
        </div>

        <div>
          <label class="form-label">Sắp xếp theo</label>
          <div class="flex space-x-2">
            <select
              v-model="filters.sort_by"
              class="select select-bordered flex-1"
              @change="applyFilters"
            >
              <option value="created_at">Ngày tạo</option>
              <option value="name">Tên</option>
              <option value="email">Email</option>
            </select>
            <select
              v-model="filters.sort_direction"
              class="select select-bordered w-24"
              @change="applyFilters"
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
      <button @click="fetchUsers" class="btn btn-sm btn-outline">
        Thử lại
      </button>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="hover">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  class="badge"
                  :class="
                    user.role === 'admin' ? 'badge-primary' : 'badge-secondary'
                  "
                >
                  {{ user.role === "admin" ? "Quản trị viên" : "Người dùng" }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td class="text-right">
                <button
                  @click="editUser(user)"
                  class="btn btn-sm btn-outline btn-info mr-2"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDeleteUser(user)"
                  class="btn btn-sm btn-outline btn-error"
                  :disabled="user.id === currentUserId"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="text-center py-10 text-gray-500">
                Không có người dùng nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="pagination.totalPages > 1"
        class="flex justify-center py-4 space-x-1"
      >
        <button
          @click="goToPage(pagination.currentPage - 1)"
          class="btn btn-sm btn-outline"
          :disabled="pagination.currentPage <= 1"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button
          v-for="page in generatePageNumbers()"
          :key="page"
          @click="goToPage(page)"
          class="btn btn-sm"
          :class="{
            'btn-active': page === pagination.currentPage,
            'btn-outline': page !== pagination.currentPage,
            'btn-disabled': page < 0,
          }"
        >
          {{ page > 0 ? page : "..." }}
        </button>
        <button
          @click="goToPage(pagination.currentPage + 1)"
          class="btn btn-sm btn-outline"
          :disabled="pagination.currentPage >= pagination.totalPages"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div class="modal" :class="{ 'modal-open': showUserModal }">
      <div
        class="modal-box max-w-md p-0 overflow-hidden bg-white rounded-lg shadow-xl"
      >
        <!-- Modal header with gradient background -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
          <h3 class="text-xl font-bold">
            {{ selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới" }}
          </h3>
          <p class="text-sm text-blue-100 mt-1">
            {{
              selectedUser
                ? "Cập nhật thông tin tài khoản"
                : "Tạo tài khoản người dùng mới"
            }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="p-5">
          <!-- Name field -->
          <div class="form-group mb-4">
            <label class="form-label flex items-center mb-1.5">
              <i class="fas fa-user text-gray-500 mr-2"></i>
              <span>Họ và tên</span>
            </label>
            <div class="relative">
              <input
                v-model="form.name"
                type="text"
                class="input input-bordered w-full pl-3 pr-8 py-2.5 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                :class="
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                "
                placeholder="Nhập họ và tên"
                required
              />
              <div
                v-if="errors.name"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
              >
                <i class="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div v-if="errors.name" class="text-red-500 text-sm mt-1.5">
              {{ errors.name }}
            </div>
          </div>

          <!-- Email field -->
          <div class="form-group mb-4">
            <label class="form-label flex items-center mb-1.5">
              <i class="fas fa-envelope text-gray-500 mr-2"></i>
              <span>Email</span>
            </label>
            <div class="relative">
              <input
                v-model="form.email"
                type="email"
                class="input input-bordered w-full pl-3 pr-8 py-2.5 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                :class="
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                "
                placeholder="example@domain.com"
                required
              />
              <div
                v-if="errors.email"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
              >
                <i class="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div v-if="errors.email" class="text-red-500 text-sm mt-1.5">
              {{ errors.email }}
            </div>
          </div>

          <!-- Password field -->
          <div class="form-group mb-4">
            <label class="form-label flex items-center mb-1.5">
              <i class="fas fa-key text-gray-500 mr-2"></i>
              <span>
                Mật khẩu
                <span
                  v-if="selectedUser"
                  class="text-sm text-gray-500 font-normal"
                >
                  (để trống nếu không thay đổi)
                </span>
              </span>
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                type="password"
                class="input input-bordered w-full pl-3 pr-8 py-2.5 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                :class="
                  errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                "
                placeholder="••••••••"
                :required="!selectedUser"
              />
              <div
                v-if="errors.password"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
              >
                <i class="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div v-if="errors.password" class="text-red-500 text-sm mt-1.5">
              {{ errors.password }}
            </div>
            <div v-else class="text-gray-500 text-xs mt-1">
              Mật khẩu phải có ít nhất 6 ký tự
            </div>
          </div>

          <!-- Role field -->
          <div class="form-group mb-5">
            <label class="form-label flex items-center mb-1.5">
              <i class="fas fa-user-tag text-gray-500 mr-2"></i>
              <span>Vai trò</span>
            </label>
            <div class="relative">
              <select
                v-model="form.role"
                class="select select-bordered w-full pl-3 pr-8 py-2.5 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                :class="
                  errors.role
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                "
                required
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <div
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              >
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
            <div v-if="errors.role" class="text-red-500 text-sm mt-1.5">
              {{ errors.role }}
            </div>
          </div>

          <!-- Form actions -->
          <div
            class="flex items-center justify-between pt-2 border-t border-gray-200"
          >
            <button
              type="button"
              @click="closeUserModal"
              class="btn btn-outline border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-white"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              <i
                v-else
                :class="selectedUser ? 'fas fa-save mr-2' : 'fas fa-plus mr-2'"
              ></i>
              {{ selectedUser ? "Cập nhật" : "Thêm mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete User Modal -->
    <div class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Xác nhận xóa</h3>
        <p class="py-4">
          Bạn có chắc chắn muốn xóa người dùng "{{ userToDelete?.name }}"?
          <br />
          Hành động này không thể hoàn tác.
        </p>
        <div class="modal-action">
          <button @click="cancelDelete" class="btn">Hủy</button>
          <button
            @click="deleteUserConfirm"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import type { User, UserFormData, UserFilters } from "../../../types/user";

// Store
const store = useStore();

// Refs
const showUserModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const isSubmitting = ref(false);
const isDeleting = ref(false);

// Form
const form = reactive<UserFormData>({
  name: "",
  email: "",
  password: "",
  role: "user",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  role: "",
});

// Current User ID (to prevent self-deletion)
const currentUserId = computed(() => store.getters["auth/user"]?.id);

// Filters
const filters = ref<UserFilters>({
  search: "",
  role: "",
  sort_by: "created_at",
  sort_direction: "desc",
  page: 1,
  per_page: 10,
});

// Computed
const users = computed(() => store.getters["user/allUsers"]);
const isLoading = computed(() => store.getters["user/isLoading"]);
const error = computed(() => store.getters["user/error"]);
const pagination = computed(() => store.getters["user/pagination"]);

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleString("vi-VN");
};

const debouncedSearch = (() => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      filters.value.page = 1;
      fetchUsers();
    }, 500);
  };
})();

const applyFilters = () => {
  filters.value.page = 1;
  fetchUsers();
};



const fetchUsers = async () => {
  try {
    await store.dispatch("user/fetchUsers", filters.value);
  } catch (error: any) {
    toast.error(
      error.message || "Không thể tải danh sách người dùng. Vui lòng thử lại."
    );
  }
};

const goToPage = (page: number) => {
  if (page > 0 && page <= pagination.value.totalPages) {
    filters.value.page = page;
    fetchUsers();
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
    pages.push(-2); // Dots
  }

  pages.push(totalPages);

  return pages;
};

const resetForm = () => {
  form.name = "";
  form.email = "";
  form.password = "";
  form.role = "user";

  errors.name = "";
  errors.email = "";
  errors.password = "";
  errors.role = "";
};

const openAddUserModal = () => {
  selectedUser.value = null;
  resetForm();
  showUserModal.value = true;
};

const editUser = (user: User) => {
  selectedUser.value = user;
  form.name = user.name;
  form.email = user.email;
  form.password = ""; // Don't fill password when editing
  form.role = user.role;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  setTimeout(resetForm, 300); // Reset after animation
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.name = "";
  errors.email = "";
  errors.password = "";
  errors.role = "";

  if (!form.name.trim()) {
    errors.name = "Tên là bắt buộc";
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc";
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Email không hợp lệ";
    isValid = false;
  }

  if (!selectedUser.value && !form.password) {
    errors.password = "Mật khẩu là bắt buộc";
    isValid = false;
  } else if (form.password && form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    isValid = false;
  }

  if (!form.role) {
    errors.role = "Vai trò là bắt buộc";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const userData: UserFormData = {
      name: form.name,
      email: form.email,
      role: form.role as "admin" | "user",
    };

    // Only include password if it's provided (for update) or required (for create)
    if (form.password) {
      userData.password = form.password;
    }

    if (selectedUser.value) {
      await store.dispatch("user/updateUser", {
        id: selectedUser.value.id,
        data: userData,
      });
      toast.success("Cập nhật người dùng thành công");
      closeUserModal();
      fetchUsers();
    } else {
      await store.dispatch("user/createUser", userData);
      toast.success("Thêm người dùng mới thành công");
      closeUserModal();
      fetchUsers();
    }
  } catch (error: any) {
    console.error("Error:", error);
    let errorMessage = "Có lỗi xảy ra";
    
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      if (error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        
        if (backendErrors.name && backendErrors.name.length > 0) {
          errors.name = backendErrors.name[0];
        }
        
        if (backendErrors.email && backendErrors.email.length > 0) {
          errors.email = backendErrors.email[0];
        }
        
        if (backendErrors.password && backendErrors.password.length > 0) {
          errors.password = backendErrors.password[0];
        }
        
        if (backendErrors.role && backendErrors.role.length > 0) {
          errors.role = backendErrors.role[0];
        }
        errorMessage = "Vui lòng kiểm tra lại thông tin đã nhập";
      }
    }
    toast.error(errorMessage);
    await fetchUsers();
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDeleteUser = (user: User) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  userToDelete.value = null;
  showDeleteModal.value = false;
};

const deleteUserConfirm = async () => {
  if (!userToDelete.value) return;

  isDeleting.value = true;
  try {
    await store.dispatch("user/deleteUser", userToDelete.value.id);
    toast.success("Xóa người dùng thành công");
    cancelDelete();
    fetchUsers();
  } catch (error: any) {
    toast.error(error.message || "Không thể xóa người dùng");
  } finally {
    isDeleting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchUsers();
});
</script>
<style scoped>
.form-label {
  @apply text-sm font-medium text-gray-700;
}

.form-group {
  @apply transition-all duration-200;
}

.form-group:focus-within .form-label {
  @apply text-blue-600;
}

/* Thêm hiệu ứng khi hover vào các input */
.input:hover, .select:hover {
  @apply border-gray-400;
}

/* Hiệu ứng khi focus */
.input:focus, .select:focus {
  @apply border-blue-500 ring-2 ring-blue-100;
}

/* Modal animation */
.modal-box {
  animation: modal-slide-down 0.3s ease-out;
}

@keyframes modal-slide-down {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
