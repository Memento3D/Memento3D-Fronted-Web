import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export { DashboardLayout } from './DashboardLayout';
export { PublicLayout } from './PublicLayout';
export { Sidebar } from './Sidebar';
export { Topbar } from './Topbar';
export * from './navigationConfig';

// Role Layout Aliases
export const AdminLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_ADMIN' });
export const ManagerLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_MANAGER' });
export const OperatorLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_OPERATOR' });
export const WarehouseLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_WAREHOUSE' });
export const ProviderLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_PROVIDER' });
export const DriverLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_DRIVER' });
export const CustomerLayout: React.FC = () => React.createElement(DashboardLayout, { forceRole: 'ROLE_USER' });

// Backward compatibility alias for AppLayout
export const AppLayout = DashboardLayout;
