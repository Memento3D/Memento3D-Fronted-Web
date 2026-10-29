import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query/queryClient';
import { AntdConfig } from './components/AntdConfig';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './features/auth/context/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { getRoleHomeRoute } from './utils/roleHomeRoutes';
import { RealTimeProvider } from './shared/realtime';
import { CartProvider } from './features/cart/context/CartContext';
import { WarehouseProvider } from './features/warehouse/context/WarehouseContext';
import { CustomerRoute } from './features/auth/components/CustomerRoute';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { RoleGuard } from './features/auth/components/RoleGuard';
import { GuestRoute } from './features/auth/components/GuestRoute';
import { Spin } from 'antd';
import { HomePage } from './features/home/pages/HomePage';

// Lazy-loaded Public, Catalog & Auth Pages for optimal initial payload
const LoginPage = React.lazy(() => import('./features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const EmailVerificationPage = React.lazy(() => import('./features/auth/pages/EmailVerificationPage').then((m) => ({ default: m.EmailVerificationPage })));
const VerifyEmailResultPage = React.lazy(() => import('./features/auth/pages/VerifyEmailResultPage').then((m) => ({ default: m.VerifyEmailResultPage })));
const CompleteRegistrationPage = React.lazy(() => import('./features/auth/pages/CompleteRegistrationPage').then((m) => ({ default: m.CompleteRegistrationPage })));
const TermsPage = React.lazy(() => import('./features/legal/pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPolicyPage = React.lazy(() => import('./features/legal/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const OAuthCallbackPage = React.lazy(() => import('./features/auth/pages/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })));
const ForbiddenPage = React.lazy(() => import('./features/auth/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const WarehouseSelectPage = React.lazy(() => import('./features/auth/pages/WarehouseSelectPage').then((m) => ({ default: m.WarehouseSelectPage })));
const NoWarehouseAccessPage = React.lazy(() => import('./features/auth/pages/NoWarehouseAccessPage').then((m) => ({ default: m.NoWarehouseAccessPage })));
const ForgotPasswordPage = React.lazy(() => import('./features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('./features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ProfilePage = React.lazy(() => import('./features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const ProductListPage = React.lazy(() => import('./features/products/pages/ProductListPage').then((m) => ({ default: m.ProductListPage })));
const ProductDetailPage = React.lazy(() => import('./features/products/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CategoryListPage = React.lazy(() => import('./features/products/pages/CategoryListPage').then((m) => ({ default: m.CategoryListPage })));
const CartPage = React.lazy(() => import('./features/cart/pages/CartPage').then((m) => ({ default: m.CartPage })));

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
const AdminLayout = React.lazy(() =>
  import('./features/admin/components/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = React.lazy(() =>
  import('./features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminUsersPage = React.lazy(() =>
  import('./features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminUserDetailPage = React.lazy(() =>
  import('./features/admin/pages/AdminUserDetailPage').then((m) => ({ default: m.AdminUserDetailPage }))
);
const AdminOrdersPage = React.lazy(() =>
  import('./features/admin/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminProductsPage = React.lazy(() =>
  import('./features/admin/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminReconstructionPage = React.lazy(() =>
  import('./features/admin/pages/AdminReconstructionPage').then((m) => ({ default: m.AdminReconstructionPage }))
);
const AdminPrintJobsPage = React.lazy(() =>
  import('./features/admin/pages/AdminPrintJobsPage').then((m) => ({ default: m.AdminPrintJobsPage }))
);
const AdminPrintersPage = React.lazy(() =>
  import('./features/admin/pages/AdminPrintersPage').then((m) => ({ default: m.AdminPrintersPage }))
);
const AdminPaymentsPage = React.lazy(() =>
  import('./features/admin/pages/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage }))
);
const AdminAuditLogsPage = React.lazy(() =>
  import('./features/admin/pages/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage }))
);
const AdminSystemHealthPage = React.lazy(() =>
  import('./features/admin/pages/AdminSystemHealthPage').then((m) => ({ default: m.AdminSystemHealthPage }))
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
const VnpayReturnPage = React.lazy(() =>
  import('./features/payment/pages/VnpayReturnPage').then((m) => ({ default: m.VnpayReturnPage }))
);
const ScanReconstructionPage = React.lazy(() =>
  import('./features/reconstruction/pages/ScanReconstructionPage').then((m) => ({ default: m.ScanReconstructionPage }))
);
const Create3DKeepsakePage = React.lazy(() =>
  import('./features/reconstruction/pages/Create3DKeepsakePage').then((m) => ({ default: m.Create3DKeepsakePage }))
);
const MyModelsPage = React.lazy(() =>
  import('./features/reconstruction/pages/MyModelsPage').then((m) => ({ default: m.MyModelsPage }))
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

// Devtools are lazy-loaded and only exist in development builds
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools }))
    )
  : () => null;

const RouteLoadingFallback: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
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
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </React.Suspense>
      )}
      <ThemeProvider>
        <AntdConfig>
          <ErrorBoundary>
            <AuthProvider>
            <RealTimeProvider>
              <BrowserRouter>
              <CartProvider>
                <WarehouseProvider>
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
                  <Route
                    path="/forgot-password"
                    element={
                      <GuestRoute>
                        <ForgotPasswordPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <GuestRoute>
                        <ResetPasswordPage />
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
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE']}>
                          <NoWarehouseAccessPage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/warehouse/select"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE']}>
                          <WarehouseSelectPage />
                        </RoleGuard>
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
                  <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
                  <Route path="/payment/result" element={<PaymentResultPage />} />

                  {/* Dedicated Customer Portal */}
                  <Route
                    path="/customer"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER']}>
                          <DashboardLayout forceRole="ROLE_USER" />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/customer/home" replace />} />
                    <Route path="home" element={<CustomerHomePage />} />
                    <Route path="orders" element={<CustomerOrdersPage />} />
                    <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
                  </Route>

                  {/* Customer Orders Shortcut */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout forceRole="ROLE_USER" />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<CustomerOrdersPage />} />
                    <Route path=":id" element={<CustomerOrderDetailPage />} />
                  </Route>

                  <Route path="/dashboard" element={<Navigate to="/manager/dashboard" replace />} />
                  <Route
                    path="/checkout"
                    element={
                      <CustomerRoute>
                        <CheckoutPage />
                      </CustomerRoute>
                    }
                  />
                  {/* Payment Gateway Callbacks & Return Pages */}
                  <Route
                    path="/payment/vnpay/return"
                    element={<VnpayReturnPage />}
                  />
                  <Route
                    path="/payment/result"
                    element={<PaymentResultPage />}
                  />
                  {/* User Profile & Account Security Management */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/addresses"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/security"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
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
                  <Route
                    path="/create-keepsake"
                    element={
                      <ProtectedRoute>
                        <Create3DKeepsakePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-models"
                    element={
                      <ProtectedRoute>
                        <MyModelsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/models"
                    element={
                      <ProtectedRoute>
                        <MyModelsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Manufacturing Partner Portal */}
                  <Route
                    path="/provider"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_PROVIDER']}>
                          <DashboardLayout forceRole="ROLE_PROVIDER" />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/provider/home" replace />} />
                    <Route path="home" element={<ProviderHomePage />} />
                    <Route path="orders" element={<ProviderOrdersPage />} />
                  </Route>

                  {/* Logistics & Delivery Driver Portal */}
                  <Route
                    path="/driver"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DRIVER']}>
                          <DashboardLayout forceRole="ROLE_DRIVER" />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/driver/home" replace />} />
                    <Route path="home" element={<DriverHomePage />} />
                    <Route path="deliveries" element={<DriverDeliveriesPage />} />
                  </Route>

                  {/* Admin Portal */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ROLE_ADMIN']}>
                          <AdminLayout />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/home" replace />} />
                    <Route path="home" element={<AdminHomePage />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="users/:id" element={<AdminUserDetailPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="reconstruction" element={<AdminReconstructionPage />} />
                    <Route path="print-jobs" element={<AdminPrintJobsPage />} />
                    <Route path="printers" element={<AdminPrintersPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                    <Route path="system" element={<AdminSystemHealthPage />} />
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
            </WarehouseProvider>
          </CartProvider>
              </BrowserRouter>
          </RealTimeProvider>
        </AuthProvider>
        </ErrorBoundary>
        </AntdConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
