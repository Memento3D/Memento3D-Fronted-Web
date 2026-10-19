import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@ant-design/icons')) {
              return 'vendor-antd-icons';
            }
            if (id.includes('antd')) {
              return 'vendor-antd';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@amcharts')) {
              return 'vendor-amcharts';
            }
            if (id.includes('three')) {
              return 'vendor-three';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            return 'vendor-misc';
          }
        },
      },
    },
  },
});
