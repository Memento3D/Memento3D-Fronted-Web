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
              colorPrimary: '#B6A3FF', // Atelier Forge Dark Violet
              colorPrimaryHover: '#C7B7FF',
              colorInfo: '#B6A3FF',
              colorSuccess: '#8EC3A3',
              colorWarning: '#FFBA7A',
              colorError: '#FFB4AB',
              borderRadius: 16,
              colorBgBase: '#151221',
              colorBgContainer: '#1D192B',
              colorBgElevated: '#252036',
              colorBgLayout: '#151221',
              colorBorder: '#45405A',
              colorBorderSecondary: '#302A44',
              colorText: '#F8F4FF',
              colorTextSecondary: '#C9C0DD',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            }
          : {
              colorPrimary: '#7C5CFC', // Atelier Forge Brand Violet
              colorPrimaryHover: '#6945ED',
              colorInfo: '#7C5CFC',
              colorSuccess: '#466253',
              colorWarning: '#B35C00',
              colorError: '#BA1A1A',
              borderRadius: 16,
              colorBgBase: '#F8F5FF',
              colorBgContainer: '#FFFFFF',
              colorBgElevated: '#FFFFFF',
              colorBgLayout: '#F8F5FF',
              colorBorder: '#E2D9F7',
              colorBorderSecondary: '#F1EBFF',
              colorText: '#28243D',
              colorTextSecondary: '#6A6282',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            },
        components: {
          Table: isDark
            ? {
                headerBg: '#252036',
                headerColor: '#C9C0DD',
                rowHoverBg: 'rgba(182, 163, 255, 0.08)',
                borderColor: '#45405A',
                borderRadius: 24,
              }
            : {
                headerBg: '#F7F1FF',
                headerColor: '#6A6282',
                rowHoverBg: '#F8F5FF',
                borderColor: '#E2D9F7',
                borderRadius: 24,
              },
          Card: isDark
            ? {
                colorBgContainer: '#1D192B',
                colorBorderSecondary: '#45405A',
                borderRadiusLG: 24,
              }
            : {
                colorBgContainer: '#FFFFFF',
                colorBorderSecondary: '#E2D9F7',
                borderRadiusLG: 24,
              },
          Modal: isDark
            ? {
                contentBg: '#1D192B',
                headerBg: '#1D192B',
                borderRadiusLG: 28,
              }
            : {
                contentBg: '#FFFFFF',
                headerBg: '#FFFFFF',
                borderRadiusLG: 28,
              },
          Drawer: isDark
            ? {
                colorBgElevated: '#1D192B',
              }
            : {
                colorBgElevated: '#FFFFFF',
              },
          Button: {
            borderRadius: 9999,
            primaryShadow: isDark
              ? '0 0 16px rgba(182, 163, 255, 0.28)'
              : '0 4px 14px rgba(124, 92, 252, 0.22)',
          },
          Input: {
            borderRadius: 20,
          },
          Select: {
            borderRadius: 20,
          },
          Tag: {
            borderRadiusSM: 9999,
          },
          Pagination: {
            itemActiveBg: isDark ? '#B6A3FF' : '#7C5CFC',
          },
          Tabs: {
            inkBarColor: isDark ? '#B6A3FF' : '#7C5CFC',
            itemActiveColor: isDark ? '#B6A3FF' : '#7C5CFC',
            itemHoverColor: isDark ? '#C7B7FF' : '#6945ED',
            itemSelectedColor: isDark ? '#B6A3FF' : '#7C5CFC',
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};
