<template>
  <div class="order-manager p-6">
    <div
      class="header flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p class="text-gray-600 mt-1">
          Quản lý và cập nhật trạng thái các đơn hàng
        </p>
      </div>

      <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
        <div class="relative">
          <input
            v-model="filters.search"
            type="text"
            class="input input-bordered w-full sm:w-72 pr-10"
            placeholder="Tìm theo mã đơn, tên, email..."
            @keyup.enter="fetchOrders()"
          />
          <button
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="fetchOrders()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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

        <div class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-outline gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Bộ lọc
          </button>
          <div
            tabindex="0"
            class="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-64 mt-2"
          >
            <div class="form-control mb-3">
              <label class="label">
                <span class="label-text font-medium">Trạng thái</span>
              </label>
              <select
                v-model="filters.status"
                class="select select-bordered w-full"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div class="form-control mb-3">
              <label class="label">
                <span class="label-text font-medium">Thanh toán</span>
              </label>
              <select
                v-model="filters.payment_status"
                class="select select-bordered w-full"
              >
                <option value="">Tất cả</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chưa thanh toán</option>
              </select>
            </div>
            <div class="form-control mb-3">
              <label class="label">
                <span class="label-text font-medium">Sắp xếp theo</span>
              </label>
              <select
                v-model="filters.sort"
                class="select select-bordered w-full"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="total_high">Giá trị cao nhất</option>
                <option value="total_low">Giá trị thấp nhất</option>
              </select>
            </div>
            <div class="flex justify-between mt-4">
              <button class="btn btn-sm" @click="resetFilters">Đặt lại</button>
              <button class="btn btn-sm btn-primary" @click="fetchOrders">
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div
        v-for="(stat, index) in orderStats"
        :key="index"
        class="stat bg-white rounded-lg shadow-sm"
      >
        <div :class="`stat-figure text-${stat.color}`">
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
              :d="stat.icon"
            />
          </svg>
        </div>
        <div class="stat-title text-sm">{{ stat.title }}</div>
        <div :class="`stat-value text-${stat.color} text-2xl`">
          {{ isLoadingStats ? "-" : (stat.value || 0) }}
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error shadow-lg mb-6">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ error }}</span>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost" @click="fetchOrders">
          Thử lại
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!orders || orders.length === 0"
      class="bg-white shadow-sm rounded-lg p-8 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-1">
        Không có đơn hàng nào
      </h3>
      <p class="text-gray-600 mb-4">
        {{
          hasFilters
            ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại."
            : "Chưa có đơn hàng nào được tạo trong hệ thống."
        }}
      </p>
      <button v-if="hasFilters" class="btn btn-outline" @click="resetFilters">
        Xóa bộ lọc
      </button>
    </div>

    <!-- Orders table -->
    <div v-else class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="whitespace-nowrap font-medium">
                <span class="text-blue-600">#{{ order.order_number }}</span>
              </td>
              <td>
                <div>{{ order.name || 'Không có tên' }}</div>
                <div class="text-xs text-gray-500">{{ order.email || 'Không có email' }}</div>
              </td>
              <td class="whitespace-nowrap">
                {{ formatDateTime(order.created_at) }}
              </td>
              <td class="whitespace-nowrap font-medium">
                {{ formatPrice(order.total) }}
              </td>
              <td>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getOrderStatusClass(order.status)"
                >
                  {{ getOrderStatusText(order.status) }}
                </span>
              </td>
              <td>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getPaymentStatusClass(order.payment_status)"
                >
                  {{ getPaymentStatusText(order.payment_status) }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <button
                    class="btn btn-sm btn-ghost"
                    @click="viewOrderDetails(order)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-sm btn-ghost">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    <ul
                      tabindex="0"
                      class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li v-if="order.status === 'pending'">
                        <a @click="updateOrderStatus(order, 'processing')"
                          >Xác nhận đơn hàng</a
                        >
                      </li>
                      <li v-if="order.status === 'processing'">
                        <a @click="updateOrderStatus(order, 'shipped')"
                          >Chuyển trạng thái giao hàng</a
                        >
                      </li>
                      <li v-if="order.status === 'shipped'">
                        <a @click="updateOrderStatus(order, 'delivered')"
                          >Xác nhận đã giao</a
                        >
                      </li>
                      <li
                        v-if="['pending', 'processing'].includes(order.status)"
                      >
                        <a
                          @click="confirmCancelOrder(order)"
                          class="text-red-600"
                          >Hủy đơn hàng</a
                        >
                      </li>
                      <li
                        v-if="
                          order.payment_status === 'pending' &&
                          order.status !== 'cancelled'
                        "
                      >
                        <a @click="confirmMarkAsPaid(order)"
                          >Đánh dấu đã thanh toán</a
                        >
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="py-4 px-6 flex justify-between items-center border-t"
      >
        <div class="text-sm text-gray-600">
          Hiển thị {{ pagination.from }}-{{ pagination.to }} của
          {{ pagination.total }} đơn hàng
        </div>
        <div class="btn-group">
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="changePage(pagination.currentPage - 1)"
          >
            «
          </button>

          <button
            v-for="page in paginationPages"
            :key="page"
            class="btn btn-sm"
            :class="page === pagination.currentPage ? 'btn-active' : ''"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage === pagination.totalPages"
            @click="changePage(pagination.currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div class="modal" :class="{ 'modal-open': showOrderDetailsModal }">
      <div class="modal-box w-11/12 max-w-4xl">
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-lg">
            Chi tiết đơn hàng #{{ selectedOrder?.order_number }}
          </h3>
          <button class="btn btn-sm btn-ghost" @click="closeOrderDetailsModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div v-if="selectedOrder" class="mt-4">
          <!-- Order status timeline -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between status-timeline">
              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="
                    isOrderStatusCompleted('pending')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span class="text-xs mt-1">Đặt hàng</span>
              </div>

              <div
                class="flex-1 h-1 mx-2"
                :class="
                  isOrderStatusCompleted('processing')
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                "
              ></div>

              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="
                    isOrderStatusCompleted('processing')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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
                <span class="text-xs mt-1">Xác nhận</span>
              </div>

              <div
                class="flex-1 h-1 mx-2"
                :class="
                  isOrderStatusCompleted('shipped')
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                "
              ></div>

              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="
                    isOrderStatusCompleted('shipped')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <span class="text-xs mt-1">Vận chuyển</span>
              </div>

              <div
                class="flex-1 h-1 mx-2"
                :class="
                  isOrderStatusCompleted('delivered')
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                "
              ></div>

              <div class="flex flex-col items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="
                    isOrderStatusCompleted('delivered')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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
                <span class="text-xs mt-1">Đã giao</span>
              </div>
            </div>

            <!-- Cancelled status overlay -->
            <div
              v-if="selectedOrder.status === 'cancelled'"
              class="mt-3 text-center"
            >
              <span
                class="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"
              >
                Đơn hàng đã bị hủy
              </span>
            </div>
          </div>

          <!-- Order information -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h4 class="font-medium text-gray-900 mb-2">
                Thông tin khách hàng
              </h4>
              <p class="text-sm">{{ selectedOrder.name || 'Không có tên' }}</p>
              <p class="text-sm">{{ selectedOrder.email || 'Không có email' }}</p>
              <p class="text-sm">{{ selectedOrder.phone || 'Không có số điện thoại' }}</p>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h4 class="font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h4>
              <p class="text-sm">{{ selectedOrder.shipping_address || 'Không có địa chỉ' }}</p>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h4 class="font-medium text-gray-900 mb-2">Thanh toán</h4>
              <p class="text-sm">
                Phương thức:
                {{ getPaymentMethodText(selectedOrder.payment_method) }}
              </p>
              <p class="text-sm">
                Trạng thái:
                <span
                  :class="getPaymentStatusColor(selectedOrder.payment_status)"
                >
                  {{ getPaymentStatusText(selectedOrder.payment_status) }}
                </span>
              </p>
              <p class="text-sm mt-2">
                Ngày đặt: {{ formatDateTime(selectedOrder.created_at) }}
              </p>
            </div>
          </div>

          <!-- Order items -->
          <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
            <h4 class="font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h4>

            <div class="overflow-x-auto">
              <div v-if="!selectedOrder.items || selectedOrder.items.length === 0" 
                   class="py-8 text-center text-gray-500">
                Không có thông tin sản phẩm
              </div>
              <table v-else class="table w-full">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-right">Giá</th>
                    <th class="text-right">Số lượng</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td>
                      <div class="flex items-center">
                        <div class="w-12 h-12 flex-shrink-0 mr-3">
                          <img
                            :src="getProductImage(item.product)"
                            :alt="item.product?.name || 'Sản phẩm'"
                            class="w-full h-full object-cover rounded"
                            @error="handleImageError"
                          />
                        </div>
                        <div>
                          <div class="font-medium">{{ item.product?.name || 'Sản phẩm không xác định' }}</div>
                          <div class="text-xs text-gray-500">
                            {{ item.product?.sku || "N/A" }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-right">{{ formatPrice(item.price || 0) }}</td>
                    <td class="text-right">{{ item.quantity || 0 }}</td>
                    <td class="text-right font-medium">
                      {{ formatPrice(item.subtotal || 0) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right font-medium">
                      Tạm tính:
                    </td>
                    <td class="text-right">
                      {{ formatPrice(selectedOrder.subtotal || 0) }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-right font-medium">
                      Phí vận chuyển:
                    </td>
                    <td class="text-right">
                      {{ formatPrice(selectedOrder.shipping_fee || 0) }}
                    </td>
                  </tr>
                  <tr v-if="selectedOrder.discount > 0">
                    <td colspan="3" class="text-right font-medium">
                      Giảm giá:
                    </td>
                    <td class="text-right">
                      -{{ formatPrice(selectedOrder.discount || 0) }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-right font-medium text-lg">
                      Tổng cộng:
                    </td>
                    <td class="text-right font-bold text-lg">
                      {{ formatPrice(selectedOrder.total || 0) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Order notes -->
          <div
            v-if="selectedOrder.notes"
            class="bg-white rounded-lg p-4 shadow-sm mb-6"
          >
            <h4 class="font-medium text-gray-900 mb-2">Ghi chú đơn hàng</h4>
            <p class="text-sm">{{ selectedOrder.notes }}</p>
          </div>

          <!-- Order actions -->
          <div
            v-if="
              selectedOrder.status !== 'cancelled' &&
              selectedOrder.status !== 'delivered'
            "
            class="flex justify-end gap-2 mt-6"
          >
            <button
              v-if="selectedOrder.status === 'pending'"
              class="btn btn-primary"
              @click="updateOrderStatus(selectedOrder, 'processing')"
              :disabled="isUpdatingStatus"
            >
              <span
                v-if="isUpdatingStatus"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              Xác nhận đơn hàng
            </button>

            <button
              v-if="selectedOrder.status === 'processing'"
              class="btn btn-primary"
              @click="updateOrderStatus(selectedOrder, 'shipped')"
              :disabled="isUpdatingStatus"
            >
              <span
                v-if="isUpdatingStatus"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              Chuyển trạng thái giao hàng
            </button>

            <button
              v-if="selectedOrder.status === 'shipped'"
              class="btn btn-primary"
              @click="updateOrderStatus(selectedOrder, 'delivered')"
              :disabled="isUpdatingStatus"
            >
              <span
                v-if="isUpdatingStatus"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              Xác nhận đã giao
            </button>

            <button
              v-if="['pending', 'processing'].includes(selectedOrder.status)"
              class="btn btn-error"
              @click="confirmCancelOrder(selectedOrder)"
              :disabled="isUpdatingStatus"
            >
              <span
                v-if="isUpdatingStatus"
                class="loading loading-spinner loading-xs mr-2"
              ></span>
              Hủy đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Order Confirmation Modal -->
    <div class="modal" :class="{ 'modal-open': showCancelModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Xác nhận hủy đơn hàng</h3>
        <p class="py-4">
          Bạn có chắc chắn muốn hủy đơn hàng #{{
            orderToCancel?.order_number
          }}
          không?
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showCancelModal = false">
            Đóng
          </button>
          <button
            class="btn btn-error"
            @click="cancelOrder"
            :disabled="isUpdatingStatus"
          >
            <span
              v-if="isUpdatingStatus"
              class="loading loading-spinner loading-xs mr-2"
            ></span>
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>

    <!-- Mark as Paid Confirmation Modal -->
    <div class="modal" :class="{ 'modal-open': showMarkAsPaidModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Xác nhận đã thanh toán</h3>
        <p class="py-4">
          Xác nhận đơn hàng #{{ orderToMarkAsPaid?.order_number }} đã được thanh
          toán?
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showMarkAsPaidModal = false">
            Đóng
          </button>
          <button
            class="btn btn-primary"
            @click="markAsPaid"
            :disabled="isUpdatingStatus"
          >
            <span
              v-if="isUpdatingStatus"
              class="loading loading-spinner loading-xs mr-2"
            ></span>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useToast } from "../../../composables/useToast";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "cancelled";
type PaymentMethod = "cod" | "bank_transfer" | "vnpay" | "momo";

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  notes: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  images: string[];
  price: number;
  stock: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  from: number;
  to: number;
}

const store = useStore();
const { showToast } = useToast();

// State
const orders = ref<Order[]>([]);
const isLoading = ref(false);
const isLoadingStats = ref(false);
const isUpdatingStatus = ref(false);
const error = ref<string | null>(null);
const pagination = ref<Pagination>({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  perPage: 10,
  from: 1,
  to: 10,
});

const filters = ref({
  search: "",
  status: "",
  payment_status: "",
  sort: "newest",
  page: 1,
  per_page: 10,
});

// Order details modal
const showOrderDetailsModal = ref(false);
const selectedOrder = ref<Order | null>(null);

// Cancel order modal
const showCancelModal = ref(false);
const orderToCancel = ref<Order | null>(null);

// Mark as paid modal
const showMarkAsPaidModal = ref(false);
const orderToMarkAsPaid = ref<Order | null>(null);

// Stats
const orderStats = computed(() => [
  {
    title: "Tổng đơn hàng",
    value: store.state.order?.stats?.total || 0,
    color: "primary",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H15a1 1 0 001-1v-1M1 1h4m14 18c-.8 0-3.5-1-3.5-4.5S18.2 10 19 10s3.5 1 3.5 4.5S19.8 19 19 19z",
  },
  {
    title: "Chờ xác nhận",
    value: store.state.order?.stats?.pending || 0,
    color: "warning",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Đang xử lý",
    value: store.state.order?.stats?.processing || 0,
    color: "info",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    title: "Đang giao",
    value: store.state.order?.stats?.shipped || 0,
    color: "accent",
    icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  },
  {
    title: "Đã giao",
    value: store.state.order?.stats?.delivered || 0,
    color: "success",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
]);

// Computed
const paginationPages = computed(() => {
  const totalPages = pagination.value.totalPages;
  const currentPage = pagination.value.currentPage;

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
});

const hasFilters = computed(() => {
  return (
    filters.value.search || filters.value.status || filters.value.payment_status
  );
});

// Methods
const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await store.dispatch("order/fetchOrders", filters.value);
    
    if (response && response.data) {
      orders.value = response.data || [];
      
      pagination.value = {
        currentPage: response.current_page || 1,
        totalPages: response.last_page || 1,
        total: response.total || 0,
        perPage: response.per_page || 10,
        from: response.from || 0,
        to: response.to || 0,
      };
    } else {
      orders.value = [];
      error.value = "Không nhận được dữ liệu hợp lệ từ máy chủ";
    }

    console.log("Fetched orders:", orders.value);
  } catch (err: any) {
    console.error("Failed to fetch orders:", err);
    error.value =
      err.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.";
    orders.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchOrderStats = async () => {
  isLoadingStats.value = true;

  try {
    await store.dispatch("order/fetchOrderStats");
  } catch (err) {
    console.error("Failed to fetch order stats:", err);
  } finally {
    isLoadingStats.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    search: "",
    status: "",
    payment_status: "",
    sort: "newest",
    page: 1,
    per_page: 10,
  };

  fetchOrders();
};

const changePage = (page: number) => {
  filters.value.page = page;
  fetchOrders();
};

const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order;
  showOrderDetailsModal.value = true;
};

const closeOrderDetailsModal = () => {
  showOrderDetailsModal.value = false;
  selectedOrder.value = null;
};

const confirmCancelOrder = (order: Order) => {
  orderToCancel.value = order;
  showCancelModal.value = true;
};

const cancelOrder = async () => {
  if (!orderToCancel.value) return;

  isUpdatingStatus.value = true;

  try {
    await store.dispatch("order/updateOrderStatus", {
      id: orderToCancel.value.id,
      status: "cancelled",
    });

    // Update local state
    const index = orders.value.findIndex(
      (order) => order.id === orderToCancel.value?.id
    );
    if (index !== -1) {
      orders.value[index].status = "cancelled";
      orders.value[index].payment_status = "cancelled";
    }

    // Update selected order if it's the same
    if (selectedOrder.value?.id === orderToCancel.value.id) {
      selectedOrder.value.status = "cancelled";
      selectedOrder.value.payment_status = "cancelled";
    }

    showToast("Đã hủy đơn hàng thành công", "success");
    showCancelModal.value = false;

    // Refresh order stats
    fetchOrderStats();
  } catch (err: any) {
    console.error("Failed to cancel order:", err);
    showToast(
      err.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
      "error"
    );
  } finally {
    isUpdatingStatus.value = false;
  }
};

const confirmMarkAsPaid = (order: Order) => {
  orderToMarkAsPaid.value = order;
  showMarkAsPaidModal.value = true;
};

const markAsPaid = async () => {
  if (!orderToMarkAsPaid.value) return;

  isUpdatingStatus.value = true;

  try {
    await store.dispatch("order/updatePaymentStatus", {
      id: orderToMarkAsPaid.value.id,
      payment_status: "paid",
    });

    // Update local state
    const index = orders.value.findIndex(
      (order) => order.id === orderToMarkAsPaid.value?.id
    );
    if (index !== -1) {
      orders.value[index].payment_status = "paid";
    }

    // Update selected order if it's the same
    if (selectedOrder.value?.id === orderToMarkAsPaid.value.id) {
      selectedOrder.value.payment_status = "paid";
    }

    showToast("Đã cập nhật trạng thái thanh toán thành công", "success");
    showMarkAsPaidModal.value = false;
  } catch (err: any) {
    console.error("Failed to update payment status:", err);
    showToast(
      err.message ||
        "Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại sau.",
      "error"
    );
  } finally {
    isUpdatingStatus.value = false;
  }
};

const updateOrderStatus = async (order: Order, newStatus: OrderStatus) => {
  isUpdatingStatus.value = true;

  try {
    await store.dispatch("order/updateOrderStatus", {
      id: order.id,
      status: newStatus,
    });

    // Update local state
    const index = orders.value.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders.value[index].status = newStatus;
    }

    // Update selected order if it's the same
    if (selectedOrder.value?.id === order.id) {
      selectedOrder.value.status = newStatus;
    }

    showToast("Đã cập nhật trạng thái đơn hàng thành công", "success");

    // Refresh order stats
    fetchOrderStats();
  } catch (err: any) {
    console.error("Failed to update order status:", err);
    showToast(
      err.message ||
        "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.",
      "error"
    );
  } finally {
    isUpdatingStatus.value = false;
  }
};

const isOrderStatusCompleted = (status: OrderStatus): boolean => {
  if (!selectedOrder.value || selectedOrder.value.status === "cancelled") return false;

  const statusOrder = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(
    selectedOrder.value.status || "pending"
  );
  const targetIndex = statusOrder.indexOf(status);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  return currentIndex >= targetIndex;
};

// Helper functions
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "N/A";

  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPrice = (price: number | null | undefined): string => {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return "0 ₫";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "processing":
      return "Đang xử lý";
    case "shipped":
      return "Đang giao";
    case "delivered":
      return "Đã giao";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

const getOrderStatusClass = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusText = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "Chưa thanh toán";
    case "paid":
      return "Đã thanh toán";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

const getPaymentStatusClass = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "text-amber-600";
    case "paid":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getPaymentMethodText = (method: PaymentMethod): string => {
  switch (method) {
    case "cod":
      return "Thanh toán khi nhận hàng (COD)";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    case "vnpay":
      return "VNPay";
    case "momo":
      return "Ví MoMo";
    default:
      return "Không xác định";
  }
};

const getProductImage = (product: Product | null | undefined): string => {
  if (!product) return "/images/placeholder.png";

  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const image = product.images[0];
    if (typeof image === 'string') {
      if (image.startsWith("http")) {
        return image;
      }
      return `/storage/${image}`;
    }
  }

  return "/images/placeholder.png";
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/placeholder.png';
};

// Lifecycle hooks
onMounted(() => {
  fetchOrders();
  fetchOrderStats();
});

// Watcher
watch(
  () => filters.value.page,
  () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
);
</script>

<style scoped>
.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  @apply rounded;
}

.sort-btn {
  @apply border-0 bg-transparent cursor-pointer text-gray-500 hover:text-gray-700;
}

.order-manager {
  min-height: calc(100vh - 64px);
}

/* CSS cho modal trên thiết bị di động */
@media (max-width: 640px) {
  .modal-box {
    width: 95%;
    max-width: 95%;
    padding: 1rem;
  }
  
  .table {
    font-size: 0.75rem;
  }
  
  .status-timeline {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-timeline .flex-1 {
    width: 2px;
    height: 20px;
    margin: 4px 0;
  }
}
</style>