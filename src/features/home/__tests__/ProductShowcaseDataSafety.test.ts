import { describe, it, expect } from 'vitest';

describe('ProductShowcase Data Safety & Regression Prevention', () => {
  // Pure helper replicating the safe extraction logic in ProductShowcase
  const extractCategories = (rawCategories: unknown) => {
    if (Array.isArray(rawCategories)) return rawCategories;
    if (rawCategories && Array.isArray((rawCategories as any).content)) {
      return (rawCategories as any).content;
    }
    return [];
  };

  const extractProducts = (productsData: unknown) => {
    if (Array.isArray((productsData as any)?.content)) return (productsData as any).content;
    if (Array.isArray(productsData)) return productsData;
    return [];
  };

  it('PREVENTS BUG: Handles raw string HTML from Cloudflare SPA fallback without crashing .slice(0, 4).map', () => {
    const rawCategories = '<!DOCTYPE html><html><head><title>Memento3D</title></head><body></body></html>';

    // Before fix: rawCategories was treated as categories, rawCategories.slice(0, 4) returned '<!DO', and '<!DO'.map threw TypeError!
    const categories = extractCategories(rawCategories);

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBe(0);

    // Verify .slice(0, 4).map can be safely invoked
    const sliced = categories.slice(0, 4).map((c: any) => c.name);
    expect(sliced).toEqual([]);
  });

  it('Handles valid array of categories correctly', () => {
    const rawCategories = [
      { id: '1', name: 'Cat 1', slug: 'cat-1' },
      { id: '2', name: 'Cat 2', slug: 'cat-2' },
      { id: '3', name: 'Cat 3', slug: 'cat-3' },
      { id: '4', name: 'Cat 4', slug: 'cat-4' },
      { id: '5', name: 'Cat 5', slug: 'cat-5' },
    ];

    const categories = extractCategories(rawCategories);
    expect(categories.length).toBe(5);

    const firstFour = categories.slice(0, 4).map((c: any) => c.name);
    expect(firstFour).toEqual(['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4']);
  });

  it('Handles Spring Boot Page structure for categories', () => {
    const rawCategories = {
      content: [
        { id: '1', name: 'Page Cat 1', slug: 'page-cat-1' },
      ],
      totalElements: 1,
    };

    const categories = extractCategories(rawCategories);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBe(1);
    expect(categories.slice(0, 4).map((c: any) => c.name)).toEqual(['Page Cat 1']);
  });

  it('Handles null, undefined, number, object without content gracefully', () => {
    expect(extractCategories(null)).toEqual([]);
    expect(extractCategories(undefined)).toEqual([]);
    expect(extractCategories(12345)).toEqual([]);
    expect(extractCategories({})).toEqual([]);
    expect(extractCategories({ error: 'Internal Server Error' })).toEqual([]);
  });

  it('Handles Spring Boot Page structure for products', () => {
    const pageData = {
      content: [
        { id: 'p1', name: 'Memento Figurine', price: 500000 },
      ],
      totalElements: 1,
    };

    const products = extractProducts(pageData);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(1);
    expect(products.map((p: any) => p.name)).toEqual(['Memento Figurine']);
  });

  it('Handles HTML or error string for products without throwing', () => {
    const rawError = '502 Bad Gateway';
    const products = extractProducts(rawError);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(0);
    expect(products.map((p: any) => p.name)).toEqual([]);
  });
});
