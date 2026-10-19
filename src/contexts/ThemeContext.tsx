import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'memento3d-theme-mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(getSystemPrefersDark());

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  // Apply theme attributes to document and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }, [isDark]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage might be restricted
    }
  };

  const toggleTheme = () => {
    // If currently dark (either via 'dark' or 'system' evaluating to dark), switch to light
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
