import { api } from '../lib/api';
import type { AuthResponse, UpdateUserRequest } from '../types';

export const authService = {
    login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),

    register: (email: string, password: string, username: string) => api.post<AuthResponse>('/auth/register', { email, password, username }),

    forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),

    resetPassword: (token: string, new_password: string) =>
        api.post<{ message: string }>('/auth/reset-password', { new_password }, {
            headers: { 'Authorization': `Bearer ${token}` }
        }),

    updateUser: (data: UpdateUserRequest) => api.put<AuthResponse>('/auth/user', data),

    deleteUser: () => api.delete<{ message: string }>('/auth/user'),
};
