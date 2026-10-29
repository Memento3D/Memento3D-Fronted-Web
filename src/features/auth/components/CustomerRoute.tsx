import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { isCustomerRole } from '../utils/postLoginDestination';
import { getRoleHomeRoute } from '../../../utils/roleHomeRoutes';

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  return (
    <ProtectedRoute>
      {!isLoading && user && !isCustomerRole(user.role)
        ? <Navigate to={getRoleHomeRoute(user.role)} replace />
        : children}
    </ProtectedRoute>
  );
};
