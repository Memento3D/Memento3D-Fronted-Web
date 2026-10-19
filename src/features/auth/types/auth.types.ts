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
  emailVerified?: boolean;
  status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  agreeTerms: boolean;
  termsVersion?: string;
  marketingConsent?: boolean;
}

export interface RegisterResponse {
  message: string;
  email: string;
  userId?: string;
  verificationRequired: boolean;
  verificationToken?: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  email: string;
  emailVerified: boolean;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  expiresAt: string;
  verificationToken?: string;
}

export interface ConsentPayload {
  agreeTerms: boolean;
  termsVersion: string;
  marketingConsent?: boolean;
}

export interface LegalDocument {
  id: string;
  type: 'TERMS' | 'PRIVACY';
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  active: boolean;
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
