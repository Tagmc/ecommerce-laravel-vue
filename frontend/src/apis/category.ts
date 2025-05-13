import workApi from "../axios";

import type { Category } from "../types/category";

export const getCategories = () => workApi.get<Category[]>("/categories");

export const createCategory = (data: { name: string }) =>
  workApi.post("/categories", data);

export const updateCategory = (id: number, data: { name: string }) =>
  workApi.put(`/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  workApi.delete(`/categories/${id}`);
