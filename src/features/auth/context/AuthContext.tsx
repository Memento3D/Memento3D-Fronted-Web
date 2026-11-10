import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import type { User, LoginPayload, AuthResponse } from '../types/auth.types';
import { clearAuthCache } from '../../../lib/query/queryClient';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  loginWithTokens: (accessToken: string, refreshToken?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load current user profile from backend on app bootstrap
  const initSession = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn('Failed to restore auth session:', err);
      // Network/proxy/server failures do not prove the session was revoked.
      const status = (err as { status?: number; response?: { status?: number } }).status ??
        (err as { response?: { status?: number } }).response?.status;
      if (status === 401 || status === 403) tokenStorage.clearTokens();
      await clearAuthCache();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();

    // Listen to session expired events from apiClient interceptor
    const handleSessionExpired = async () => {
      setUser(null);
      tokenStorage.clearTokens();
      await clearAuthCache();
    };

    window.addEventListener('memento3d:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('memento3d:session-expired', handleSessionExpired);
    };
  }, [initSession]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      await clearAuthCache();
      const authRes: AuthResponse = await authApi.login(payload);
      tokenStorage.setTokens(authRes.accessToken, authRes.refreshToken);
      setUser(authRes.user);
      return authRes.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTokens = async (accessToken: string, refreshToken?: string): Promise<User> => {
    setIsLoading(true);
    try {
      await clearAuthCache();
      tokenStorage.setTokens(accessToken, refreshToken);
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const refreshToken = tokenStorage.getRefreshToken() || undefined;
      await authApi.logout({ refreshToken }).catch(() => {});
    } finally {
      tokenStorage.clearTokens();
      await clearAuthCache();
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      return null;
    }
  };

  const updateUser = useCallback((updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithTokens,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
