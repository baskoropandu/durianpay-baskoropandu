import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ApiError } from '../api/errors';
import { ThemeToggle } from '../components/ThemeToggle';

/**
 * Login page — email + password form.
 * On success, stores the JWT token + role in the auth store and redirects to /dashboard.
 */
export function LoginPage(): React.JSX.Element {
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // On success, isAuthenticated flips true and we redirect via the guard above.
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body?.message ?? 'Invalid email or password.');
      } else {
        setError('Unable to reach the server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-300 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-10">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center bg-zinc-950 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">D</span>
          <span className="text-lg font-bold tracking-tight">durianpay<span className="text-zinc-400">.</span></span>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
        <div className="grid w-full max-w-4xl border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
          <aside className="flex flex-col justify-between border-b border-zinc-300 bg-zinc-100 p-7 dark:border-zinc-800 dark:bg-zinc-900/60 md:border-b-0 md:border-r md:p-10">
            <div>
              <p className="eyebrow">Internal workspace</p>
              <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-tight md:mt-16 md:text-4xl">Payment operations.<br /><span className="text-zinc-500 dark:text-zinc-400">In clear view.</span></h2>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">One workspace to monitor transactions, review outcomes, and keep payments moving.</p>
            </div>
            <div className="mt-10 hidden border-t border-zinc-300 pt-5 dark:border-zinc-700 md:block">
              <p className="eyebrow">Durianpay / Payment operations</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Authorized team members only.</p>
            </div>
          </aside>
        <div className="p-7 sm:p-10">
          <div className="mb-8">
            <p className="eyebrow">Account access</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Payments Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in with your workspace credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="border-l-2 border-danger-600 bg-danger-500/10 px-3 py-2 text-sm text-danger-700 dark:text-danger-500"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-between border border-zinc-950 bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="mt-8 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <p className="eyebrow mb-2">Demo access</p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"><span className="font-mono">cs@test.com</span> / <span className="font-mono">password</span></p>
          </div>
        </div>
        </div>
      </main>
      <footer className="flex flex-wrap justify-between gap-2 border-t border-zinc-300 px-5 py-4 text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:px-10">
        <span>Durianpay / Internal use only</span><span>Payments workspace</span>
      </footer>
    </div>
  );
}
