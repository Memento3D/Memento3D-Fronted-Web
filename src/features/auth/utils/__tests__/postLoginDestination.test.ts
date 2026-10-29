import { describe, expect, it } from 'vitest';
import { getCustomerEntryRoute, resolvePostLoginDestination, resolveSafeRedirect } from '../postLoginDestination';

describe('safe shopping return destinations', () => {
  it.each(['/cart', '/checkout', '/checkout?orderId=123', '/products', '/products/some-slug', '/products/abc_123#details'])(
    'accepts %s for customers', (path) => {
      expect(resolveSafeRedirect(path)).toBe(path);
      expect(resolvePostLoginDestination('ROLE_USER', path)).toBe(path);
    },
  );
  it.each([
    'https://example.com', '//example.com', 'javascript:alert(1)', '/\\example.com',
    '/%5cexample.com', '/%2fexample.com', '/cart\n', '/cart%0d%0aLocation:evil',
    '/admin/home', '/manager/home', '/login?redirect=/cart', '/oauth2/callback',
    '/products/%2f%2fevil.com', '/cart/../admin/home', '/%ZZ', '',
  ])('rejects %j', (path) => {
    expect(resolveSafeRedirect(path)).toBeNull();
    expect(resolvePostLoginDestination('ROLE_USER', path)).toBe('/customer/home');
  });
  it.each(['ADMIN', 'MANAGER', 'WAREHOUSE', 'OPERATOR', 'PROVIDER', 'DRIVER'])(
    'ignores shopping continuations for %s', (role) => {
      expect(resolvePostLoginDestination(`ROLE_${role}`, '/cart')).toBe(`/${role.toLowerCase()}/home`);
      expect(resolvePostLoginDestination(`ROLE_${role}`, '/checkout')).toBe(`/${role.toLowerCase()}/home`);
    },
  );
  it('routes guest cart navigation directly to login with an intended destination', () => {
    expect(getCustomerEntryRoute(null, '/cart')).toBe('/login?redirect=%2Fcart');
    expect(getCustomerEntryRoute('ROLE_USER', '/cart')).toBe('/cart');
    expect(getCustomerEntryRoute('ROLE_MANAGER', '/cart')).toBe('/manager/home');
  });
});
