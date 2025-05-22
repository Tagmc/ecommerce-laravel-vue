import workApi from "../axios";

import type { Category } from "../types/category";

export const getCategories = () => workApi.get<Category[]>("/categories");

export const createCategory = (data: Partial<Category>) =>
  workApi.post("/", data);

export const getCategoryById = (id: number) => 
  workApi.get(`/categories/${id}`);

export const updateCategory = (id: number, data: Partial<Category>) =>
  workApi.put(`/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  workApi.delete(`/categories/${id}`);
