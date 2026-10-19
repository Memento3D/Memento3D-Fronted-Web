import React from 'react';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useTheme } from '../contexts/ThemeContext';

dayjs.locale('vi');

interface AntdConfigProps {
  children: React.ReactNode;
}

export const AntdConfig: React.FC<AntdConfigProps> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark
          ? {
              colorPrimary: '#0ea5e9', // Cyber Forge Sky
              colorInfo: '#0ea5e9',
              colorSuccess: '#10b981',
              colorWarning: '#f59e0b',
              colorError: '#ef4444',
              borderRadius: 10,
              colorBgBase: '#080c14',
              colorBgContainer: '#111827',
              colorBgElevated: '#1e293b',
              colorBorder: 'rgba(255, 255, 255, 0.1)',
              colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
              colorText: '#f8fafc',
              colorTextSecondary: '#94a3b8',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            }
          : {
              colorPrimary: '#0284c7', // Crisp Royal Sky for Light Mode
              colorInfo: '#0284c7',
              colorSuccess: '#059669',
              colorWarning: '#d97706',
              colorError: '#dc2626',
              borderRadius: 10,
              colorBgBase: '#f8fafc',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#ffffff',
              colorBorder: 'rgba(15, 23, 42, 0.12)',
              colorBorderSecondary: 'rgba(15, 23, 42, 0.06)',
              colorText: '#0f172a',
              colorTextSecondary: '#475569',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            },
        components: {
          Table: isDark
            ? {
                headerBg: '#1e293b',
                headerColor: '#94a3b8',
                rowHoverBg: 'rgba(14, 165, 233, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }
            : {
                headerBg: '#f1f5f9',
                headerColor: '#475569',
                rowHoverBg: 'rgba(2, 132, 199, 0.05)',
                borderColor: '#e2e8f0',
              },
          Card: isDark
            ? {
                colorBgContainer: 'rgba(17, 24, 39, 0.85)',
                colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
              }
            : {
                colorBgContainer: '#ffffff',
                colorBorderSecondary: '#e2e8f0',
              },
          Modal: isDark
            ? {
                contentBg: '#111827',
                headerBg: '#111827',
              }
            : {
                contentBg: '#ffffff',
                headerBg: '#ffffff',
              },
          Drawer: isDark
            ? {
                colorBgElevated: '#111827',
              }
            : {
                colorBgElevated: '#ffffff',
              },
          Button: {
            primaryShadow: isDark
              ? '0 0 14px rgba(14, 165, 233, 0.35)'
              : '0 4px 14px rgba(2, 132, 199, 0.25)',
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};
