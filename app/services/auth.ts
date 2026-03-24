import api from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return data;
}

export async function registerApi(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/api/auth/register", payload);
  return data;
}

export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/refresh", { refreshToken });
  return data;
}