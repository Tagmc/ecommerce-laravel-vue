// frontend/src/store/modules/user.ts

import type { UserState, User, UserFormData, UserFilters } from '../../types/user';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../../apis/user';

interface Commit {
  (type: string, payload?: any): void;
}

const user = {
  namespaced: true,
  state: (): UserState => ({
    users: [],
    currentUser: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      total: 0
    },
    loading: false,
    error: null
  }),
  mutations: {
    setUsers(state: UserState, users: User[]) {
      state.users = users;
    },
    setCurrentUser(state: UserState, user: User) {
      state.currentUser = user;
    },
    clearCurrentUser(state: UserState) {
      state.currentUser = null;
    },
    setPagination(state: UserState, pagination: any) {
      state.pagination = {
        currentPage: pagination.current_page || 1,
        totalPages: pagination.last_page || 1,
        perPage: pagination.per_page || 10,
        total: pagination.total || 0
      };
    },
    setLoading(state: UserState, loading: boolean) {
      state.loading = loading;
    },
    setError(state: UserState, error: string | null) {
      state.error = error;
    }
  },
  actions: {
    async fetchUsers({ commit }: { commit: Commit }, params: UserFilters = {}) {
      commit('setLoading', true);
      try {
        const response = await getUsers(params);
        commit('setUsers', response.data);
        commit('setPagination', response);
        return response;
      } catch (error: any) {
        commit('setError', error.response?.data?.message || 'Không thể tải danh sách người dùng');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async fetchUserById({ commit }: { commit: Commit }, id: number) {
      commit('setLoading', true);
      try {
        const user = await getUserById(id);
        commit('setCurrentUser', user);
        return user;
      } catch (error: any) {
        commit('setError', error.response?.data?.message || 'Không thể tải thông tin người dùng');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async createUser({ commit }: { commit: Commit }, userData: UserFormData) {
      commit('setLoading', true);
      try {
        const response = await createUser(userData);
        return response;
      } catch (error: any) {
        commit('setError', error.response?.data?.message || 'Không thể tạo người dùng');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async updateUser({ commit, dispatch }: { commit: Commit, dispatch: any }, { id, data }: { id: number, data: Partial<UserFormData> }) {
      commit('setLoading', true);
      try {
        const response = await updateUser(id, data);
        await dispatch('fetchUserById', id);
        return response;
      } catch (error: any) {
        commit('setError', error.response?.data?.message || 'Không thể cập nhật người dùng');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async deleteUser({ commit }: { commit: Commit }, id: number) {
      commit('setLoading', true);
      try {
        const response = await deleteUser(id);
        return response;
      } catch (error: any) {
        commit('setError', error.response?.data?.message || 'Không thể xóa người dùng');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    clearCurrentUser({ commit }: { commit: Commit }) {
      commit('clearCurrentUser');
    }
  },
  getters: {
    allUsers: (state: UserState) => state.users,
    userById: (state: UserState) => (id: number) => {
      return state.users.find(user => user.id === id) || null;
    },
    currentUser: (state: UserState) => state.currentUser,
    isLoading: (state: UserState) => state.loading,
    error: (state: UserState) => state.error,
    pagination: (state: UserState) => state.pagination
  }
};

export default user;