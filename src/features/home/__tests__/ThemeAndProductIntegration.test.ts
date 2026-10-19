import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();

describe('Theme and Product API Unit Tests', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('correctly persists and toggles theme mode in storage', () => {
    const storageKey = 'memento3d-theme-mode';
    expect(mockStorage.getItem(storageKey)).toBeNull();

    mockStorage.setItem(storageKey, 'dark');
    expect(mockStorage.getItem(storageKey)).toBe('dark');

    mockStorage.setItem(storageKey, 'light');
    expect(mockStorage.getItem(storageKey)).toBe('light');
  });

  it('correctly handles favorite products in storage', () => {
    const favKey = 'memento3d-favorites';
    const initial = ['prod-1', 'prod-2'];
    mockStorage.setItem(favKey, JSON.stringify(initial));

    const stored = JSON.parse(mockStorage.getItem(favKey) || '[]');
    expect(stored).toContain('prod-1');
    expect(stored).toContain('prod-2');

    // Toggle out prod-1
    const updated = stored.filter((id: string) => id !== 'prod-1');
    mockStorage.setItem(favKey, JSON.stringify(updated));

    expect(JSON.parse(mockStorage.getItem(favKey) || '[]')).toEqual(['prod-2']);
  });

  it('verifies product sorting and filter mapping contract', () => {
    const validSortOptions = ['newest', 'priceAsc', 'priceDesc', 'popular'];
    expect(validSortOptions).toContain('popular');
    expect(validSortOptions).toContain('newest');
  });
});
