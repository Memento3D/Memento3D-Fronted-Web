import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AntdConfig } from './components/AntdConfig';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './features/auth/context/AuthContext';
import { RealTimeProvider } from './shared/realtime';
import { CartProvider } from './features/cart/context/CartContext';
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
import { GoodsReceiptsManagementPage } from './features/inventory/pages/GoodsReceiptsManagementPage';
import { StockIssuesManagementPage } from './features/inventory/pages/StockIssuesManagementPage';
import { WarehouseTransfersPage } from './features/inventory/pages/WarehouseTransfersPage';
import { StockAdjustmentsPage } from './features/inventory/pages/StockAdjustmentsPage';
import { StockCountsPage } from './features/inventory/pages/StockCountsPage';
import { ManagerDashboardPage } from './features/manager/pages/ManagerDashboardPage';
import { ManagerApprovalsCenterPage } from './features/manager/pages/ManagerApprovalsCenterPage';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { PrintJobOperationsPage } from './features/printjob/pages/PrintJobOperationsPage';
import { HomePage } from './features/home/pages/HomePage';
import { ProductListPage } from './features/products/pages/ProductListPage';
import { ProductDetailPage } from './features/products/pages/ProductDetailPage';
import { CategoryListPage } from './features/products/pages/CategoryListPage';
import { CartPage } from './features/cart/pages/CartPage';
import { CustomerOrdersPage } from './features/customer/pages/CustomerOrdersPage';
import { CustomerOrderDetailPage } from './features/orders/pages/CustomerOrderDetailPage';
import { CheckoutPage } from './features/orders/pages/CheckoutPage';
import { PaymentResultPage } from './features/payment/pages/PaymentResultPage';
import { ScanReconstructionPage } from './features/reconstruction/pages/ScanReconstructionPage';
import { ManagerOrdersPage } from './features/orders/pages/ManagerOrdersPage';
import { ManagerOrderDetailPage } from './features/orders/pages/ManagerOrderDetailPage';
import { ManagerProductsPage } from './features/manager/pages/ManagerProductsPage';
import { ManagerCategoriesPage } from './features/manager/pages/ManagerCategoriesPage';
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
          <RealTimeProvider>
            <CartProvider>
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

                  {/* Public Storefront Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/categories" element={<CategoryListPage />} />
                  <Route path="/categories/:slug" element={<ProductListPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/payment/result" element={<PaymentResultPage />} />

                  {/* Customer / Client Portal */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <CustomerOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <CustomerOrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/customer/orders" element={<Navigate to="/orders" replace />} />
                  <Route path="/customer/orders/:id" element={<Navigate to="/orders/:id" replace />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/scans/:scanId"
                    element={
                      <ProtectedRoute>
                        <ScanReconstructionPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reconstruction/:scanId"
                    element={
                      <ProtectedRoute>
                        <ScanReconstructionPage />
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
                    <Route index element={<Navigate to="/manager/dashboard" replace />} />

                    {/* Executive & Governance */}
                    <Route
                      path="admin"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                          <AdminDashboardPage />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="dashboard"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <ManagerDashboardPage />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="approvals"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <ManagerApprovalsCenterPage />
                        </RoleGuard>
                      }
                    />

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
                    <Route
                      path="products"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <ManagerProductsPage />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="categories"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <ManagerCategoriesPage />
                        </RoleGuard>
                      }
                    />

                    {/* Warehouse Operations */}
                    <Route path="inventory" element={<WarehouseDashboardPage />} />
                    <Route path="receipts" element={<GoodsReceiptsManagementPage />} />
                    <Route
                      path="inventory/receipts/new"
                      element={<StockReceiptPage />}
                    />
                    <Route path="issues" element={<StockIssuesManagementPage />} />
                    <Route
                      path="inventory/issues/new"
                      element={<StockIssuePage />}
                    />
                    <Route path="transfers" element={<WarehouseTransfersPage />} />
                    <Route path="adjustments" element={<StockAdjustmentsPage />} />
                    <Route path="stock-counts" element={<StockCountsPage />} />
                    <Route path="inventory/transactions" element={<StockMovementReportPage />} />

                    {/* Production & Print Jobs */}
                    <Route
                      path="orders"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR']}>
                          <ManagerOrdersPage />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="orders/:id"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR']}>
                          <ManagerOrderDetailPage />
                        </RoleGuard>
                      }
                    />
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

                    <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrowserRouter>
            </WarehouseProvider>
          </CartProvider>
          </RealTimeProvider>
        </AuthProvider>
      </AntdConfig>
    </QueryClientProvider>
  );
};

export default App;
