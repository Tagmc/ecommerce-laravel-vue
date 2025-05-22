<template>
  <div class="product-detail-page bg-gray-50 min-h-screen py-12">
    <div class="container mx-auto px-4">
      <!-- Breadcrumbs -->
      <nav class="text-sm mb-8">
        <ol class="flex flex-wrap items-center">
          <li class="flex items-center">
            <router-link to="/home" class="text-gray-500 hover:text-primary transition-colors">
              Trang chủ
            </router-link>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li class="flex items-center">
            <router-link to="/products" class="text-gray-500 hover:text-primary transition-colors">
              Sản phẩm
            </router-link>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li class="text-gray-800 font-medium truncate">
            {{ product?.name || 'Đang tải...' }}
          </li>
        </ol>
      </nav>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p class="text-gray-600">Đang tải thông tin sản phẩm...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-bold mb-3 text-red-600">Không thể tải thông tin sản phẩm</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <router-link to="/products" class="btn btn-primary">
          Quay lại danh sách sản phẩm
        </router-link>
      </div>
      
      <!-- Product detail -->
      <div v-else-if="product" class="lg:flex gap-8">
        <!-- Left column - Images -->
        <div class="lg:w-1/2 mb-8 lg:mb-0">
          <div class="bg-white rounded-xl shadow-sm p-4 overflow-hidden">
            <!-- Main image with zoom effect -->
            <div class="relative overflow-hidden rounded-lg mb-4" ref="imageContainer">
              <div 
                class="aspect-square overflow-hidden bg-gray-50 flex items-center justify-center"
                @mousemove="handleMouseMove"
                @mouseleave="isZoomed = false"
              >
                <img
                  ref="mainImage"
                  :src="currentImage"
                  :alt="product.name"
                  class="w-full h-full object-contain transition-all duration-300"
                  :class="{'cursor-zoom-in': !isZoomed, 'cursor-zoom-out scale-150': isZoomed}"
                  :style="zoomStyle"
                  @error="useDefaultImage"
                />
              </div>
              
              <!-- Label badges -->
              <div class="absolute top-3 left-3 flex flex-col gap-2">
                <span
                  v-if="isNewProduct(product)"
                  class="inline-block text-xs bg-primary text-white rounded-full px-3 py-1 font-bold shadow-sm"
                >
                  Mới
                </span>
                <span
                  v-if="product.stock <= 0"
                  class="inline-block text-xs bg-red-500 text-white rounded-full px-3 py-1 font-bold shadow-sm"
                >
                  Hết hàng
                </span>
                <span
                  v-else-if="product.stock <= 5"
                  class="inline-block text-xs bg-amber-500 text-white rounded-full px-3 py-1 font-bold shadow-sm"
                >
                  Sắp hết
                </span>
              </div>
            </div>
            
            <!-- Image gallery with smooth scrolling -->
            <div class="relative" v-if="product.images?.length > 1">
              <!-- Scroll buttons -->
              <button 
                @click="scrollGallery('left')" 
                class="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1"
                v-show="canScrollLeft"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div class="image-gallery overflow-x-auto hide-scrollbar pb-2" ref="galleryContainer">
                <div class="flex gap-3">
                  <div
                    v-for="(image, index) in product.images"
                    :key="index"
                    class="thumbnail cursor-pointer rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200"
                    :class="{
                      'ring-2 ring-primary ring-offset-2': mainImageIndex === index,
                      'opacity-70 hover:opacity-100': mainImageIndex !== index
                    }"
                    @click="selectImage(index)"
                  >
                    <img
                      :src="getImageUrl(image) || '/images/placeholder.png'"
                      :alt="`${product.name} - ảnh ${index + 1}`"
                      class="w-16 h-16 object-cover"
                      @error="useDefaultImage"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                @click="scrollGallery('right')" 
                class="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1"
                v-show="canScrollRight"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Share section -->
          <div class="mt-6 bg-white rounded-xl shadow-sm p-5">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Chia sẻ sản phẩm:</h3>
            <div class="flex gap-3">
              <button class="social-btn bg-blue-600 hover:bg-blue-700">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button class="social-btn bg-red-600 hover:bg-red-700">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.170 5.009l.37.015c.283.12.74.356 1.012.642.391.41.883 1.198.883 2.767 0 1.436-.684 2.188-1.396 2.859-.214.2-.408.366-.408.53 0 .167.194.329.427.522.599.501 1.426 1.195 1.426 2.741 0 1.384-.821 2.13-1.222 2.452-.616.501-.737.71-.737.991 0 .319.592.854 1.356 1.357 1.655 1.077 2.022 1.726 2.022 3.057 0 2.118-2.245 4.058-5.876 4.058-3.158 0-5.036-1.395-5.036-3.643 0-1.955 1.847-3.688 4.77-3.688.455 0 .952-.065 1.453-.065.588 0 .891.065 1.297-.213-1.827-.11-2.832-.977-2.832-2.376 0-.396.132-.661.323-.948-.195.022-.391.022-.586.022-2.889 0-4.525-2.149-4.525-4.255 0-1.242.455-2.613 1.387-3.599 1.234-1.231 2.714-1.45 3.884-1.45h4.11l-1.272.74H7.17zm4.525 12.475c.153 0 .304-.021.457-.021 1.742-.239 2.883-.944 2.883-2.333 0-1.186-.91-1.905-2.651-3.09-.195-.087-.716-.174-1-.196-.651-.065-1.584-.13-1.888-.13-1.297 0-3.081.318-3.081 2.528 0 1.922 1.888 3.242 5.28 3.242zM10.526 6.675c.391 0 .716.087.958.261.814.545.848 2.048.065 3.425-.392.721-1.071 1.186-1.829 1.186-1.398 0-2.215-1.705-2.215-3.383C7.505 6.85 8.336 6.675 10.526 6.675z" />
                </svg>
              </button>
              <button class="social-btn bg-sky-500 hover:bg-sky-600">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button class="social-btn bg-green-600 hover:bg-green-700">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 448 512">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Right column - Product info -->
        <div class="lg:w-1/2">
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <!-- Categories and badges -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="category in product.categories"
                :key="category.id"
                class="inline-block text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1 font-medium"
              >
                {{ category.name }}
              </span>
            </div>
            
            <!-- Product name and price -->
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
            
            <div class="flex items-baseline gap-3 mb-4">
              <span class="text-2xl font-bold text-primary">
                {{ formatPrice(product.price) }}
              </span>
              <span v-if="product.original_price > product.price" class="text-sm line-through text-gray-500">
                {{ formatPrice(product.original_price || product.price * 1.2) }}
              </span>
            </div>
            
            <!-- Rating preview -->
            <div class="flex items-center gap-2 mb-6">
              <div class="flex">
                <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'" 
                     fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="text-sm text-gray-600">4.0 (12 đánh giá)</span>
            </div>
            
            <!-- Description -->
            <div class="mb-6">
              <p class="text-gray-700 leading-relaxed">
                {{ product.description || 'Không có mô tả cho sản phẩm này.' }}
              </p>
            </div>
            
            <!-- Availability -->
            <div class="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
              <div class="flex items-center">
                <span
                  class="w-3 h-3 rounded-full mr-2"
                  :class="product.stock > 0 ? 'bg-green-500' : 'bg-red-500'"
                ></span>
                <span class="text-gray-700">
                  {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
                </span>
              </div>
              <span v-if="product.stock > 0" class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Còn {{ product.stock }} sản phẩm
              </span>
            </div>
            
            <!-- Add to cart -->
            <div class="space-y-4">
              <div class="flex items-center">
                <div class="quantity-selector flex items-center border rounded-md overflow-hidden mr-4">
                  <button
                    @click="decrementQuantity"
                    class="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r transition-colors"
                    :disabled="quantity <= 1 || isAddingToCart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="product.stock"
                    class="w-14 text-center py-2 border-none focus:ring-0"
                    :disabled="isAddingToCart"
                  />
                  <button
                    @click="incrementQuantity"
                    class="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l transition-colors"
                    :disabled="quantity >= product.stock || isAddingToCart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                <button
                  @click="addToCart"
                  class="btn btn-primary flex-1 relative overflow-hidden group"
                  :disabled="product.stock <= 0 || isAddingToCart"
                >
                  <span v-if="isAddingToCart" class="loading loading-spinner loading-xs mr-2"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {{ isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng' }}
                  
                  <!-- Ripple effect -->
                  <span class="absolute inset-0 h-full w-full flex justify-center items-center pointer-events-none opacity-0 group-hover:opacity-10 bg-white rounded-full scale-0 group-hover:scale-150 transition-all duration-500"></span>
                </button>
              </div>
              
              <button class="btn btn-outline w-full group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Thêm vào danh sách yêu thích
              </button>
            </div>
          </div>
          
          <!-- Shipping info card -->
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              Thông tin vận chuyển
            </h3>
            <ul class="space-y-3">
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Giao hàng miễn phí cho đơn hàng từ 500.000đ</span>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Giao hàng trong vòng 2-5 ngày</span>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Đổi trả miễn phí trong vòng 7 ngày</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Product details tabs -->
      <div v-if="product" class="mt-12 bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="border-b border-gray-200">
          <div class="container mx-auto px-6">
            <nav class="flex -mb-px space-x-8 overflow-x-auto hide-scrollbar" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
                :class="activeTab === tab.id ? 
                  'border-primary text-primary' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>
        
        <div class="container mx-auto px-6 py-8">
          <!-- Description tab -->
          <div v-if="activeTab === 'description'" class="description-tab">
            <div class="prose max-w-none">
              <div v-if="product.description">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <p class="text-gray-700 whitespace-pre-line">{{ product.description }}</p>
              </div>
              <p v-else class="text-gray-500 italic">Không có mô tả chi tiết cho sản phẩm này.</p>
            </div>
          </div>
          
          <!-- Specifications tab -->
          <div v-if="activeTab === 'specifications'" class="specifications-tab">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Thông số kỹ thuật</h3>
            <div class="overflow-hidden rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <tbody class="divide-y divide-gray-200">
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">Tên sản phẩm</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ product.name }}</td>
                  </tr>
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Danh mục</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {{ product.categories?.map(c => c.name).join(', ') || 'Chưa phân loại' }}
                    </td>
                  </tr>
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Giá</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatPrice(product.price) }}</td>
                  </tr>
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Tình trạng</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
                      </span>
                    </td>
                  </tr>
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Số lượng còn</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ product.stock }}</td>
                  </tr>
                  <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Ngày ra mắt</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(product.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Reviews tab -->
          <div v-if="activeTab === 'reviews'" class="reviews-tab">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Review summary -->
              <div class="md:w-1/3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Đánh giá sản phẩm</h3>
                <div class="bg-gray-50 rounded-lg p-6 text-center">
                  <div class="text-5xl font-bold text-gray-900 mb-2">4.0</div>
                  <div class="flex justify-center mb-2">
                    <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= 4 ? 'text-yellow-400' : 'text-gray-300'" 
                        fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div class="text-sm text-gray-500 mb-4">Dựa trên 12 đánh giá</div>
                  
                  <button class="btn btn-primary">Viết đánh giá</button>
                </div>
              </div>
              
              <!-- Review list -->
              <div class="md:w-2/3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Nhận xét gần đây</h3>
                
                <div class="space-y-6">
                  <!-- If no reviews -->
                  <p class="text-gray-500 italic text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </p>
                  
                  <!-- Sample review (hidden for now) -->
                  <div class="hidden bg-white p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between mb-2">
                      <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">
                          N
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">Nguyễn Văn A</div>
                          <div class="text-xs text-gray-500">20/05/2025</div>
                        </div>
                      </div>
                      <div class="flex">
                        <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= 5 ? 'text-yellow-400' : 'text-gray-300'" 
                             fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <p class="text-gray-700">Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh. Tôi rất hài lòng!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      <div v-if="product" class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
        
        <div v-if="isLoadingRelated" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div 
            v-for="i in 4" 
            :key="i"
            class="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
          >
            <div class="product-image aspect-square overflow-hidden bg-gray-50 animate-pulse"></div>
            <div class="p-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
              <div class="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div class="flex justify-between items-center">
                <div class="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                <div class="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="relatedProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div 
            v-for="product in relatedProducts" 
            :key="product.id"
            class="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <div class="relative">
              <router-link :to="`/products/${product.id}`" class="block">
                <img 
                  :src="getProductImageUrl(product.images) || '/images/placeholder.png'" 
                  :alt="product.name"
                  class="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                  @error="useDefaultImage"
                />
              </router-link>
              
              <!-- Quick add to cart button -->
              <button 
                @click="quickAddToCart(product)"
                class="absolute right-2 bottom-2 bg-white text-gray-800 hover:text-primary p-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-110"
                :disabled="product.stock <= 0 || isQuickAdding[product.id]"
              >
                <span v-if="isQuickAdding[product.id]" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
            
            <div class="p-4">
              <router-link :to="`/products/${product.id}`" class="block">
                <h3 class="text-gray-900 font-medium mb-1 hover:text-primary transition-colors">{{ product.name }}</h3>
                <div class="text-primary font-bold">{{ formatPrice(product.price) }}</div>
              </router-link>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-10 text-gray-500">
          Không tìm thấy sản phẩm liên quan.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { getImageUrl, getProductImageUrl } from '../../../utils/image';
import { toast } from 'vue3-toastify';

const store = useStore();
const route = useRoute();
const router = useRouter();

// Refs
const quantity = ref(1);
const mainImageIndex = ref(0);
const activeTab = ref('description');
const isZoomed = ref(false);
const zoomStyle = ref({});
const mainImage = ref(null);
const imageContainer = ref(null);
const galleryContainer = ref(null);
const isAddingToCart = ref(false);
const isLoadingRelated = ref(false);
const relatedProducts = ref([]);
const isQuickAdding = ref<Record<number, boolean>>({});

// Tabs configuration
const tabs = [
  { id: 'description', label: 'Mô tả sản phẩm' },
  { id: 'specifications', label: 'Thông số kỹ thuật' },
  { id: 'reviews', label: 'Đánh giá' }
];

// Computed
const product = computed(() => store.getters['product/currentProduct']);
const isLoading = computed(() => store.getters['product/isLoading']);
const error = computed(() => store.getters['product/error']);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const currentImage = computed(() => {
  if (!product.value || !product.value.images || product.value.images.length === 0) {
    return '/images/placeholder.png';
  }
  
  const image = product.value.images[mainImageIndex.value];
  return getImageUrl(image) || '/images/placeholder.png';
});

const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Methods
const fetchProduct = async (id: number) => {
  try {
    await store.dispatch('product/fetchProductById', id);
    // Reset states
    quantity.value = 1;
    mainImageIndex.value = 0;
    isZoomed.value = false;
    
    // Fetch related products
    fetchRelatedProducts();
  } catch (error) {
    console.error('Failed to fetch product:', error); 
  }
};

const fetchRelatedProducts = async () => {
  if (!product.value) return;
  
  isLoadingRelated.value = true;
  
  try {
    // Here you would fetch related products based on currentProduct
    // For now we'll simulate with random products
    const categoryIds = product.value.categories?.map(c => c.id) || [];
    
    if (categoryIds.length > 0) {
      const params = {
        category_id: categoryIds[0],
        limit: 4,
        exclude_id: product.value.id // Exclude current product
      };
      
      const response = await store.dispatch('product/fetchProducts', params);
      relatedProducts.value = response.data.slice(0, 4);
    } else {
      // If no categories, just fetch recent products
      const params = {
        limit: 4,
        exclude_id: product.value.id
      };
      
      const response = await store.dispatch('product/fetchProducts', params);
      relatedProducts.value = response.data.slice(0, 4);
    }
  } catch (error) {
    console.error('Failed to fetch related products:', error);
  } finally {
    isLoadingRelated.value = false;
  }
};

const selectImage = (index: number) => {
  mainImageIndex.value = index;
};

const incrementQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = async () => {
  if (!product.value || product.value.stock <= 0) return;
  
  // Check if user is logged in
  if (!isAuthenticated.value) {
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    return;
  }
  
  isAddingToCart.value = true;
  
  try {
    await store.dispatch('cart/addToCart', {
      product_id: product.value.id,
      quantity: quantity.value
    });
    
    toast.success(`Đã thêm ${quantity.value} ${product.value.name} vào giỏ hàng!`);
  } catch (error: any) {
    console.error('Failed to add to cart:', error);
    toast.error(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
  } finally {
    isAddingToCart.value = false;
  }
};

const quickAddToCart = async (product) => {
  if (!product || product.stock <= 0) return;
  
  // Check if user is logged in
  if (!isAuthenticated.value) {
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    return;
  }
  
  // Set loading state for this specific product
  isQuickAdding[product.id] = true;
  
  try {
    await store.dispatch('cart/addToCart', {
      product_id: product.id,
      quantity: 1
    });
    
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  } catch (error: any) {
    console.error('Failed to add to cart:', error);
    toast.error(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
  } finally {
    isQuickAdding[product.id] = false;
  }
};

const handleMouseMove = (event) => {
  if (!mainImage.value || !imageContainer.value) return;
  
  const { left, top, width, height } = imageContainer.value.getBoundingClientRect();
  const x = ((event.clientX - left) / width) * 100;
  const y = ((event.clientY - top) / height) * 100;
  
  isZoomed.value = true;
  zoomStyle.value = {
    transformOrigin: `${x}% ${y}%`
  };
};

const scrollGallery = (direction) => {
  if (!galleryContainer.value) return;
  
  const scrollAmount = 100; // Pixels to scroll
  
  if (direction === 'left') {
    galleryContainer.value.scrollLeft -= scrollAmount;
  } else {
    galleryContainer.value.scrollLeft += scrollAmount;
  }
  
  updateScrollButtons();
};

const updateScrollButtons = () => {
  if (!galleryContainer.value) return;
  
  canScrollLeft.value = galleryContainer.value.scrollLeft > 0;
  canScrollRight.value = 
    galleryContainer.value.scrollLeft + galleryContainer.value.clientWidth < 
    galleryContainer.value.scrollWidth;
};

const useDefaultImage = (event: Event) => {
  (event.target as HTMLImageElement).src = '/images/placeholder.png';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const isNewProduct = (product: any): boolean => {
  if (!product.created_at) return false;
  const createdDate = new Date(product.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 7;
};

// Watchers
watch(() => route.params.id, (newId) => {
  if (newId) {
    const productId = parseInt(newId as string);
    if (!isNaN(productId)) {
      fetchProduct(productId);
    }
  }
});

watch(() => galleryContainer.value, () => {
  if (galleryContainer.value) {
    galleryContainer.value.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();
  }
});

// Lifecycle
onMounted(() => {
  const productId = parseInt(route.params.id as string);
  if (!isNaN(productId)) {
    fetchProduct(productId);
  }
  
  if (galleryContainer.value) {
    updateScrollButtons();
  }
});
</script>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

.thumbnail {
  transition: all 0.2s ease-in-out;
}

.thumbnail:hover {
  transform: scale(1.05);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.social-btn {
  @apply flex items-center justify-center h-9 w-9 rounded-full text-white transition-colors;
}

/* Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>