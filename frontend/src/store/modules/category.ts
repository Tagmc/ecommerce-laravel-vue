import type { Category } from "../../types/category";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../../apis/category";

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

interface Commit {
  (type: string, payload?: any): void;
}

const category = {
  namespaced: true,
  state: (): CategoryState => ({
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null
  }),
  mutations: {
    setCategories(state: CategoryState, categories: Category[]) {
      state.categories = categories;
    },
    setSelectedCategory(state: CategoryState, category: Category) {
      state.selectedCategory = category;
    },
    addCategory(state: CategoryState, category: Category) {
      state.categories.push(category);
    },
    updateCategory(state: CategoryState, updatedCategory: Category) {
      const index = state.categories.findIndex(c => c.id === updatedCategory.id);
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory);
      }
      if (state.selectedCategory && state.selectedCategory.id === updatedCategory.id) {
        state.selectedCategory = updatedCategory;
      }
    },
    removeCategory(state: CategoryState, categoryId: number) {
      state.categories = state.categories.filter(c => c.id !== categoryId);
      if (state.selectedCategory && state.selectedCategory.id === categoryId) {
        state.selectedCategory = null;
      }
    },
    setLoading(state: CategoryState, loading: boolean) {
      state.loading = loading;
    },
    setError(state: CategoryState, error: string | null) {
      state.error = error;
    }
  },
  actions: {
    async fetchCategories({ commit }: { commit: Commit }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const categories = await getCategories();
        commit('setCategories', categories.data);
        return categories;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể tải danh sách danh mục';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async fetchCategoryById({ commit }: { commit: Commit }, categoryId: number) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const category = await getCategoryById(categoryId);
        commit('setSelectedCategory', category);
        return category;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin danh mục';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async createCategory({ commit }: { commit: Commit }, categoryData: Partial<Category>) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const newCategory = await createCategory(categoryData);
        commit('addCategory', newCategory);
        return newCategory;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể tạo danh mục mới';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async updateCategory({ commit }: { commit: Commit }, { id, data }: { id: number, data: Partial<Category> }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const updatedCategory = await updateCategory(id, data);
        commit('updateCategory', updatedCategory);
        return updatedCategory;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật danh mục';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async deleteCategory({ commit }: { commit: Commit }, categoryId: number) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        await deleteCategory(categoryId);
        commit('removeCategory', categoryId);
        return true;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể xóa danh mục';
        commit('setError', errorMessage);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    }
  },
  getters: {
    getAllCategories: (state: CategoryState) => state.categories,
    getSelectedCategory: (state: CategoryState) => state.selectedCategory,
    getCategoryById: (state: CategoryState) => (id: number) => {
      return state.categories.find(category => category.id === id);
    },
    isLoading: (state: CategoryState) => state.loading,
    getError: (state: CategoryState) => state.error
  }
};

export default category;