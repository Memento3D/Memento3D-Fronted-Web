import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getRoleLabel } from '../../locales/i18n';
import { DashboardShellContext } from './DashboardShellContext';
import { getCustomerNavigationItem } from './navigationConfig';

const SIDEBAR_COLLAPSE_KEY = 'memento3d-sidebar-collapsed';

export interface DashboardLayoutProps {
  forceRole?: string;
  defaultTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  forceRole,
  defaultTitle,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true';
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  const getPageTitle = (): string => {
    if (defaultTitle) return defaultTitle;
    const path = location.pathname;
    if (user?.role === 'ROLE_USER') {
      if (path === '/checkout') return 'Thanh toán';
      if (path === '/create-keepsake') return 'Tạo kỷ vật 3D';
      if (path === '/my-models' || path === '/customer/models') return 'Mô hình của tôi';
      const item = getCustomerNavigationItem(path);
      if (item) return item.label;
    }
    if (path.includes('/admin/home')) return 'Tổng quan Quản trị';
    if (path.includes('/admin/dashboard')) return 'Chỉ số Hệ thống';
    if (path.includes('/admin/users')) return 'Quản lý Tài khoản';
    if (path.includes('/admin/orders')) return 'Quản lý Đơn hàng';
    if (path.includes('/admin/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/admin/payments')) return 'Lịch sử Thanh toán';
    if (path.includes('/admin/reconstruction')) return 'Giám sát Tái tạo 3D';
    if (path.includes('/admin/print-jobs')) return 'Lệnh in Sản xuất';
    if (path.includes('/admin/printers')) return 'Quản lý Máy in';
    if (path.includes('/admin/audit-logs')) return 'Nhật ký Kiểm toán';
    if (path.includes('/admin/system')) return 'Tình trạng Hệ thống';

    if (path.includes('/manager/home')) return 'Tổng quan Quản lý';
    if (path.includes('/manager/dashboard')) return 'Quản lý WMS & Sản xuất';
    if (path.includes('/manager/approvals')) return 'Phê duyệt Yêu cầu';
    if (path.includes('/manager/materials')) return 'Vật liệu In 3D';
    if (path.includes('/manager/warehouses')) return 'Quản lý Kho hàng';
    if (path.includes('/manager/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/manager/categories')) return 'Danh mục Sản phẩm';
    if (path.includes('/manager/inventory/transactions')) return 'Biến động Kho';
    if (path.includes('/manager/inventory')) return 'Tồn kho Thực tế';
    if (path.includes('/manager/receipts')) return 'Nhập kho';
    if (path.includes('/manager/issues')) return 'Xuất kho';
    if (path.includes('/manager/transfers')) return 'Điều chuyển Kho';
    if (path.includes('/manager/adjustments')) return 'Điều chỉnh Kho';
    if (path.includes('/manager/stock-counts')) return 'Kiểm kê Kho';
    if (path.includes('/manager/orders')) return 'Đơn hàng Sản xuất';
    if (path.includes('/manager/print-jobs')) return 'Lệnh in & Vật tư';

    if (path.includes('/operator/home')) return 'Vận hành Xưởng in';
    if (path.includes('/operator/jobs')) return 'Danh sách Lệnh in';

    if (path.includes('/warehouse/home')) return 'Tổng quan Kho hàng';

    if (path.includes('/provider/home')) return 'Tổng quan Đối tác';
    if (path.includes('/provider/orders')) return 'Đơn hàng Gia công';

    if (path.includes('/driver/home')) return 'Tổng quan Giao vận';
    if (path.includes('/driver/deliveries')) return 'Lịch trình Giao hàng';

    if (path.includes('/customer/home')) return 'Trang chủ Khách hàng';
    if (path.includes('/orders')) return 'Đơn hàng của tôi';
    if (path.includes('/profile')) return 'Thông tin Tài khoản';

    return getRoleLabel(forceRole || user?.role);
  };

  return (
    <DashboardShellContext.Provider value={true}>
    <div
      id="dashboard-layout-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        width: '100%',
      }}
    >
      {/* Sidebar with Drawer on mobile */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        forceRole={forceRole}
      />

      {/* Main Container Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        <Topbar
          onToggleMobileMenu={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          title={getPageTitle()}
        />

        <main
          className="dashboard-main-content"
          style={{
            flex: 1,
            padding: 'clamp(16px, 2vw, 24px)',
            width: '100%',
            maxWidth: 'var(--content-max-width, 1440px)',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
    </DashboardShellContext.Provider>
  );
};
