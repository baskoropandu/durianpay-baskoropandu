import { create } from 'zustand';

/**
 * Theme store — controls the app's dark mode.
 * Persists the preference to localStorage and toggles the `dark` class
 * on the document root so Tailwind's `darkMode: 'class'` applies.
 */

const THEME_KEY = 'durianpay.theme';
export type Theme = 'light' | 'dark';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
  // Fall back to the OS preference.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

const initial = readStoredTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initial,
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Keep the toggle usable even when the preference cannot be saved.
      }
      applyTheme(next);
      return { theme: next };
    }),
}));