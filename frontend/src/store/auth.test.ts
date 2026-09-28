import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './auth';

// Mock the API login function.
vi.mock('../api', () => ({
  login: vi.fn(),
}));

import { login as apiLogin } from '../api';

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset store state to logged-out.
    useAuthStore.setState({ token: null, role: null, email: null, isAuthenticated: false });
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('login stores token, role, and email', async () => {
    (apiLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'cs@test.com',
      role: 'cs',
      token: 'jwt-token',
    });

    await useAuthStore.getState().login('cs@test.com', 'password');

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe('jwt-token');
    expect(s.role).toBe('cs');
    expect(s.email).toBe('cs@test.com');
    // Persisted to localStorage.
    expect(localStorage.getItem('durianpay.token')).toBe('jwt-token');
  });

  it('maps operation role correctly', async () => {
    (apiLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'operation@test.com',
      role: 'operation',
      token: 'jwt-token',
    });

    await useAuthStore.getState().login('operation@test.com', 'password');
    expect(useAuthStore.getState().role).toBe('operation');
  });

  it('logout clears state and storage', async () => {
    (apiLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'cs@test.com',
      role: 'cs',
      token: 'jwt-token',
    });
    await useAuthStore.getState().login('cs@test.com', 'password');

    useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.token).toBeNull();
    expect(s.role).toBeNull();
    expect(localStorage.getItem('durianpay.token')).toBeNull();
  });
});
