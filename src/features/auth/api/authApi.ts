import { apiClient, BASE_URL } from '../../../services/apiClient';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  ResendVerificationPayload,
  ResendVerificationResponse,
  ConsentPayload,
  LegalDocument,
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

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return res.data;
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    const res = await apiClient.post<VerifyEmailResponse>('/auth/email/verify', payload);
    return res.data;
  },

  resendVerification: async (payload: ResendVerificationPayload): Promise<ResendVerificationResponse> => {
    const res = await apiClient.post<ResendVerificationResponse>('/auth/email/resend-verification', payload);
    return res.data;
  },

  completeConsents: async (payload: ConsentPayload): Promise<{ message: string; termsVersion: string; acceptedAt: string }> => {
    const res = await apiClient.post<{ message: string; termsVersion: string; acceptedAt: string }>('/auth/consents', payload);
    return res.data;
  },

  getTerms: async (): Promise<LegalDocument> => {
    const res = await apiClient.get<LegalDocument>('/legal/terms/current');
    return res.data;
  },

  getPrivacy: async (): Promise<LegalDocument> => {
    const res = await apiClient.get<LegalDocument>('/legal/privacy/current');
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

  forgotPassword: async (payload: { email: string }): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/forgot-password', payload);
    return res.data;
  },

  resetPassword: async (payload: { token: string; newPassword: string }): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  getGoogleLoginUrl: async (): Promise<string> => {
    const redirectUri = `${window.location.origin}/oauth2/redirect`;
    try {
      const res = await apiClient.get<{ url: string }>(`/auth/oauth2/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res.data?.url) {
        try {
          const urlObj = new URL(res.data.url, window.location.origin);
          urlObj.searchParams.set('redirect_uri', redirectUri);
          return urlObj.toString();
        } catch {
          return `${res.data.url}${res.data.url.includes('?') ? '&' : '?'}redirect_uri=${encodeURIComponent(redirectUri)}`;
        }
      }
    } catch {
      // Fallback to standard spring security oauth2 endpoint
    }
    const baseUrl = BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    return `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },
};
