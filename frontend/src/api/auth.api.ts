import { apiPost } from './client';

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

export async function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse, LoginRequest>('/auth/login', payload);
}
