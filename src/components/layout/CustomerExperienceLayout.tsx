import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { isCustomerRole } from '../../features/auth/utils/postLoginDestination';
import { DashboardLayout } from './DashboardLayout';

/** Selects chrome only. Route guards remain responsible for access. */
export function CustomerExperienceLayout({ staffDashboard = false }: { staffDashboard?: boolean }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: 32, textAlign: 'center' }}><Spin size="large" /></div>;
  return isAuthenticated && (isCustomerRole(user?.role) || (staffDashboard && user))
    ? <DashboardLayout /> : <Outlet />;
}
