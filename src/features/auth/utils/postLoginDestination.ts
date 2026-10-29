import { getRoleHomeRoute } from '../../../utils/roleHomeRoutes';

export const isCustomerRole = (role?: string | null): boolean => role === 'ROLE_USER';

const hasUnsafeCharacters = (value: string): boolean =>
  [...value].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127 || character === '\\');

/** Only customer shopping destinations are supported as login continuations. */
export function resolveSafeRedirect(value?: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || hasUnsafeCharacters(value) || /\s/.test(value)) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (hasUnsafeCharacters(decoded) || decoded.startsWith('//')) return null;
    const url = new URL(value, 'https://memento.invalid');
    if (url.origin !== 'https://memento.invalid') return null;
    if (!['/cart', '/checkout', '/products'].includes(url.pathname)
      && !/^\/products\/[A-Za-z0-9_-]+$/.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function resolvePostLoginDestination(role: string, redirect?: string | null): string {
  return (isCustomerRole(role) && resolveSafeRedirect(redirect)) || getRoleHomeRoute(role);
}

export function getCustomerEntryRoute(role: string | null | undefined, destination: string): string {
  const safe = resolveSafeRedirect(destination) || '/cart';
  return role ? resolvePostLoginDestination(role, safe) : `/login?redirect=${encodeURIComponent(safe)}`;
}
