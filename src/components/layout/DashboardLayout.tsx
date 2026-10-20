import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getRoleLabel } from '../../locales/i18n';

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
    if (path.includes('/admin/home')) return 'Bảng tin Điều hành Quản trị viên';
    if (path.includes('/admin/dashboard')) return 'Tổng quan Chỉ số KPI Hệ thống';
    if (path.includes('/admin/users')) return 'Quản lý Tài khoản & Phân quyền RBAC';
    if (path.includes('/admin/orders')) return 'Đơn hàng Toàn sàn';
    if (path.includes('/admin/products')) return 'Quản lý Sản phẩm Toàn sàn';
    if (path.includes('/admin/payments')) return 'Sổ cái Giao dịch Thanh toán';
    if (path.includes('/admin/reconstruction')) return 'Giám sát Pipeline Tái tạo 3D AI';
    if (path.includes('/admin/print-jobs')) return 'Lệnh in Sản xuất Xưởng';
    if (path.includes('/admin/printers')) return 'Đội máy in & Telemetry';
    if (path.includes('/admin/audit-logs')) return 'Nhật ký Kiểm toán Hệ thống';
    if (path.includes('/admin/system')) return 'Tình trạng Hạ tầng & Dịch vụ';

    if (path.includes('/manager/home')) return 'Trung tâm Điều hành Quản lý';
    if (path.includes('/manager/dashboard')) return 'Tổng quan Quản lý WMS & Sản xuất';
    if (path.includes('/manager/approvals')) return 'Trung tâm Phê duyệt';
    if (path.includes('/manager/materials')) return 'Danh mục Vật liệu In 3D';
    if (path.includes('/manager/warehouses')) return 'Quản lý Mạng lưới Kho WMS';
    if (path.includes('/manager/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/manager/categories')) return 'Danh mục Sản phẩm';
    if (path.includes('/manager/inventory/transactions')) return 'Sổ cái Biến động Tồn kho';
    if (path.includes('/manager/inventory')) return 'Bảng cân đối Tồn kho Thực tế';
    if (path.includes('/manager/receipts')) return 'Quản lý Nhập kho WMS';
    if (path.includes('/manager/issues')) return 'Quản lý Xuất kho WMS';
    if (path.includes('/manager/transfers')) return 'Điều chuyển Kho Nội bộ';
    if (path.includes('/manager/adjustments')) return 'Điều chỉnh Số dư Kho';
    if (path.includes('/manager/stock-counts')) return 'Phiếu Kiểm kê Kho';
    if (path.includes('/manager/orders')) return 'Xử lý Đơn hàng Sản xuất';
    if (path.includes('/manager/print-jobs')) return 'Lệnh in & Giữ vật tư';

    if (path.includes('/operator/home')) return 'Trạm Vận hành Xưởng in 3D';
    if (path.includes('/operator/jobs')) return 'Danh sách Lệnh in Cần xử lý';

    if (path.includes('/warehouse/home')) return 'Trang chủ Không gian Kho WMS';

    if (path.includes('/provider/home')) return 'Trang chủ Đối tác Gia công B2B';
    if (path.includes('/provider/orders')) return 'Đơn hàng Gia công Chế tác';

    if (path.includes('/driver/home')) return 'Trang chủ Đội ngũ Giao vận';
    if (path.includes('/driver/deliveries')) return 'Lịch trình Chuyến giao Hàng';

    if (path.includes('/customer/home')) return 'Không gian Sáng tạo Khách hàng';
    if (path.includes('/orders')) return 'Quản lý Đơn hàng Khách hàng';
    if (path.includes('/profile')) return 'Hồ sơ & Bảo mật Tài khoản';

    return getRoleLabel(forceRole || user?.role);
  };

  return (
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
            padding: '24px',
            width: '100%',
            maxWidth: 1680,
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
