import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { MaterialListPage } from './pages/materials/MaterialListPage';
import { WarehouseListPage } from './pages/warehouses/WarehouseListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/manager/materials" replace />} />
          <Route path="/manager" element={<AppLayout />}>
            <Route index element={<Navigate to="/manager/materials" replace />} />
            <Route path="materials" element={<MaterialListPage />} />
            <Route path="warehouses" element={<WarehouseListPage />} />
            <Route path="*" element={<Navigate to="/manager/materials" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
