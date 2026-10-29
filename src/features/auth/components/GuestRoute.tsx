import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolvePostLoginDestination } from '../utils/postLoginDestination';

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return <Navigate to={resolvePostLoginDestination(user.role, searchParams.get('redirect'))} replace />;
  }

  return <>{children}</>;
};
