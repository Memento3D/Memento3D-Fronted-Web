import type { UserRole } from '../features/auth/types/auth.types';

/**
 * Centralized mapping of User Roles to their dedicated Actor Home Page routes.
 * Every actor is redirected to their own inspiring home page after login,
 * NOT directly into CRUD or business dashboards.
 */
export const ROLE_HOME_ROUTES: Record<string, string> = {
  ROLE_ADMIN: '/admin/home',
  ROLE_MANAGER: '/manager/home',
  ROLE_OPERATOR: '/operator/home',
  ROLE_WAREHOUSE: '/warehouse/home',
  ROLE_USER: '/customer/home',
  ROLE_CUSTOMER: '/customer/home',
  ROLE_PROVIDER: '/provider/home',
  ROLE_DRIVER: '/driver/home',

  // Non-prefixed role aliases for maximum safety
  ADMIN: '/admin/home',
  MANAGER: '/manager/home',
  OPERATOR: '/operator/home',
  WAREHOUSE: '/warehouse/home',
  WAREHOUSE_MANAGER: '/warehouse/home',
  USER: '/customer/home',
  CUSTOMER: '/customer/home',
  PROVIDER: '/provider/home',
  DRIVER: '/driver/home',
};

/**
 * Resolves the appropriate Home route for a given role.
 * Source of truth for post-login routing and unauthorized fallbacks.
 */
export function getRoleHomeRoute(role?: UserRole | string | null): string {
  if (!role) {
    return '/login';
  }
  const clean = role.trim();
  if (ROLE_HOME_ROUTES[clean]) {
    return ROLE_HOME_ROUTES[clean];
  }
  const withPrefix = clean.startsWith('ROLE_') ? clean : `ROLE_${clean}`;
  return ROLE_HOME_ROUTES[withPrefix] || '/customer/home';
}
