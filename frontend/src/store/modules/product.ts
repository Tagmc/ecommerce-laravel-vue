import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../apis/product";
import type {
  Product,
  ProductPayload,
  ProductFilterParams,
} from "../../types/product";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  error: string | null;
}

interface Commit {
  (type: string, payload?: any): void;
}

const product = {
  namespaced: true,

  state: (): ProductState => ({
    products: [],
    currentProduct: null,
    isLoading: false,
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    error: null,
  }),

  mutations: {
    setLoading(state: ProductState, loading: boolean) {
      state.isLoading = loading;
    },

    setProducts(
      state: ProductState,
      payload: {
        products: Product[];
        total?: number;
        currentPage?: number;
        totalPages?: number;
      }
    ) {
      state.products = payload.products;
      if (payload.total !== undefined) state.totalProducts = payload.total;
      if (payload.currentPage !== undefined)
        state.currentPage = payload.currentPage;
      if (payload.totalPages !== undefined)
        state.totalPages = payload.totalPages;
    },

    setCurrentProduct(state: ProductState, product: Product | null) {
      state.currentProduct = product;
    },

    setError(state: ProductState, error: string | null) {
      state.error = error;
    },

    addProduct(state: ProductState, product: Product) {
      state.products.unshift(product);
    },

    updateProduct(state: ProductState, updatedProduct: Product) {
      const index = state.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    },

    removeProduct(state: ProductState, productId: number) {
      state.products = state.products.filter((p) => p.id !== productId);
    },

    resetState(state: ProductState) {
      state.products = [];
      state.currentProduct = null;
      state.isLoading = false;
      state.totalProducts = 0;
      state.currentPage = 1;
      state.totalPages = 1;
      state.error = null;
    },
  },

  actions: {
    async fetchProducts(
      { commit }: { commit: Commit },
      params: ProductFilterParams = {}
    ) {
      commit("setLoading", true);
      commit("setError", null);

      try {
        const response = await getProducts(params);

        if ("data" in response) {
          // Phản hồi là phân trang
          commit("setProducts", {
            products: response.data,
            total: response.total,
            currentPage: response.current_page,
            totalPages: response.total,
          });
        } else {
          commit("setProducts", { products: response });
        }
        return response;
      } catch (error: any) {
        commit("setError", error.message || "Không thể tải danh sách sản phẩm");
        console.error("Fetch products error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async fetchProductById({ commit }: { commit: Commit }, productId: number) {
      commit("setLoading", true);
      commit("setError", null);

      try {
        const product = await getProduct(productId);
        commit("setCurrentProduct", product);
        return product;
      } catch (error: any) {
        commit("setError", error.message || "Không thể tải thông tin sản phẩm");
        commit("setCurrentProduct", null);
        console.error("Fetch product detail error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async createProduct(
      { commit }: { commit: Commit },
      productData: ProductPayload | FormData
    ) {
      commit("setLoading", true);
      commit("setError", null);

      try {
        if (productData instanceof FormData) {
          const safeFormData = new FormData();
          const originalData = Object.fromEntries(productData.entries());
          console.log("Original form data:", originalData);
          for (let [key, value] of productData.entries()) {
            if (value !== undefined && value !== null) {
              safeFormData.append(key, value);
            } else {
              if (key === "price" || key === "stock") {
                safeFormData.append(key, "0");
              } else if (key.startsWith("category_ids")) {
                console.log(`Skipping undefined category_id at ${key}`);
              } else {
                safeFormData.append(key, "");
              }
            }
          }
          const newProduct = await createProduct(safeFormData);
          commit("addProduct", newProduct);
          return newProduct;
        } else {
          console.log("Creating product with regular object:", productData);
          const newProduct = await createProduct(productData);
          commit("addProduct", newProduct);
          return newProduct;
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Không thể tạo sản phẩm";
        commit("setError", errorMsg);
        console.error("Create product error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async updateProduct(
      { commit }: { commit: Commit },
      { id, data }: { id: number; data: ProductPayload | FormData }
    ) {
      commit("setLoading", true);
      commit("setError", null);

      try {
        if (data instanceof FormData) {
          const safeFormData = new FormData();
          const originalData = Object.fromEntries(data.entries());
          console.log("Original update form data:", originalData);
          if (!data.has("_method")) {
            safeFormData.append("_method", "PUT");
          }
          for (let [key, value] of data.entries()) {
            if (value !== undefined && value !== null) {
              safeFormData.append(key, value);
            } else {
              if (key === "price" || key === "stock") {
                safeFormData.append(key, "0");
              } else if (key.startsWith("category_ids")) {
                console.log(`Skipping undefined category_id at ${key}`);
              } else {
                safeFormData.append(key, "");
              }
            }
          }
          const updatedProduct = await updateProduct(id, safeFormData);
          commit("updateProduct", updatedProduct);
          return updatedProduct;
        } else {
          console.log("Updating product with regular object:", data);
          const updatedProduct = await updateProduct(id, data);
          commit("updateProduct", updatedProduct);
          return updatedProduct;
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Không thể cập nhật sản phẩm";
        commit("setError", errorMsg);
        console.error("Update product error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    async deleteProduct({ commit }: { commit: Commit }, productId: number) {
      commit("setLoading", true);
      commit("setError", null);

      try {
        await deleteProduct(productId);
        commit("removeProduct", productId);
        return true;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Không thể xóa sản phẩm";
        commit("setError", errorMsg);
        console.error("Delete product error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },

    clearCurrentProduct({ commit }: { commit: Commit }) {
      commit("setCurrentProduct", null);
    },

    resetProductState({ commit }: { commit: Commit }) {
      commit("resetState");
    },
  },

  getters: {
    allProducts: (state: ProductState): Product[] => state.products,
    productById:
      (state: ProductState) =>
      (id: number): Product | undefined =>
        state.products.find((p) => p.id === id),
    currentProduct: (state: ProductState): Product | null =>
      state.currentProduct,
    isLoading: (state: ProductState): boolean => state.isLoading,
    error: (state: ProductState): string | null => state.error,
    pagination: (state: ProductState) => ({
      total: state.totalProducts,
      currentPage: state.currentPage,
      totalPages: state.totalPages,
    }),
  },
};

export default product;
