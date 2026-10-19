import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AntdConfig } from './components/AntdConfig';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './features/auth/context/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { getRoleHomeRoute } from './utils/roleHomeRoutes';
import { RealTimeProvider } from './shared/realtime';
import { CartProvider } from './features/cart/context/CartContext';
import { WarehouseProvider } from './features/warehouse/context/WarehouseContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { RoleGuard } from './features/auth/components/RoleGuard';
import { GuestRoute } from './features/auth/components/GuestRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { EmailVerificationPage } from './features/auth/pages/EmailVerificationPage';
import { VerifyEmailResultPage } from './features/auth/pages/VerifyEmailResultPage';
import { CompleteRegistrationPage } from './features/auth/pages/CompleteRegistrationPage';
import { TermsPage } from './features/legal/pages/TermsPage';
import { PrivacyPolicyPage } from './features/legal/pages/PrivacyPolicyPage';
import { OAuthCallbackPage } from './features/auth/pages/OAuthCallbackPage';
import { ForbiddenPage } from './features/auth/pages/ForbiddenPage';
import { WarehouseSelectPage } from './features/auth/pages/WarehouseSelectPage';
import { NoWarehouseAccessPage } from './features/auth/pages/NoWarehouseAccessPage';

import { Spin } from 'antd';
import { HomePage } from './features/home/pages/HomePage';
import { ProductListPage } from './features/products/pages/ProductListPage';
import { ProductDetailPage } from './features/products/pages/ProductDetailPage';
import { CategoryListPage } from './features/products/pages/CategoryListPage';
import { CartPage } from './features/cart/pages/CartPage';

// Actor Home Pages (Dedicated per Actor)
const ManagerHomePage = React.lazy(() =>
  import('./features/manager/pages/ManagerHomePage').then((m) => ({ default: m.ManagerHomePage }))
);
const OperatorHomePage = React.lazy(() =>
  import('./features/operator/pages/OperatorHomePage').then((m) => ({ default: m.OperatorHomePage }))
);
const WarehouseHomePage = React.lazy(() =>
  import('./features/warehouse/pages/WarehouseHomePage').then((m) => ({ default: m.WarehouseHomePage }))
);
const AdminHomePage = React.lazy(() =>
  import('./features/admin/pages/AdminHomePage').then((m) => ({ default: m.AdminHomePage }))
);
const CustomerHomePage = React.lazy(() =>
  import('./features/customer/pages/CustomerHomePage').then((m) => ({ default: m.CustomerHomePage }))
);
const ProviderHomePage = React.lazy(() =>
  import('./features/provider/pages/ProviderHomePage').then((m) => ({ default: m.ProviderHomePage }))
);
const DriverHomePage = React.lazy(() =>
  import('./features/driver/pages/DriverHomePage').then((m) => ({ default: m.DriverHomePage }))
);

// Code-split / Lazy-loaded Heavy Feature Pages
const MaterialManagementPage = React.lazy(() =>
  import('./features/material/pages/MaterialManagementPage').then((m) => ({ default: m.MaterialManagementPage }))
);
const WarehouseManagementPage = React.lazy(() =>
  import('./features/warehouse/pages/WarehouseManagementPage').then((m) => ({ default: m.WarehouseManagementPage }))
);
const WarehouseDashboardPage = React.lazy(() =>
  import('./features/inventory/pages/WarehouseDashboardPage').then((m) => ({ default: m.WarehouseDashboardPage }))
);
const StockReceiptPage = React.lazy(() =>
  import('./features/inventory/pages/StockReceiptPage').then((m) => ({ default: m.StockReceiptPage }))
);
const StockIssuePage = React.lazy(() =>
  import('./features/inventory/pages/StockIssuePage').then((m) => ({ default: m.StockIssuePage }))
);
const StockMovementReportPage = React.lazy(() =>
  import('./features/inventory/pages/StockMovementReportPage').then((m) => ({ default: m.StockMovementReportPage }))
);
const GoodsReceiptsManagementPage = React.lazy(() =>
  import('./features/inventory/pages/GoodsReceiptsManagementPage').then((m) => ({ default: m.GoodsReceiptsManagementPage }))
);
const StockIssuesManagementPage = React.lazy(() =>
  import('./features/inventory/pages/StockIssuesManagementPage').then((m) => ({ default: m.StockIssuesManagementPage }))
);
const WarehouseTransfersPage = React.lazy(() =>
  import('./features/inventory/pages/WarehouseTransfersPage').then((m) => ({ default: m.WarehouseTransfersPage }))
);
const StockAdjustmentsPage = React.lazy(() =>
  import('./features/inventory/pages/StockAdjustmentsPage').then((m) => ({ default: m.StockAdjustmentsPage }))
);
const StockCountsPage = React.lazy(() =>
  import('./features/inventory/pages/StockCountsPage').then((m) => ({ default: m.StockCountsPage }))
);
const ManagerDashboardPage = React.lazy(() =>
  import('./features/manager/pages/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage }))
);
const ManagerApprovalsCenterPage = React.lazy(() =>
  import('./features/manager/pages/ManagerApprovalsCenterPage').then((m) => ({ default: m.ManagerApprovalsCenterPage }))
);
const AdminDashboardPage = React.lazy(() =>
  import('./features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const PrintJobOperationsPage = React.lazy(() =>
  import('./features/printjob/pages/PrintJobOperationsPage').then((m) => ({ default: m.PrintJobOperationsPage }))
);
const CustomerOrdersPage = React.lazy(() =>
  import('./features/customer/pages/CustomerOrdersPage').then((m) => ({ default: m.CustomerOrdersPage }))
);
const CustomerOrderDetailPage = React.lazy(() =>
  import('./features/orders/pages/CustomerOrderDetailPage').then((m) => ({ default: m.CustomerOrderDetailPage }))
);
const CheckoutPage = React.lazy(() =>
  import('./features/orders/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const PaymentResultPage = React.lazy(() =>
  import('./features/payment/pages/PaymentResultPage').then((m) => ({ default: m.PaymentResultPage }))
);
const ScanReconstructionPage = React.lazy(() =>
  import('./features/reconstruction/pages/ScanReconstructionPage').then((m) => ({ default: m.ScanReconstructionPage }))
);
const ManagerOrdersPage = React.lazy(() =>
  import('./features/orders/pages/ManagerOrdersPage').then((m) => ({ default: m.ManagerOrdersPage }))
);
const ManagerOrderDetailPage = React.lazy(() =>
  import('./features/orders/pages/ManagerOrderDetailPage').then((m) => ({ default: m.ManagerOrderDetailPage }))
);
const ManagerProductsPage = React.lazy(() =>
  import('./features/manager/pages/ManagerProductsPage').then((m) => ({ default: m.ManagerProductsPage }))
);
const ManagerCategoriesPage = React.lazy(() =>
  import('./features/manager/pages/ManagerCategoriesPage').then((m) => ({ default: m.ManagerCategoriesPage }))
);
const ProviderOrdersPage = React.lazy(() =>
  import('./features/provider/pages/ProviderOrdersPage').then((m) => ({ default: m.ProviderOrdersPage }))
);
const DriverDeliveriesPage = React.lazy(() =>
  import('./features/driver/pages/DriverDeliveriesPage').then((m) => ({ default: m.DriverDeliveriesPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const RouteLoadingFallback: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050811',
    }}
  >
    <Spin size="large" />
  </div>
);

/**
 * Root Route handler:
 * - Unauthenticated: Public Landing Page (HomePage)
 * - Authenticated: Actor Home Page (based on current user role)
 */
const RootRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingFallback />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomeRoute(user.role)} replace />;
  }

  return <HomePage />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AntdConfig>
          <ErrorBoundary>
            <AuthProvider>
            <RealTimeProvider>
              <CartProvider>
                <WarehouseProvider>
              <BrowserRouter>
                <React.Suspense fallback={<RouteLoadingFallback />}>
                <Routes>
                  {/* Guest Customer Register & Email Verification Routes */}
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <RegisterPage />
                      </GuestRoute>
                    }
                  />
                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                  <Route path="/verify-email/confirm" element={<VerifyEmailResultPage />} />
                  <Route
                    path="/complete-registration"
                    element={
                      <ProtectedRoute>
                        <CompleteRegistrationPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public Legal Documents */}
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />

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

                  {/* Root Route: Actor Home if authenticated, Public Storefront if guest */}
                  <Route path="/" element={<RootRoute />} />

                  {/* Public Storefront Routes */}
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/categories" element={<CategoryListPage />} />
                  <Route path="/categories/:slug" element={<ProductListPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/payment/result" element={<PaymentResultPage />} />

                  {/* Dedicated Customer Home & Portal */}
                  <Route
                    path="/customer/home"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <CustomerHomePage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
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
                  <Route path="/dashboard" element={<Navigate to="/manager/dashboard" replace />} />
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
                    path="/provider/home"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_PROVIDER']}>
                          <ProviderHomePage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
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
                    path="/driver/home"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DRIVER']}>
                          <DriverHomePage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
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

                  {/* Admin Portal */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                          <AppLayout />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/home" replace />} />
                    <Route path="home" element={<AdminHomePage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                  </Route>

                  {/* Operator Portal */}
                  <Route
                    path="/operator"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_OPERATOR']}>
                          <AppLayout />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/operator/home" replace />} />
                    <Route path="home" element={<OperatorHomePage />} />
                    <Route path="jobs" element={<PrintJobOperationsPage />} />
                  </Route>

                  {/* Warehouse Portal */}
                  <Route
                    path="/warehouse"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE']}>
                          <AppLayout />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/warehouse/home" replace />} />
                    <Route path="home" element={<WarehouseHomePage />} />
                    <Route path="inventory" element={<WarehouseDashboardPage />} />
                    <Route path="receipts" element={<GoodsReceiptsManagementPage />} />
                    <Route path="issues" element={<StockIssuesManagementPage />} />
                  </Route>

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
                    <Route index element={<Navigate to="/manager/home" replace />} />
                    <Route
                      path="home"
                      element={
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <ManagerHomePage />
                        </RoleGuard>
                      }
                    />

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

                    <Route path="*" element={<Navigate to="/manager/home" replace />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                </React.Suspense>
              </BrowserRouter>
            </WarehouseProvider>
          </CartProvider>
          </RealTimeProvider>
        </AuthProvider>
        </ErrorBoundary>
        </AntdConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
