import { apiClient } from './client';
import { LoginForm, RegisterForm } from '../schemas/auth.schema';
import { AuthResponse, User } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/users/login', credentials);
    return response.data;
  },
  register: async (userData: RegisterForm & { role?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/users/register', userData);
    return response.data;
  },
  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/api/v1/users/current-user');
    return response.data;
  }
};
