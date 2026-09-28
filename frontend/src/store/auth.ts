import { create } from 'zustand';
import { login as apiLogin } from '../api';
import { setTokenProvider } from '../api/client';

/**
 * Auth store — holds the JWT token and user role in client state.
 * Persists to localStorage so the session survives page reloads.
 */

const TOKEN_KEY = 'durianpay.token';
const ROLE_KEY = 'durianpay.role';
const EMAIL_KEY = 'durianpay.email';

export type Role = 'cs' | 'operation';

export interface AuthState {
  token: string | null;
  role: Role | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function readStoredRole(): Role | null {
  const role = localStorage.getItem(ROLE_KEY);
  return role === 'cs' || role === 'operation' ? role : null;
}

function readStored(): Pick<AuthState, 'token' | 'role' | 'email' | 'isAuthenticated'> {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    token,
    role: readStoredRole(),
    email: localStorage.getItem(EMAIL_KEY),
    isAuthenticated: Boolean(token),
  };
}

function persistState(state: Pick<AuthState, 'token' | 'role' | 'email'>): void {
  if (state.token) {
    localStorage.setItem(TOKEN_KEY, state.token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  if (state.role) {
    localStorage.setItem(ROLE_KEY, state.role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
  if (state.email) {
    localStorage.setItem(EMAIL_KEY, state.email);
  } else {
    localStorage.removeItem(EMAIL_KEY);
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...readStored(),
  login: async (email, password) => {
    const user = await apiLogin({ email, password });
    const role: Role = user.role === 'operation' ? 'operation' : 'cs';
    const next = {
      token: user.token ?? null,
      role,
      email: user.email ?? null,
      isAuthenticated: true,
    };
    persistState(next);
    set(next);
  },
  logout: () => {
    persistState({ token: null, role: null, email: null });
    set({ token: null, role: null, email: null, isAuthenticated: false });
  },
}));

// Keep the fetch wrapper in sync with the current token.
setTokenProvider(() => useAuthStore.getState().token);
