<template>
  <div class="min-h-screen bg-base-200 px-4 py-6">
    <div class="navbar bg-base-100 shadow-md rounded-xl mb-6 px-6">
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-primary">🎛️ Quản trị hệ thống</h1>
      </div>
      <div class="flex-none">
        <button @click="handleLogout" class="btn btn-error btn-sm">Đăng xuất</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-md rounded-xl mb-8 p-6">
      <h2 class="text-xl font-bold mb-2 text-neutral-content">👋 Xin chào, {{ user?.name }}!</h2>
      <p class="text-sm">📧 Email: <span class="font-medium">{{ user?.email }}</span></p>
      <p class="text-sm">🧑‍💼 Vai trò: <span class="badge badge-info">{{ user?.role }}</span></p>
    </div>

    <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <router-link
        to="/admin/products"
        class="card bg-primary text-primary-content p-6 shadow-xl hover:scale-[1.02] transition-transform duration-200 rounded-2xl"
      >
        <div class="flex items-center gap-4">
          <div class="text-3xl">🛒</div>
          <div>
            <h3 class="text-lg font-semibold">Quản lý sản phẩm</h3>
            <p class="text-sm opacity-80">Tạo, sửa, xóa và xem sản phẩm</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/admin/categories"
        class="card bg-secondary text-secondary-content p-6 shadow-xl hover:scale-[1.02] transition-transform duration-200 rounded-2xl"
      >
        <div class="flex items-center gap-4">
          <div class="text-3xl">📂</div>
          <div>
            <h3 class="text-lg font-semibold">Quản lý danh mục</h3>
            <p class="text-sm opacity-80">Tạo và chỉnh sửa danh mục</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/admin/users"
        class="card bg-accent text-accent-content p-6 shadow-xl hover:scale-[1.02] transition-transform duration-200 rounded-2xl"
      >
        <div class="flex items-center gap-4">
          <div class="text-3xl">👥</div>
          <div>
            <h3 class="text-lg font-semibold">Quản lý người dùng</h3>
            <p class="text-sm opacity-80">Xem và phân quyền người dùng</p>
          </div>
        </div>
      </router-link>

      <router-link
        to="/admin/orders"
        class="card bg-warning text-warning-content p-6 shadow-xl hover:scale-[1.02] transition-transform duration-200 rounded-2xl"
      >
        <div class="flex items-center gap-4">
          <div class="text-3xl">📦</div>
          <div>
            <h3 class="text-lg font-semibold">Quản lý đơn hàng</h3>
            <p class="text-sm opacity-80">Xử lý và theo dõi đơn hàng</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import type { User, ErrorResponse } from '../../types/auth';

const store = useStore();
const router = useRouter();
const user = store.getters['auth/user'] as User | null;

const handleLogout = async () => {
  try {
    await store.dispatch('auth/logout');
    router.push('/login');
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || { message: 'Đăng xuất thất bại' };
    toast.error(errorResponse.message);
  }
};
</script>
