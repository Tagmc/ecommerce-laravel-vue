<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-100">
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center"
      >
        <router-link to="/home" class="text-3xl font-extrabold text-primary"
          >ShopX</router-link
        >
        <div class="flex items-center gap-3">
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="btn btn-outline btn-primary"
            >Đăng nhập</router-link
          >
          <router-link
            v-if="!isAuthenticated"
            to="/register"
            class="btn btn-primary"
            >Đăng ký</router-link
          >

          <div v-if="isAuthenticated" class="flex items-center gap-2">
            <span class="font-medium">👤 {{ user?.name }}</span>
            <button @click="handleLogout" class="btn btn-error">
              Đăng xuất
            </button>
            <!-- Hiển thị nút đi tới dashboard nếu là admin -->
            <router-link
              v-if="isAuthenticated && isAdmin"
              to="/admin/dashboard"
              class="btn btn-primary"
              >Quản lý Dashboard</router-link
            >
          </div>
        </div>
      </div>
    </header>

    <section
      class="relative h-[500px] bg-[url('/hero.jpg')] bg-cover bg-center flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>
      <div class="relative text-white text-center px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          Khám phá hàng ngàn sản phẩm chất lượng
        </h1>
        <p class="text-lg md:text-xl mb-6">
          Mua sắm dễ dàng, giá hợp lý, giao hàng tận nơi 💖
        </p>
        <router-link to="/" class="btn btn-accent text-white text-lg"
          >Bắt đầu mua sắm</router-link
        >
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12">Sản phẩm nổi bật</h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
        >
          <img
            :src="`/product-${i}.jpg`"
            alt="Product"
            class="h-48 w-full object-cover"
          />
          <div class="p-4">
            <h3 class="font-semibold text-lg">Sản phẩm {{ i }}</h3>
            <p class="text-sm text-gray-500 mb-4">
              Mô tả ngắn gọn về sản phẩm siêu hot!
            </p>
            <button class="btn btn-sm btn-primary w-full">Xem chi tiết</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-base-200 text-gray-600 text-center py-6 mt-12">
      <p>
        © 2025 <span class="font-semibold text-primary">ShopX</span>. All rights
        reserved.
      </p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { toast } from "vue3-toastify";
import type { ErrorResponse } from "../../types/auth";
import { computed } from "vue";
const store = useStore();
const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
const user = computed(() => store.getters["auth/user"]);
const isAdmin = computed(() => store.getters["auth/isAdmin"]);

const handleLogout = async () => {
  try {
    await store.dispatch("auth/logout");
    toast.success("Đăng xuất thành công");
  } catch (error: any) {
    const errorResponse: ErrorResponse = error.response?.data || {
      message: "Đăng xuất thất bại",
    };
    toast.error(errorResponse.message);
  }
};
</script>
