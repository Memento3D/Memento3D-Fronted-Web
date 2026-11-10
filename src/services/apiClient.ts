import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../features/auth/utils/tokenStorage";

export const resolveApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const rawUrl =
    envUrl ||
    (import.meta.env.PROD
      ? "https://memento3d-backend.onrender.com"
      : "http://localhost:8080");

  const cleanUrl = rawUrl.replace(/\/+$/, "");

  // If URL doesn't end with /api/v1 or /api, append /api/v1
  if (!cleanUrl.endsWith("/api/v1") && !cleanUrl.endsWith("/api")) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

export const BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let refreshInFlight: Promise<string> | null = null;

export const expireSession = () => {
  tokenStorage.clearTokens();
  window.dispatchEvent(new CustomEvent('memento3d:session-expired'));
};

// REST and SSE share one rotation. A late 401 can reuse an already renewed token.
export const refreshAccessToken = (rejectedToken?: string | null): Promise<string> => {
  const current = tokenStorage.getAccessToken();
  if (rejectedToken && current && current !== rejectedToken) return Promise.resolve(current);
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    expireSession();
    return Promise.reject(new Error('No refresh token available'));
  }
  refreshInFlight = (async () => {
    try {
      const response = await axios.post(BASE_URL + '/auth/refresh', { refreshToken }, {
        headers: { 'ngrok-skip-browser-warning': 'true' }, timeout: 15000,
      });
      const access = response.data?.accessToken;
      const refresh = response.data?.refreshToken;
      if (typeof access !== 'string' || !access || typeof refresh !== 'string' || !refresh) {
        throw new Error('Invalid refresh response');
      }
      // A logout/new login while the request was pending must not restore the old session.
      if (tokenStorage.getRefreshToken() !== refreshToken) throw new Error('Session changed during refresh');
      tokenStorage.setTokens(access, refresh);
      return access;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if ((status === 401 || status === 403) && tokenStorage.getRefreshToken() === refreshToken) expireSession();
      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
};

// A resource can misreport authorization failure as 401. Verify the identity
// endpoint before treating a rejected, freshly rotated token as a lost session.
export const verifySessionAfterUnauthorized = async (rejectedToken: string): Promise<boolean> => {
  if (tokenStorage.getAccessToken() !== rejectedToken) return false;
  try {
    const response = await axios.get(BASE_URL + '/auth/me', {
      headers: { Authorization: 'Bearer ' + rejectedToken, 'ngrok-skip-browser-warning': 'true' },
      timeout: 15000,
    });
    return Boolean(response.data?.id) && tokenStorage.getAccessToken() === rejectedToken;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && tokenStorage.getAccessToken() === rejectedToken) {
      expireSession();
    }
    return false;
  }
};

// Request interceptor: attach bearer token from tokenStorage
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (
    token &&
    !config.url?.includes("/auth/login") &&
    !config.url?.includes("/auth/register")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with synchronized refresh token rotation
apiClient.interceptors.response.use(
  (response) => {
    // Detect HTML responses from misconfigured Cloudflare Workers/Pages SPA fallbacks or proxy failures
    const contentType = (response.headers?.["content-type"] as string) || "";
    const rawData = response.data;

    if (
      contentType.includes("text/html") ||
      (typeof rawData === "string" && /^\s*<!doctype|^\s*<html/i.test(rawData))
    ) {
      const endpoint = response.config?.url || "API";
      const errorMsg = `Endpoint '${endpoint}' trả về HTML (SPA Fallback) thay vì JSON. Vui lòng kiểm tra cấu hình VITE_API_BASE_URL hoặc reverse proxy Cloudflare Workers.`;
      console.error(`[apiClient] Invalid response:`, errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    // Auto-parse JSON string if backend returned stringified JSON
    if (
      typeof rawData === "string" &&
      (rawData.trim().startsWith("{") || rawData.trim().startsWith("["))
    ) {
      try {
        response.data = JSON.parse(rawData);
      } catch {
        // Keep as string if parsing fails
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Ignore 401 from login, refresh, or register endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const authorization = originalRequest.headers?.Authorization;
      const rejectedToken = typeof authorization === 'string' ? authorization.replace(/^Bearer /, '') : null;
      const token = await refreshAccessToken(rejectedToken);
      originalRequest.headers.Authorization = 'Bearer ' + token;
      return apiClient(originalRequest);
    }
    if (error.response?.status === 401 && originalRequest?._retry && !isAuthEndpoint) {
      const sent = originalRequest.headers?.Authorization;
      const current = tokenStorage.getAccessToken();
      if (current && sent === 'Bearer ' + current) {
        if (originalRequest.url?.split('?')[0].endsWith('/auth/me')) expireSession();
        else await verifySessionAfterUnauthorized(current);
      }
    }

    const errorData: any = error.response?.data;
    let message =
      errorData?.message ||
      (typeof errorData === "string" ? errorData : null) ||
      error.message;

    // Friendly Vietnamese error translation
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isLoginOrAuth =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    if (status === 401) {
      if (isLoginOrAuth) {
        message = "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.";
      } else {
        message = tokenStorage.getAccessToken()
          ? "Máy chủ từ chối truy cập chức năng này. Vui lòng kiểm tra quyền của tài khoản."
          : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }
    } else if (status === 403) {
      // If server returned a specific message (e.g. Email not verified, account suspended), preserve it!
      if (
        !errorData?.message ||
        errorData.message === "Access denied" ||
        errorData.message === "Forbidden"
      ) {
        message = "Bạn không có quyền thực hiện thao tác này.";
      } else {
        message = errorData.message;
      }
    } else if (status === 404) {
      message = errorData?.message || "Không tìm thấy dữ liệu yêu cầu.";
    } else if (status === 409) {
      message =
        errorData?.message ||
        "Dữ liệu đã tồn tại hoặc xảy ra xung đột hệ thống.";
    } else if (status && status >= 500) {
      message = "Có lỗi xảy ra từ máy chủ hệ thống. Vui lòng thử lại sau.";
    } else if (
      !message ||
      message === "Network Error" ||
      message === "An unexpected error occurred"
    ) {
      message =
        "Có lỗi xảy ra hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại.";
    }

    const err = new Error(message);
    (err as any).originalError = error;
    (err as any).status = status;
    (err as any).response = error.response;
    (err as any).data = errorData;
    return Promise.reject(err);
  },
);
