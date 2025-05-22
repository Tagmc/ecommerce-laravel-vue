<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center"
      >
        <div class="flex items-center">
          <router-link to="/home" class="text-3xl font-extrabold text-primary"
            >ShopX</router-link
          >

          <!-- Navbar -->
          <nav class="hidden md:flex ml-8 space-x-6">
            <router-link
              to="/home"
              class="text-gray-700 hover:text-primary font-medium"
              >Trang chủ</router-link
            >
            <router-link
              to="/products"
              class="text-gray-700 hover:text-primary font-medium"
              >Sản phẩm</router-link
            >
            <div class="relative group">
              <button
                class="text-gray-700 hover:text-primary font-medium flex items-center"
              >
                Danh mục
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <div
                class="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 mt-1 w-48 bg-white rounded-md shadow-lg z-20"
              >
                <div class="py-2 px-3">
                  <router-link
                    v-for="category in categories"
                    :key="category.id"
                    :to="`/products?category=${category.id}`"
                    class="block py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md px-2"
                  >
                    {{ category.name }}
                  </router-link>
                  <div
                    v-if="categories?.length === 0"
                    class="py-2 text-sm text-gray-500 italic"
                  >
                    Đang tải danh mục...
                  </div>
                </div>
              </div>
            </div>
            <router-link
              to="/contact"
              class="text-gray-700 hover:text-primary font-medium"
              >Liên hệ</router-link
            >
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <!-- Cart button with count -->
          <router-link to="/cart" class="relative mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 text-gray-700 hover:text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartItemCount }}
            </span>
          </router-link>

          <!-- User menu -->
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn-outline btn-primary btn-sm"
              >Đăng nhập</router-link
            >
            <router-link to="/register" class="btn btn-primary btn-sm"
              >Đăng ký</router-link
            >
          </template>

          <div v-else class="relative dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <img
                  src="/images/user-avatar.avif"
                  alt="User"
                  @error="useDefaultAvatar"
                />
              </div>
            </label>
            <ul
              tabindex="0"
              class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li class="menu-title">
                <span class="font-medium text-sm">{{ user?.name }}</span>
              </li>
              <li><router-link to="/profile">Tài khoản</router-link></li>
              <li><router-link to="/orders">Đơn hàng</router-link></li>
              <li v-if="isAdmin">
                <router-link to="/admin/dashboard">Quản trị</router-link>
              </li>
              <li>
                <button @click="handleLogout" class="text-error">
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="relative h-[500px] bg-[url('/hero.jpg')] bg-cover bg-center flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>
      <div class="relative text-white text-center px-4 max-w-3xl">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          Khám phá hàng ngàn sản phẩm chất lượng
        </h1>
        <p class="text-lg md:text-xl mb-6">
          Mua sắm dễ dàng, giá hợp lý, giao hàng tận nơi 💖
        </p>

        <!-- Search bar -->
        <div class="relative max-w-xl mx-auto">
          <input
            v-model="searchQuery"
            type="text"
            class="input input-lg w-full pl-4 pr-12 rounded-lg text-gray-800"
            placeholder="Tìm kiếm sản phẩm..."
            @keyup.enter="handleSearch"
          />
          <button
            @click="handleSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 py-16 bg-gray-50 rounded-xl">
      <div class="flex justify-between items-center mb-12">
        <h2 class="text-3xl font-bold">Sản phẩm nổi bật</h2>
        <router-link
          to="/products"
          class="text-primary flex items-center hover:underline"
        >
          Xem tất cả
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </router-link>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="product-card bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
        >
          <div class="relative">
            <router-link :to="`/products/${product.id}`">
              <img
                :src="getProductImageUrl(product.images)"
                :alt="product.name"
                class="h-48 w-full object-cover"
                @error="useDefaultImage"
              />
              <!-- Badge if new -->
              <div
                v-if="isNewProduct(product)"
                class="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded"
              >
                Mới
              </div>
            </router-link>
          </div>

          <div class="p-4">
            <!-- Categories -->
            <div class="mb-2 flex flex-wrap gap-1">
              <span
                v-for="category in product.categories.slice(0, 2)"
                :key="category.id"
                class="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
              >
                {{ category.name }}
              </span>
            </div>

            <router-link :to="`/products/${product.id}`">
              <h3
                class="font-semibold text-lg mb-1.5 hover:text-primary transition"
              >
                {{ product.name }}
              </h3>
            </router-link>

            <p class="text-sm text-gray-500 mb-4 line-clamp-2">
              {{ product.description || "Không có mô tả" }}
            </p>

            <div class="flex justify-between items-center">
              <span class="font-bold text-primary">{{
                formatPrice(product.price)
              }}</span>
              <button 
                @click="addToCart(product)"
                class="px-2 py-2  bg-blue-600 text-white rounded transition-colors hover:bg-blue-700 flex items-center justify-center"
                :disabled="product.stock <= 0 || isAddingToCart[product.id]"
                :class="{'opacity-50 cursor-not-allowed': product.stock <= 0 || isAddingToCart[product.id]}"
              >
                <span v-if="isAddingToCart[product.id]" class="loader-small mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ product.stock <= 0 ? 'Hết hàng' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12">Tại sao chọn ShopX?</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl p-6 shadow-md text-center">
          <div
            class="text-primary mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary bg-opacity-10 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Sản phẩm chất lượng</h3>
          <p class="text-gray-600">
            Chúng tôi cam kết chỉ cung cấp những sản phẩm đạt tiêu chuẩn chất
            lượng cao nhất.
          </p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md text-center">
          <div
            class="text-primary mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary bg-opacity-10 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Giá cả cạnh tranh</h3>
          <p class="text-gray-600">
            Giá cả hợp lý và nhiều chương trình khuyến mãi hấp dẫn dành cho
            khách hàng.
          </p>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-md text-center">
          <div
            class="text-primary mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary bg-opacity-10 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Giao hàng nhanh chóng</h3>
          <p class="text-gray-600">
            Đội ngũ giao hàng chuyên nghiệp, đảm bảo sản phẩm đến tay khách hàng
            trong thời gian sớm nhất.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div
        class="bg-gradient-to-r from-primary to-primary-focus rounded-xl p-8 md:p-12 text-white text-center"
      >
        <h2 class="text-3xl font-bold mb-4">Đăng ký nhận thông tin ưu đãi</h2>
        <p class="text-lg mb-6 max-w-2xl mx-auto">
          Nhận thông báo về các sản phẩm mới và ưu đãi đặc biệt dành riêng cho
          bạn!
        </p>

        <div
          class="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
        >
          <input
            v-model="newsletterEmail"
            type="email"
            placeholder="Email của bạn"
            class="input input-lg w-full sm:max-w-xs text-gray-800"
          />
          <button
            @click="subscribeNewsletter"
            class="btn btn-lg btn-accent text-white"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white pt-12 pb-6">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 class="text-2xl font-bold mb-4">ShopX</h3>
            <p class="text-gray-300 mb-4">
              Mang đến trải nghiệm mua sắm tuyệt vời với hàng ngàn sản phẩm chất
              lượng cao.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4">Sản phẩm</h4>
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/products"
                  class="text-gray-300 hover:text-white"
                  >Tất cả sản phẩm</router-link
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Sản phẩm mới</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Bán chạy nhất</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Khuyến mãi</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4">Thông tin</h4>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Về chúng tôi</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Chính sách bảo mật</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white"
                  >Điều khoản sử dụng</a
                >
              </li>
              <li>
                <a href="#" class="text-gray-300 hover:text-white">Liên hệ</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-4">Liên hệ</h4>
            <ul class="space-y-2">
              <li class="text-gray-300 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                123 Đường ABC, Quận XYZ, TP.HCM
              </li>
              <li class="text-gray-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                0123 456 789
              </li>
              <li class="text-gray-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                support@shopx.com
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>
            © 2025 <span class="font-semibold text-white">ShopX</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import type { Product } from "../../types/product.ts";
import type { Category } from "../../types/category.ts";
import type { User } from "../../types/user.ts";
import { getProductImageUrl } from "../../utils/image.ts";
import { toast } from "vue3-toastify";
const store = useStore();
const router = useRouter();

// State
const searchQuery = ref<string>("");
const newsletterEmail = ref<string>("");

const isLoading = ref<boolean>(false);
const isAddingToCart = reactive<Record<number, boolean>>({});
// Computed properties
const isAuthenticated = computed<boolean>(
  () => store.getters["auth/isAuthenticated"] || false
);
const user = computed<User | null>(() => store.getters["auth/user"] || null);
const isAdmin = computed<boolean>(() => store.getters["auth/isAdmin"] || false);
const categories = computed<Category[]>(
  () => store.getters["category/getAllCategories"] || []
);
const products = computed<Product[]>(
  () => store.getters["product/allProducts"] || []
);
const cartItemCount = computed<number>(
  () => store.getters["cart/cartItemCount"] || 0
);

// Get only 8 featured products (highest price or newest)
const featuredProducts = computed<Product[]>(() => {
  if (!products.value || products.value.length === 0) return [];

  // Sort by newest first and return top 8
  return [...products.value]
    .sort(
      (a: Product, b: Product) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8);
});

// Methods
const handleLogout = async (): Promise<void> => {
  try {
    await store.dispatch("auth/logout");
    toast.success("Đăng xuất thành công");
    router.push("/login");
  } catch (error) {
    toast.error("Đăng xuất thất bại");
  }
};

const useDefaultImage = (event: Event): void => {
  (event.target as HTMLImageElement).src = "/placeholder.png";
};

const useDefaultAvatar = (event: Event): void => {
  (event.target as HTMLImageElement).src = "/default-avatar.png";
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const isNewProduct = (product: Product): boolean => {
  if (!product.created_at) return false;
  const createdDate = new Date(product.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

const getProductCountForCategory = (categoryId: number): number => {
  return products.value.filter((product: Product) =>
    product.categories.some((cat: Category) => cat.id === categoryId)
  ).length;
};

const handleSearch = (): void => {
  if (searchQuery.value.trim()) {
    router.push(
      `/products?search=${encodeURIComponent(searchQuery.value.trim())}`
    );
  }
};

const addToCart = async (product: Product): Promise<void> => {
  if (product.stock <= 0) return; // Không thêm nếu hết hàng
  
  isAddingToCart[product.id] = true;
  
  try {
    await store.dispatch("cart/addToCart", {
      product_id: product.id,
      quantity: 1,
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    toast.error("Không thể thêm sản phẩm vào giỏ hàng");
  } finally {
    isAddingToCart[product.id] = false;
  }
};
const subscribeNewsletter = (): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!newsletterEmail.value) {
    toast.error("Vui lòng nhập email");
    return;
  }

  if (!emailRegex.test(newsletterEmail.value)) {
    toast.error("Email không hợp lệ");
    return;
  }

  toast.success("Đăng ký nhận tin thành công!");
  newsletterEmail.value = "";
};

// Fetch data
const fetchData = async (): Promise<void> => {
  isLoading.value = true;
  try {
    if (categories.value.length === 0) {
      await store.dispatch("category/fetchCategories");
    }
    await store.dispatch("product/fetchProducts", {
      per_page: 8,
      sort: "newest",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Không thể tải dữ liệu, vui lòng thử lại sau");
  } finally {
    isLoading.value = false;
  }
};

// Initialize
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card {
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.category-card {
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}
</style>
