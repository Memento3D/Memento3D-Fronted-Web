import type { ActorPortalConfig, ActorPortalType, UserRole } from '../types/auth.types';

export const ACTOR_PORTAL_CONFIGS: Record<ActorPortalType, ActorPortalConfig> = {
  customer: {
    actor: 'customer',
    path: '/login',
    title: 'Client & Customer Portal',
    subtitle: 'Sign in to monitor 3D prints, upload 3D scans, and manage personalized orders.',
    badge: 'Memento3D Client',
    badgeColor: 'blue',
    defaultRedirect: '/customer/orders',
    allowedRoles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER'],
    showGoogleLogin: true,
    accentGradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  },
  admin: {
    actor: 'admin',
    path: '/admin/login',
    title: 'System Administration',
    subtitle: 'High-security console for platform governance, security and facility audits.',
    badge: 'System Admin Console',
    badgeColor: 'volcano',
    defaultRedirect: '/manager/warehouses',
    allowedRoles: ['ROLE_ADMIN'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  manager: {
    actor: 'manager',
    path: '/manager/login',
    title: 'Operations & Facility Manager',
    subtitle: 'Manage regional warehouse facilities, material catalogs and stock approvals.',
    badge: 'Operations Hub',
    badgeColor: 'gold',
    defaultRedirect: '/manager/inventory',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  warehouse: {
    actor: 'warehouse',
    path: '/warehouse/login',
    title: 'Warehouse & Logistics Portal',
    subtitle: 'Material receiving inspection, stocktaking, picking, and inventory ledger.',
    badge: 'WMS Terminal',
    badgeColor: 'cyan',
    defaultRedirect: '/manager/inventory',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_WAREHOUSE'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  },
  operator: {
    actor: 'operator',
    path: '/operator/login',
    title: '3D Print Farm Operator',
    subtitle: 'Machine queue dispatch, spool picking and post-print reconciliation.',
    badge: 'Print Farm Station',
    badgeColor: 'purple',
    defaultRedirect: '/manager/print-jobs',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPERATOR'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  },
  provider: {
    actor: 'provider',
    path: '/provider/login',
    title: 'Manufacturing Partner Portal',
    subtitle: 'Third-party 3D print service providers and contract manufacturing network.',
    badge: 'B2B Partner Network',
    badgeColor: 'geekblue',
    defaultRedirect: '/provider/orders',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_PROVIDER'],
    showGoogleLogin: true,
    accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  driver: {
    actor: 'driver',
    path: '/driver/login',
    title: 'Logistics & Dispatch Driver',
    subtitle: 'Rapid fulfillment route, batch pickups and proof-of-delivery.',
    badge: 'Courier Transit',
    badgeColor: 'green',
    defaultRedirect: '/driver/deliveries',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DRIVER'],
    showGoogleLogin: false,
    accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
};

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'ROLE_ADMIN':
      return '/manager/warehouses';
    case 'ROLE_MANAGER':
      return '/manager/inventory';
    case 'ROLE_WAREHOUSE':
      return '/manager/inventory';
    case 'ROLE_OPERATOR':
      return '/manager/print-jobs';
    case 'ROLE_PROVIDER':
      return '/provider/orders';
    case 'ROLE_DRIVER':
      return '/driver/deliveries';
    case 'ROLE_USER':
    default:
      return '/customer/orders';
  }
}

export function isActorAuthorized(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
