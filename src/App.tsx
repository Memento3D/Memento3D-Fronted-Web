import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { MaterialListPage } from './pages/materials/MaterialListPage';
import { WarehouseListPage } from './pages/warehouses/WarehouseListPage';
import { InventoryDashboardPage } from './pages/inventory/InventoryDashboardPage';
import { StockReceiptPage } from './pages/inventory/StockReceiptPage';
import { StockIssuePage } from './pages/inventory/StockIssuePage';
import { TransactionLedgerPage } from './pages/inventory/TransactionLedgerPage';
import { PrintJobListPage } from './pages/printjobs/PrintJobListPage';

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
          <Route path="/" element={<Navigate to="/manager/inventory" replace />} />
          <Route path="/manager" element={<AppLayout />}>
            <Route index element={<Navigate to="/manager/inventory" replace />} />
            {/* Master Data */}
            <Route path="materials" element={<MaterialListPage />} />
            <Route path="warehouses" element={<WarehouseListPage />} />
            
            {/* Warehouse Operations */}
            <Route path="inventory" element={<InventoryDashboardPage />} />
            <Route path="inventory/receipts/new" element={<StockReceiptPage />} />
            <Route path="inventory/issues/new" element={<StockIssuePage />} />
            <Route path="inventory/transactions" element={<TransactionLedgerPage />} />
            
            {/* Production & Print Jobs */}
            <Route path="print-jobs" element={<PrintJobListPage />} />
            <Route path="print-jobs/:id/materials" element={<PrintJobListPage />} />

            <Route path="*" element={<Navigate to="/manager/inventory" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
