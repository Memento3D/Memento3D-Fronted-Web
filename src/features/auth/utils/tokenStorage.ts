const ACCESS_TOKEN_KEY = 'memento3d_access_token';
const REFRESH_TOKEN_KEY = 'memento3d_refresh_token';
const USER_KEY = 'memento3d_current_user';
const INTENDED_URL_KEY = 'memento3d_intended_url';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(INTENDED_URL_KEY);
  },

  saveIntendedUrl: (url: string): void => {
    localStorage.setItem(INTENDED_URL_KEY, url);
  },

  clearIntendedUrl: (): void => {
    localStorage.removeItem(INTENDED_URL_KEY);
  },

  getIntendedUrl: (): string | null => {
    const url = localStorage.getItem(INTENDED_URL_KEY);
    localStorage.removeItem(INTENDED_URL_KEY);
    return url;
  },
};
