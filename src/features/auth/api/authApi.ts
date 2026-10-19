import { apiClient, BASE_URL } from '../../../services/apiClient';
import type {
  AuthResponse,
  LoginPayload,
  RefreshTokenPayload,
  LogoutPayload,
  LogoutResponse,
  User,
} from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  refreshToken: async (payload: RefreshTokenPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/refresh', payload);
    return res.data;
  },

  logout: async (payload?: LogoutPayload): Promise<LogoutResponse> => {
    const res = await apiClient.post<LogoutResponse>('/auth/logout', payload || {});
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  getGoogleLoginUrl: async (): Promise<string> => {
    try {
      const res = await apiClient.get<{ url: string }>('/auth/oauth2/google/url');
      if (res.data?.url) return res.data.url;
    } catch {
      // Fallback to standard spring security oauth2 endpoint
    }
    const baseUrl = BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    return `${baseUrl}/oauth2/authorization/google`;
  },
};
