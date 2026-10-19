import React from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';
import type { ActorPortalConfig } from '../types/auth.types';

const registerPortalConfig: ActorPortalConfig = {
  actor: 'customer',
  path: '/register',
  title: 'Tạo tài khoản Memento3D',
  subtitle: 'Đăng ký tài khoản khách hàng để trải nghiệm dịch vụ tạo mô hình & in 3D cá nhân hóa',
  badge: 'Đăng ký',
  badgeColor: '#0284c7',
  defaultRedirect: '/products',
  allowedRoles: ['ROLE_USER'],
  showGoogleLogin: true,
  accentGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
};

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout portalConfig={registerPortalConfig}>
      <RegisterForm />
    </AuthLayout>
  );
};
