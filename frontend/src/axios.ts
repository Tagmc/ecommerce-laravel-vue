import axios from 'axios';
import store from './store';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { RefreshTokenResponse, ErrorResponse } from './types/auth';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const workApi: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

workApi.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

workApi.interceptors.response.use(
  response => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const isAuthPage = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
    const isAuthenticated = store.getters['auth/isAuthenticated'];

    if (status === 401 && !originalRequest._retry && isAuthenticated && !isAuthPage) {
      originalRequest._retry = true;
      try {
        const response = await workApi.post<RefreshTokenResponse>('/auth/refresh', {}, {withCredentials: true});
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        store.commit('auth/setAccessToken', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return workApi(originalRequest);
      } catch (refreshError) {
        await store.dispatch('auth/logout');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default workApi;
