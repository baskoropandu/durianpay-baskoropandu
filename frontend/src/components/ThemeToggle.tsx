import { useThemeStore } from '../store/theme';

/** Shared, persisted appearance control for public and authenticated pages. */
export function ThemeToggle(): React.JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="control-button"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {dark ? (
          <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        ) : (
          <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
        )}
      </svg>
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}