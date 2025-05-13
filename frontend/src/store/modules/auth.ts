import { loginApi, registerApi, getProfile, logout } from "../../apis/auth";
import type {
  AuthState,
  LoginPayload,
  RegisterPayload,
  User,
} from "../../types/auth";

interface Commit {
  (type: string, payload?: any): void;
}

const auth = {
  namespaced: true,
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem("access_token") || null,
    isAuthenticated: !!localStorage.getItem("access_token"),
    loading: false,
    isAdmin: false,
  }),
  mutations: {
    setUser(state: AuthState, user: User | null) {
      state.user = user;
    },
    setIsAdmin(state: AuthState, user: User | null) {
      state.isAdmin = user?.role === "admin";
    },
    setAccessToken(state: AuthState, token: string | null) {
      state.accessToken = token;
      state.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
    },
    setIsAuthenticated(state: AuthState, isAuthenticated: boolean) {
      state.isAuthenticated = isAuthenticated;
    },
    setLoading(state: AuthState, loading: boolean) {
      state.loading = loading;
    },
    resetState(state: AuthState) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
    },
  },
  actions: {
    async login({ commit }: { commit: Commit }, payload: LoginPayload) {
      commit("setLoading", true);
      try {
        const response = await loginApi(payload);
        localStorage.setItem('access_token', response.access_token);
        commit("setUser", response.user);
        commit("setAccessToken", response.access_token);
        commit("setIsAdmin", response.user);
        return response;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async register({ commit }: { commit: Commit }, payload: RegisterPayload) {
      commit("setLoading", true);
      try {
        const response = await registerApi(payload);
        commit("setUser", response.user);
        return response;
      } catch (error) {
        console.error("Register error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async fetchUser({ commit }: { commit: Commit }) {
      commit("setLoading", true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          commit("resetState");
          return;
        }
        const response = await getProfile();
        commit("setUser", response.user);
        commit("setIsAdmin", response.user);
        commit("setIsAuthenticated", true);
        return response;
      } catch (error) {
        console.error("Fetch user error:", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async logout({ commit }: { commit: Commit }) {
      commit("setLoading", true);
      try {
        await logout();
        localStorage.removeItem("access_token");
        
        commit("setAccessToken", null);
        commit("setUser", null);
        commit("setIsAdmin", false);
        commit("setIsAuthenticated", false);
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        commit("setLoading", false);
      }
    },
  },
  getters: {
    isAuthenticated: (state: AuthState): boolean => state.isAuthenticated,
    user: (state: AuthState): User | null => state.user,
    accessToken: (state: AuthState): string | null => state.accessToken,
    isLoading: (state: AuthState): boolean => state.loading,
    isAdmin: (state: AuthState): boolean => state.isAdmin,
  },
};

export default auth;
