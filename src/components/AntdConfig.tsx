import React from 'react';
import { ConfigProvider, theme, App as AntdApp } from 'antd';

interface AntdConfigProps {
  children: React.ReactNode;
}

export const AntdConfig: React.FC<AntdConfigProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0ea5e9', // Cyber Forge Sky
          colorInfo: '#0ea5e9',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          colorBgBase: '#080c14',
          colorBgContainer: '#111827',
          colorBgElevated: '#1e293b',
          colorBorder: 'rgba(255, 255, 255, 0.1)',
          colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        },
        components: {
          Table: {
            headerBg: '#1e293b',
            headerColor: '#94a3b8',
            rowHoverBg: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          Card: {
            colorBgContainer: 'rgba(17, 24, 39, 0.85)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
          },
          Modal: {
            contentBg: '#111827',
            headerBg: '#111827',
          },
          Drawer: {
            colorBgElevated: '#111827',
          },
          Button: {
            primaryShadow: '0 0 12px rgba(14, 165, 233, 0.4)',
          },
        },
      }}
    >
      <AntdApp>
        {children}
      </AntdApp>
    </ConfigProvider>
  );
};
