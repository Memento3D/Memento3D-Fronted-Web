export type UserRole =
  | 'ROLE_USER'
  | 'ROLE_ADMIN'
  | 'ROLE_MANAGER'
  | 'ROLE_WAREHOUSE'
  | 'ROLE_OPERATOR'
  | 'ROLE_PROVIDER'
  | 'ROLE_DRIVER';

export type AuthProviderType = 'LOCAL' | 'GOOGLE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  provider: AuthProviderType;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
  timestamp: string;
}

export type ActorPortalType =
  | 'customer'
  | 'admin'
  | 'manager'
  | 'warehouse'
  | 'operator'
  | 'provider'
  | 'driver';

export interface ActorPortalConfig {
  actor: ActorPortalType;
  path: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  defaultRedirect: string;
  allowedRoles: UserRole[];
  showGoogleLogin: boolean;
  accentGradient: string;
}
