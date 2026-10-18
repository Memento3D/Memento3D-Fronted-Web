import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { ACTOR_PORTAL_CONFIGS } from '../utils/resolveActorRoute';
import type { ActorPortalType } from '../types/auth.types';

interface LoginPageProps {
  actor?: ActorPortalType;
}

export const LoginPage: React.FC<LoginPageProps> = ({ actor: explicitActor }) => {
  const location = useLocation();

  // Resolve actor from prop or current pathname
  const resolveActor = (): ActorPortalType => {
    if (explicitActor) return explicitActor;
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin/login')) return 'admin';
    if (path.includes('/manager/login')) return 'manager';
    if (path.includes('/warehouse/login')) return 'warehouse';
    if (path.includes('/operator/login')) return 'operator';
    if (path.includes('/provider/login')) return 'provider';
    if (path.includes('/driver/login')) return 'driver';
    return 'customer';
  };

  const currentActor = resolveActor();
  const portalConfig = ACTOR_PORTAL_CONFIGS[currentActor];

  return (
    <AuthLayout portalConfig={portalConfig}>
      <LoginForm portalConfig={portalConfig} />
    </AuthLayout>
  );
};
