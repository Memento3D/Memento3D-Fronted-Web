import { describe, it, expect, vi } from 'vitest';
import { categoryApi } from '../api/categoryApi';
import { apiClient } from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('categoryApi.list Response Normalization & Spring Boot Alignment', () => {
  it('should query backend with all: false and activeOnly: true when activeOnly=true', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Đồ Trang Trí', slug: 'do-trang-tri', active: true }],
    } as any);

    const result = await categoryApi.list(true);

    expect(apiClient.get).toHaveBeenCalledWith('/product-categories', {
      params: { all: false, activeOnly: true },
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Đồ Trang Trí');
  });

  it('should query backend with all: true and activeOnly: false when activeOnly=false', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        { id: 'cat-1', name: 'Active', slug: 'active', active: true },
        { id: 'cat-2', name: 'Inactive', slug: 'inactive', active: false },
      ],
    } as any);

    const result = await categoryApi.list(false);

    expect(apiClient.get).toHaveBeenCalledWith('/product-categories', {
      params: { all: true, activeOnly: false },
    });
    expect(result).toHaveLength(2);
  });

  it('should normalize Spring Boot Page object ({ content: [...] }) into array', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        content: [{ id: 'cat-page-1', name: 'Page Category', slug: 'page-category' }],
        totalElements: 1,
        totalPages: 1,
      },
    } as any);

    const result = await categoryApi.list(true);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Page Category');
  });

  it('should return empty array if backend returns null, undefined or unexpected structure', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: null,
    } as any);

    const result = await categoryApi.list(true);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
