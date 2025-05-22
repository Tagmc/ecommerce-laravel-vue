// frontend/src/apis/user.ts

import workApi from '../axios';
import type { User, UserFormData, UserFilters } from '../types/user';

export const getUsers = async (params: UserFilters = {}) => {
  const response = await workApi.get('/users', { params });
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await workApi.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: UserFormData) => {
  const response = await workApi.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<UserFormData>) => {
  const response = await workApi.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await workApi.delete(`/users/${id}`);
  return response.data;
};