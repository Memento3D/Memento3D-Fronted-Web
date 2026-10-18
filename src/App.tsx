import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AntdConfig } from './components/AntdConfig';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './features/auth/context/AuthContext';
import { WarehouseProvider } from './features/warehouse/context/WarehouseContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { RoleGuard } from './features/auth/components/RoleGuard';
import { GuestRoute } from './features/auth/components/GuestRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { OAuthCallbackPage } from './features/auth/pages/OAuthCallbackPage';
import { ForbiddenPage } from './features/auth/pages/ForbiddenPage';
import { WarehouseSelectPage } from './features/auth/pages/WarehouseSelectPage';
import { NoWarehouseAccessPage } from './features/auth/pages/NoWarehouseAccessPage';

import { MaterialManagementPage } from './features/material/pages/MaterialManagementPage';
import { WarehouseManagementPage } from './features/warehouse/pages/WarehouseManagementPage';
import { WarehouseDashboardPage } from './features/inventory/pages/WarehouseDashboardPage';
import { StockReceiptPage } from './features/inventory/pages/StockReceiptPage';
import { StockIssuePage } from './features/inventory/pages/StockIssuePage';
import { StockMovementReportPage } from './features/inventory/pages/StockMovementReportPage';
import { PrintJobOperationsPage } from './features/printjob/pages/PrintJobOperationsPage';
import { HomePage } from './features/home/pages/HomePage';
import { CustomerOrdersPage } from './features/customer/pages/CustomerOrdersPage';
import { ProviderOrdersPage } from './features/provider/pages/ProviderOrdersPage';
import { DriverDeliveriesPage } from './features/driver/pages/DriverDeliveriesPage';

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
      <AntdConfig>
        <AuthProvider>
          <WarehouseProvider>
            <BrowserRouter>
              <Routes>
                {/* Guest Actor Login Routes */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="customer" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/admin/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="admin" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/manager/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="manager" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/warehouse/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="warehouse" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/operator/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="operator" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/provider/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="provider" />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/driver/login"
                  element={
                    <GuestRoute>
                      <LoginPage actor="driver" />
                    </GuestRoute>
                  }
                />

                {/* OAuth2 Callback Handlers */}
                <Route path="/oauth2/redirect" element={<OAuthCallbackPage />} />
                <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

                {/* Security Error & Warehouse Flow Pages */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route
                  path="/warehouse/no-access"
                  element={
                    <ProtectedRoute>
                      <NoWarehouseAccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warehouse/select"
                  element={
                    <ProtectedRoute>
                      <WarehouseSelectPage />
                    </ProtectedRoute>
                  }
                />

                {/* Public Landing Page */}
                <Route path="/" element={<HomePage />} />

                {/* Customer / Client Portal */}
                <Route
                  path="/customer/orders"
                  element={
                    <ProtectedRoute>
                      <CustomerOrdersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manufacturing Partner Portal */}
                <Route
                  path="/provider/orders"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_PROVIDER']}>
                        <ProviderOrdersPage />
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Logistics & Delivery Driver Portal */}
                <Route
                  path="/driver/deliveries"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DRIVER']}>
                        <DriverDeliveriesPage />
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Management & WMS Portal */}
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE', 'ROLE_OPERATOR']}>
                        <AppLayout />
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/manager/inventory" replace />} />
                  
                  {/* Master Data */}
                  <Route path="materials" element={<MaterialManagementPage />} />
                  <Route
                    path="warehouses"
                    element={
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                        <WarehouseManagementPage />
                      </RoleGuard>
                    }
                  />

                  {/* Warehouse Operations */}
                  <Route path="inventory" element={<WarehouseDashboardPage />} />
                  <Route
                    path="inventory/receipts/new"
                    element={
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE']}>
                        <StockReceiptPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="inventory/issues/new"
                    element={
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE']}>
                        <StockIssuePage />
                      </RoleGuard>
                    }
                  />
                  <Route path="inventory/transactions" element={<StockMovementReportPage />} />

                  {/* Production & Print Jobs */}
                  <Route
                    path="print-jobs"
                    element={
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR']}>
                        <PrintJobOperationsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="print-jobs/:id/materials"
                    element={
                      <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR']}>
                        <PrintJobOperationsPage />
                      </RoleGuard>
                    }
                  />

                  <Route path="*" element={<Navigate to="/manager/inventory" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </WarehouseProvider>
        </AuthProvider>
      </AntdConfig>
    </QueryClientProvider>
  );
};

export default App;
