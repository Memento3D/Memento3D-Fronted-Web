import type { ActorPortalConfig, ActorPortalType, UserRole } from '../types/auth.types';
import { ROLE_HOME_ROUTES, getRoleHomeRoute } from '../../../utils/roleHomeRoutes';

export { ROLE_HOME_ROUTES, getRoleHomeRoute };

export const ACTOR_PORTAL_CONFIGS: Record<ActorPortalType, ActorPortalConfig> = {
  customer: {
    actor: 'customer',
    path: '/login',
    title: 'Cổng Khách hàng & Người dùng',
    subtitle: 'Đăng nhập để theo dõi tiến độ in 3D, tải lên bản quét 3D và quản lý đơn kỷ vật cá nhân hóa.',
    badge: 'Khách hàng Memento3D',
    badgeColor: 'blue',
    defaultRedirect: '/customer/home',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER'],
    showGoogleLogin: true,
    accentGradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  },
  admin: {
    actor: 'admin',
    path: '/admin/login',
    title: 'Cổng Quản trị Hệ thống',
    subtitle: 'Bảng điều khiển bảo mật cao dành cho quản trị nền tảng, phân quyền và giám sát hệ thống.',
    badge: 'Quản trị viên Hệ thống',
    badgeColor: 'volcano',
    defaultRedirect: '/admin/home',
    allowedRoles: ['ROLE_ADMIN'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  manager: {
    actor: 'manager',
    path: '/manager/login',
    title: 'Cổng Quản lý Vận hành & Kho xưởng',
    subtitle: 'Quản lý hệ thống kho khu vực, danh mục vật liệu in và phê duyệt điều chuyển tồn kho.',
    badge: 'Trung tâm Vận hành',
    badgeColor: 'gold',
    defaultRedirect: '/manager/home',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  warehouse: {
    actor: 'warehouse',
    path: '/warehouse/login',
    title: 'Cổng Thủ kho & Hậu cần WMS',
    subtitle: 'Kiểm định nhận vật liệu, kiểm kê tồn kho, xuất kho và sổ cái chuyển động vật tư.',
    badge: 'Thiết bị đầu cuối WMS',
    badgeColor: 'cyan',
    defaultRedirect: '/warehouse/home',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  },
  operator: {
    actor: 'operator',
    path: '/operator/login',
    title: 'Cổng Vận hành Xưởng in 3D',
    subtitle: 'Điều phối hàng đợi máy in 3D, tiếp nhận cuộn nhựa và quyết toán vật liệu sau khi in.',
    badge: 'Trạm Xưởng in 3D',
    badgeColor: 'purple',
    defaultRedirect: '/operator/home',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  },
  provider: {
    actor: 'provider',
    path: '/provider/login',
    title: 'Cổng Đối tác Sản xuất 3D',
    subtitle: 'Mạng lưới đối tác gia công in 3D và xưởng sản xuất chế tác theo hợp đồng.',
    badge: 'Mạng lưới Đối tác B2B',
    badgeColor: 'geekblue',
    defaultRedirect: '/provider/home',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_PROVIDER'],
    showGoogleLogin: true,
    accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  driver: {
    actor: 'driver',
    path: '/driver/login',
    title: 'Cổng Tài xế Vận chuyển & Giao hàng',
    subtitle: 'Tuyến giao hàng hỏa tốc, nhận kiện hàng tại kho và xác nhận giao hàng thành công.',
    badge: 'Đội ngũ Vận chuyển',
    badgeColor: 'green',
    defaultRedirect: '/driver/home',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DRIVER'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
};

/**
 * Returns default Home landing route for a specific user role.
 * Ensures every actor is sent to their dedicated Home page upon successful authentication.
 */
export function getDefaultRouteForRole(role: UserRole | string): string {
  return getRoleHomeRoute(role);
}

export function isActorAuthorized(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
