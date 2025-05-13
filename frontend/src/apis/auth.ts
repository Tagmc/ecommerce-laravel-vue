import workApi from '../axios';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UserResponse,
  LogoutResponse,
  RefreshTokenResponse,
} from '../types/auth';

export const loginApi = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await workApi.post<LoginResponse>('/auth/login', data);
  return res.data;
};

export const registerApi = async (data: RegisterPayload): Promise<RegisterResponse> => {
  const res = await workApi.post<RegisterResponse>('/auth/register', data);
  return res.data;
};

export const getProfile = async (): Promise<UserResponse> => {
  const res = await workApi.get<UserResponse>('/auth/me');
  return res.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const res = await workApi.post<LogoutResponse>('/auth/logout');
  return res.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const res = await workApi.post<RefreshTokenResponse>('/auth/refresh');
  return res.data;
};