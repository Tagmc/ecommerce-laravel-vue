<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="min-h-screen flex bg-base-200">
    <!-- Sidebar -->
    <aside class="w-64 bg-base-100 shadow-md p-4">
      <h2 class="text-xl font-bold mb-6 text-primary">📋 Quản trị</h2>
      <nav class="flex flex-col gap-2">
        <router-link to="/home" class="btn btn-ghost  mt-6 justify-start">
          🏠 Về trang chính
        </router-link>
        <router-link
          to="/admin/dashboard"
          class="btn btn-ghost justify-start"
          :class="{ 'btn-active': isActive('/admin/dashboard') }"
        >
          🎛️ Tổng quan
        </router-link>
        <router-link
          to="/admin/products"
          class="btn btn-ghost justify-start"
          :class="{ 'btn-active': isActive('/admin/products') }"
        >
          🛒 Sản phẩm
        </router-link>
        <router-link
          to="/admin/categories"
          class="btn btn-ghost justify-start"
          :class="{ 'btn-active': isActive('/admin/categories') }"
        >
          📂 Danh mục
        </router-link>
        <router-link
          to="/admin/users"
          class="btn btn-ghost justify-start"
          :class="{ 'btn-active': isActive('/admin/users') }"
        >
          👥 Người dùng
        </router-link>
        <router-link
          to="/admin/orders"
          class="btn btn-ghost justify-start"
          :class="{ 'btn-active': isActive('/admin/orders') }"
        >
          📦 Đơn hàng
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path: string) => {
  return route.path.startsWith(path);
};
</script>
