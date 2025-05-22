// frontend/src/types/user.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface UserFilters {
  search?: string;
  role?: string;
  sort_by?: string;
  sort_direction?: string;
  page?: number;
  per_page?: number;
}