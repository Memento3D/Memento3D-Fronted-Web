import {
  Home,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Layers,
  CreditCard,
  Box,
  Printer,
  FileText,
  Activity,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  ClipboardCheck,
  History,
  CheckSquare,
  Truck,
  ShoppingCart,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../features/auth/types/auth.types';

export interface NavItemConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
  activePaths?: string[];
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export const navigationByRole: Record<string, NavSectionConfig[]> = {
  // ADMIN Role Navigation
  ROLE_ADMIN: [
    {
      title: 'Không gian điều hành',
      items: [
        { path: '/admin/home', label: 'Trang chủ', icon: Home, exact: true },
        { path: '/admin/dashboard', label: 'Tổng quan KPI', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Quản trị tài khoản & RBAC',
      items: [
        { path: '/admin/users', label: 'Quản lý tài khoản', icon: Users },
      ],
    },
    {
      title: 'Thương mại & Danh mục',
      items: [
        { path: '/admin/orders', label: 'Đơn hàng toàn sàn', icon: ShoppingBag },
        { path: '/admin/products', label: 'Sản phẩm & Danh mục', icon: Package },
        { path: '/admin/payments', label: 'Sổ cái thanh toán', icon: CreditCard },
      ],
    },
    {
      title: 'Công nghệ 3D & Sản xuất',
      items: [
        { path: '/admin/reconstruction', label: 'Tái tạo 3D AI', icon: Box },
        { path: '/admin/print-jobs', label: 'Lệnh in sản xuất', icon: Layers },
        { path: '/admin/printers', label: 'Đội máy in & Telemetry', icon: Printer },
      ],
    },
    {
      title: 'Kho WMS & Hậu cần',
      items: [
        { path: '/manager/warehouses', label: 'Quản lý Kho', icon: Warehouse },
        { path: '/manager/inventory', label: 'Tồn kho vật liệu', icon: Layers },
        { path: '/manager/materials', label: 'Danh mục vật liệu', icon: Box },
      ],
    },
    {
      title: 'An toàn & Hạ tầng',
      items: [
        { path: '/admin/audit-logs', label: 'Nhật ký kiểm toán', icon: FileText },
        { path: '/admin/system', label: 'Hạ tầng hệ thống', icon: Activity },
      ],
    },
  ],

  // MANAGER Role Navigation
  ROLE_MANAGER: [
    {
      title: 'Không gian làm việc',
      items: [
        { path: '/manager/home', label: 'Trang chủ Quản lý', icon: Home, exact: true },
        { path: '/manager/dashboard', label: 'Tổng quan Điều hành', icon: LayoutDashboard },
        { path: '/manager/approvals', label: 'Trung tâm phê duyệt', icon: CheckSquare },
      ],
    },
    {
      title: 'Dữ liệu danh mục',
      items: [
        { path: '/manager/materials', label: 'Danh mục Vật liệu', icon: Box },
        { path: '/manager/warehouses', label: 'Quản lý Kho', icon: Warehouse },
        { path: '/manager/products', label: 'Sản phẩm', icon: Package },
        { path: '/manager/categories', label: 'Danh mục sản phẩm', icon: Layers },
      ],
    },
    {
      title: 'Vận hành tồn kho WMS',
      items: [
        { path: '/manager/inventory', label: 'Tồn kho thực tế', icon: Layers, exact: true },
        { path: '/manager/receipts', label: 'Nhập kho', icon: ArrowDownLeft },
        { path: '/manager/issues', label: 'Xuất kho', icon: ArrowUpRight },
        { path: '/manager/transfers', label: 'Điều chuyển kho', icon: ArrowLeftRight },
        { path: '/manager/adjustments', label: 'Điều chỉnh kho', icon: Sliders },
        { path: '/manager/stock-counts', label: 'Kiểm kê kho', icon: ClipboardCheck },
        { path: '/manager/inventory/transactions', label: 'Sổ cái biến động kho', icon: History },
      ],
    },
    {
      title: 'Sản xuất & Đơn hàng',
      items: [
        { path: '/manager/orders', label: 'Xử lý đơn hàng', icon: ShoppingBag },
        { path: '/manager/print-jobs', label: 'Lệnh in (Giữ vật liệu)', icon: Printer },
      ],
    },
  ],

  // OPERATOR Role Navigation
  ROLE_OPERATOR: [
    {
      title: 'Không gian làm việc',
      items: [
        { path: '/operator/home', label: 'Trang chủ Vận hành', icon: Home, exact: true },
      ],
    },
    {
      title: 'Vận hành xưởng in 3D',
      items: [
        { path: '/manager/print-jobs', label: 'Lệnh in của tôi', icon: Printer },
        { path: '/manager/orders', label: 'Đơn hàng xưởng', icon: ShoppingBag },
        { path: '/manager/inventory/transactions', label: 'Lịch sử vật tư', icon: History },
      ],
    },
  ],

  // WAREHOUSE Role Navigation
  ROLE_WAREHOUSE: [
    {
      title: 'Không gian làm việc',
      items: [
        { path: '/warehouse/home', label: 'Trang chủ Kho', icon: Home, exact: true },
      ],
    },
    {
      title: 'Hậu cần kho WMS',
      items: [
        { path: '/manager/inventory', label: 'Tồn kho thực tế', icon: Layers, exact: true },
        { path: '/manager/materials', label: 'Danh mục Vật liệu', icon: Box },
        { path: '/manager/receipts', label: 'Nhập kho', icon: ArrowDownLeft },
        { path: '/manager/issues', label: 'Xuất kho', icon: ArrowUpRight },
        { path: '/manager/transfers', label: 'Điều chuyển kho', icon: ArrowLeftRight },
        { path: '/manager/adjustments', label: 'Điều chỉnh kho', icon: Sliders },
        { path: '/manager/stock-counts', label: 'Kiểm kê kho', icon: ClipboardCheck },
        { path: '/manager/inventory/transactions', label: 'Sổ cái biến động kho', icon: History },
      ],
    },
  ],

  // PROVIDER Role Navigation
  ROLE_PROVIDER: [
    {
      title: 'Cổng Đối tác Gia công',
      items: [
        { path: '/provider/home', label: 'Trang chủ Đối tác', icon: Home, exact: true },
        { path: '/provider/orders', label: 'Đơn hàng gia công', icon: ShoppingBag },
      ],
    },
  ],

  // DRIVER Role Navigation
  ROLE_DRIVER: [
    {
      title: 'Cổng Đội ngũ Giao vận',
      items: [
        { path: '/driver/home', label: 'Trang chủ Tài xế', icon: Home, exact: true },
        { path: '/driver/deliveries', label: 'Chuyến giao hôm nay', icon: Truck },
      ],
    },
  ],

  // CUSTOMER Role Navigation
  ROLE_USER: [
    {
      title: 'Không gian Khách hàng',
      items: [
        { path: '/customer/home', label: 'Trang chủ', icon: Home, exact: true },
        { path: '/create-keepsake', label: 'Tạo mô hình 3D', icon: Box, activePaths: ['/reconstruction', '/scans'] },
        { path: '/my-models', label: 'Mô hình của tôi', icon: Box, activePaths: ['/customer/models'] },
        { path: '/products', label: 'Khám phá sản phẩm', icon: ShoppingBag },
        { path: '/categories', label: 'Danh mục kỷ vật', icon: Layers },
        { activePaths: ['/customer/orders'], path: '/orders', label: 'Đơn hàng của tôi', icon: Package },
        { activePaths: ['/checkout'], path: '/cart', label: 'Giỏ hàng', icon: ShoppingCart },
        { path: '/profile', label: 'Hồ sơ & Bảo mật', icon: User },
      ],
    },
  ],
};

// Map alias names without ROLE_ prefix
navigationByRole.ADMIN = navigationByRole.ROLE_ADMIN;
navigationByRole.MANAGER = navigationByRole.ROLE_MANAGER;
navigationByRole.OPERATOR = navigationByRole.ROLE_OPERATOR;
navigationByRole.WAREHOUSE = navigationByRole.ROLE_WAREHOUSE;
navigationByRole.PROVIDER = navigationByRole.ROLE_PROVIDER;
navigationByRole.DRIVER = navigationByRole.ROLE_DRIVER;
navigationByRole.CUSTOMER = navigationByRole.ROLE_USER;
navigationByRole.USER = navigationByRole.ROLE_USER;

export function getNavigationForRole(role?: UserRole | string | null): NavSectionConfig[] {
  if (!role) return navigationByRole.ROLE_USER;
  const clean = role.trim();
  if (navigationByRole[clean]) return navigationByRole[clean];
  const withPrefix = clean.startsWith('ROLE_') ? clean : `ROLE_${clean}`;
  return navigationByRole[withPrefix] || navigationByRole.ROLE_USER;
}

export function isNavigationItemActive(item: NavItemConfig, pathname: string): boolean {
  return [item.path, ...(item.activePaths || [])].some((path) =>
    item.exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`));
}

export function getCustomerNavigationItem(pathname: string): NavItemConfig | undefined {
  return navigationByRole.ROLE_USER.flatMap((section) => section.items)
    .find((item) => isNavigationItemActive(item, pathname));
}
