import client from './client';
import type {AuthResponse} from "../types";

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};
export const logout = async (): Promise<void> => {
  await client.post('/auth/logout');
};

export const register = async (firstName: string, lastName: string, email: string, password: string, role: "Student" | "Teacher" | "Admin"): Promise<AuthResponse> => {
  const response = await client.post('/auth/register', { firstName, lastName, email, password, role });
  return response.data;
}

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await client.post('/auth/refresh');
  return response.data;
}

export const verifyEmail = async (token: string): Promise<void> => {
  await client.get('/auth/verify-email', { params: { token } });
}
