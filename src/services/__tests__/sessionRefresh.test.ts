// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError } from 'axios';
import { refreshAccessToken, verifySessionAfterUnauthorized } from '../apiClient';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';

describe('shared REST/realtime refresh', () => {
  beforeEach(() => { localStorage.clear(); tokenStorage.setTokens('old-access', 'old-refresh'); });
  afterEach(() => vi.restoreAllMocks());

  it('rotates once for simultaneous consumers and reuses it for late 401 responses', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'new-access', refreshToken: 'new-refresh' } });
    const first = refreshAccessToken('old-access');
    const second = refreshAccessToken('old-access');
    expect(first).toBe(second);
    await expect(first).resolves.toBe('new-access');
    await expect(refreshAccessToken('old-access')).resolves.toBe('new-access');
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][2]?.headers).toMatchObject({ 'ngrok-skip-browser-warning': 'true' });
  });

  it('keeps credentials on network failure or proxy HTML', async () => {
    const post = vi.spyOn(axios, 'post').mockRejectedValue(new AxiosError('Network Error'));
    await expect(refreshAccessToken('old-access')).rejects.toThrow();
    expect(tokenStorage.getRefreshToken()).toBe('old-refresh');
    post.mockResolvedValue({ data: '<html>ngrok</html>' });
    await expect(refreshAccessToken('old-access')).rejects.toThrow('Invalid refresh response');
    expect(tokenStorage.getAccessToken()).toBe('old-access');
  });

  it('clears the session when refresh is explicitly rejected by BE', async () => {
    const error = new AxiosError('Unauthorized');
    error.response = { status: 401 } as never;
    vi.spyOn(axios, 'post').mockRejectedValue(error);
    await expect(refreshAccessToken('old-access')).rejects.toThrow();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('does not resurrect a session after logout during refresh', async () => {
    let finish!: (value: unknown) => void;
    vi.spyOn(axios, 'post').mockImplementation(() => new Promise(resolve => { finish = resolve; }) as never);
    const pending = refreshAccessToken('old-access');
    tokenStorage.clearTokens();
    finish({ data: { accessToken: 'new-access', refreshToken: 'new-refresh' } });
    await expect(pending).rejects.toThrow('Session changed');
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('keeps a valid manager session when a protected resource incorrectly returns 401', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { id: 'manager-1', role: 'ROLE_MANAGER' } });
    await expect(verifySessionAfterUnauthorized('old-access')).resolves.toBe(true);
    expect(tokenStorage.getAccessToken()).toBe('old-access');
  });

  it('only expires the session when the identity endpoint also rejects the token', async () => {
    const error = new AxiosError('Unauthorized');
    error.response = { status: 401 } as never;
    vi.spyOn(axios, 'get').mockRejectedValue(error);
    await expect(verifySessionAfterUnauthorized('old-access')).resolves.toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});
