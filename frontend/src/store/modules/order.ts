import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../../apis/order';

interface OrderState {
  orders: any[];
  currentOrder: any | null;
  loading: boolean;
  error: string | null;
  statistics: any | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
}

interface Commit {
  (type: string, payload?: any): void;
}

const order = {
  namespaced: true,

  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    statistics: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: 10
    }
  }),

  mutations: {
    setOrders(state: OrderState, orders: any[]) {
      state.orders = orders || [];
    },

    setCurrentOrder(state: OrderState, order: any) {
      state.currentOrder = order;
    },

    updateOrderInList(state: OrderState, updatedOrder: any) {
      const index = state.orders.findIndex(order => order.id === updatedOrder.id);
      if (index !== -1) {
        state.orders.splice(index, 1, updatedOrder);
      }
    },

    setLoading(state: OrderState, loading: boolean) {
      state.loading = loading;
    },

    setError(state: OrderState, error: string | null) {
      state.error = error;
    },

    setPagination(state: OrderState, pagination: any) {
      state.pagination = {
        currentPage: pagination.current_page || 1,
        totalPages: pagination.last_page || 1,
        total: pagination.total || 0,
        perPage: pagination.per_page || 10
      };
    },

    setStatistics(state: OrderState, statistics: any) {
      state.statistics = statistics;
    }
  },

  actions: {
    async fetchOrders({ commit }: { commit: Commit }, params: any = {}) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        console.log('Fetching orders with params:', params);
        const response = await getOrders(params);
        console.log('API response:', response);

        // Kiểm tra xem response có đúng cấu trúc không
        if (response && response.data) {
          commit('setOrders', response.data);
          commit('setPagination', {
            current_page: response.current_page || 1,
            last_page: response.last_page || 1,
            total: response.total || 0,
            per_page: response.per_page || 10
          });
        } else {
          console.error('Invalid response structure:', response);
          commit('setOrders', []);
          commit('setError', 'Định dạng dữ liệu không hợp lệ');
        }
        
        return response;
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        const errorMessage = error.response?.data?.message || 'Không thể tải đơn hàng';
        commit('setError', errorMessage);
        commit('setOrders', []);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async fetchOrderById({ commit }: { commit: Commit }, orderId: number) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        console.log('Fetching order by ID:', orderId);
        const order = await getOrderById(orderId);
        
        if (order) {
          commit('setCurrentOrder', order);
          return order;
        } else {
          commit('setError', 'Không tìm thấy đơn hàng');
          commit('setCurrentOrder', null);
        }
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin đơn hàng';
        commit('setError', errorMessage);
        commit('setCurrentOrder', null);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async createOrder({ commit }: { commit: Commit }, orderData: any) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const newOrder = await createOrder(orderData);
        return newOrder;
      } catch (error: any) {
        console.error('Failed to create order:', error);
        const errorMessage = error.response?.data?.message || 'Không thể tạo đơn hàng';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async updateOrderStatus({ commit }: { commit: Commit }, { orderId, status }: { orderId: number, status: string }) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const updatedOrder = await updateOrderStatus(orderId, status);
        
        if (updatedOrder) {
          commit('updateOrderInList', updatedOrder);
          
          // Nếu đang xem chi tiết đơn hàng này, cập nhật currentOrder
          const currentOrder = this.state.order.currentOrder;
          if (currentOrder && currentOrder.id === orderId) {
            commit('setCurrentOrder', updatedOrder);
          }
        }
        
        return updatedOrder;
      } catch (error: any) {
        console.error('Failed to update order status:', error);
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async cancelOrder({ commit }: { commit: Commit }, orderId: number) {
      commit('setLoading', true);
      commit('setError', null);

      try {
        const cancelledOrder = await deleteOrder(orderId);
        
        if (cancelledOrder) {
          commit('updateOrderInList', cancelledOrder);
          
          // Nếu đang xem chi tiết đơn hàng này, cập nhật currentOrder
          const currentOrder = this.state.order.currentOrder;
          if (currentOrder && currentOrder.id === orderId) {
            commit('setCurrentOrder', cancelledOrder);
          }
        }
        
        return cancelledOrder;
      } catch (error: any) {
        console.error('Failed to cancel order:', error);
        const errorMessage = error.response?.data?.message || 'Không thể hủy đơn hàng';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    
  },

  getters: {
    allOrders: (state: OrderState) => state.orders,
    currentOrder: (state: OrderState) => state.currentOrder,
    isLoading: (state: OrderState) => state.loading,
    error: (state: OrderState) => state.error,
    pagination: (state: OrderState) => state.pagination,
    statistics: (state: OrderState) => state.statistics,
    
    // Getters cho số lượng đơn hàng theo trạng thái
    countByStatus: (state: OrderState) => (status: string) => {
      return state.orders.filter(order => order.status === status).length;
    },
    
    // Getter cho tổng doanh thu
    totalRevenue: (state: OrderState) => {
      return state.orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
    }
  }
};

export default order;