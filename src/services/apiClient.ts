import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authPromise: Promise<string> | null = null;

/**
 * Automatically ensures an active JWT token for development and operator operations.
 * Auto-authenticates against /api/v1/auth/login if no token is present in localStorage.
 */
export async function ensureOperatorToken(): Promise<string> {
  const existing = localStorage.getItem('access_token');
  if (existing) return existing;

  if (!authPromise) {
    authPromise = axios.post(`${BASE_URL}/auth/login`, {
      email: 'operator@memento3d.vn',
      password: 'Password@123',
    }).then((res) => {
      const token = res.data?.accessToken;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', res.data?.user?.role || 'ROLE_OPERATOR');
        localStorage.setItem('user_email', res.data?.user?.email || 'operator@memento3d.vn');
      }
      return token || '';
    }).catch((err) => {
      console.warn('Auto operator login attempt failed:', err.message);
      return '';
    }).finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
}

// Auto attach JWT token from localStorage or auto-authenticate
apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('access_token');
  if (!token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
    token = await ensureOperatorToken();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler mapping with auto-retry on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      localStorage.removeItem('access_token');
      const newToken = await ensureOperatorToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    const errorData = error.response?.data;
    const message = errorData?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
