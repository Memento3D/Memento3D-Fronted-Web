import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

export const AdminLayout: React.FC = () => {
  return <DashboardLayout forceRole="ROLE_ADMIN" />;
};

export default AdminLayout;
