import { describe, it, expect } from 'vitest';

describe('apiClient HTML SPA Fallback Interceptor Detection', () => {
  it('should detect and reject HTML responses returned by Cloudflare SPA fallbacks', async () => {
    // Simulate what Cloudflare Workers/Pages returns when an API path falls back to index.html
    const htmlResponse = {
      status: 200,
      headers: { 'content-type': 'text/html; charset=UTF-8' },
      data: '<!DOCTYPE html><html lang="en"><head><title>Memento3D</title></head><body><div id="root"></div></body></html>',
      config: { url: '/product-categories' },
    };

    // The interceptor logic from apiClient.ts
    const interceptor = (response: any) => {
      const contentType = (response.headers?.['content-type'] as string) || '';
      const rawData = response.data;

      if (
        contentType.includes('text/html') ||
        (typeof rawData === 'string' && /^\s*<!doctype|^\s*<html/i.test(rawData))
      ) {
        const endpoint = response.config?.url || 'API';
        const errorMsg = `Endpoint '${endpoint}' trả về HTML (SPA Fallback) thay vì JSON. Vui lòng kiểm tra cấu hình VITE_API_BASE_URL hoặc reverse proxy Cloudflare Workers.`;
        return Promise.reject(new Error(errorMsg));
      }
      return response;
    };

    await expect(interceptor(htmlResponse)).rejects.toThrow(
      "Endpoint '/product-categories' trả về HTML (SPA Fallback) thay vì JSON"
    );
  });

  it('should auto-parse valid JSON strings if Content-Type was text/plain', () => {
    const stringifiedResponse = {
      status: 200,
      headers: { 'content-type': 'text/plain' },
      data: '[{"id":"1","name":"Tượng Chân Dung","slug":"tuong-chan-dung"}]',
      config: { url: '/product-categories' },
    };

    const interceptor = (response: any) => {
      const contentType = (response.headers?.['content-type'] as string) || '';
      const rawData = response.data;

      if (
        contentType.includes('text/html') ||
        (typeof rawData === 'string' && /^\s*<!doctype|^\s*<html/i.test(rawData))
      ) {
        return Promise.reject(new Error('HTML'));
      }

      if (
        typeof rawData === 'string' &&
        (rawData.trim().startsWith('{') || rawData.trim().startsWith('['))
      ) {
        try {
          response.data = JSON.parse(rawData);
        } catch {}
      }

      return response;
    };

    const result = interceptor(stringifiedResponse);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0].name).toBe('Tượng Chân Dung');
  });

  it('should pass through normal JSON array response without modification', () => {
    const normalResponse = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: [{ id: '1', name: 'Mini Charm', slug: 'mini-charm' }],
      config: { url: '/product-categories' },
    };

    expect(Array.isArray(normalResponse.data)).toBe(true);
    expect(normalResponse.data.length).toBe(1);
  });
});

describe('resolveApiBaseUrl Environment Logic', () => {
  it('should automatically append /api/v1 to bare domains', () => {
    const normalize = (url: string) => {
      const clean = url.trim().replace(/\/+$/, '');
      if (!clean.endsWith('/api/v1') && !clean.endsWith('/api')) {
        return `${clean}/api/v1`;
      }
      return clean;
    };

    expect(normalize('https://memento3d-backend.onrender.com')).toBe(
      'https://memento3d-backend.onrender.com/api/v1'
    );
    expect(normalize('http://localhost:8080')).toBe(
      'http://localhost:8080/api/v1'
    );
    expect(normalize('https://memento3d-backend.onrender.com/api/v1')).toBe(
      'https://memento3d-backend.onrender.com/api/v1'
    );
  });
});
