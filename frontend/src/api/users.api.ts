import { apiGet, apiPost } from './client';

export type UserRole = 'SUPER_ADMIN' | 'COACH';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export function getUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}

export function createUser(payload: CreateUserInput): Promise<User> {
  return apiPost<User, CreateUserInput>('/users', payload);
}
