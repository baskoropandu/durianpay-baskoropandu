import { useState } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useAuthStore } from '../store/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { PaymentsTable } from '../components/PaymentsTable';
import { SummaryWidget } from '../components/SummaryWidget';
import { StatusFilterBar, StatusFilter } from '../components/StatusFilterBar';
import { Pagination } from '../components/Pagination';

const PAGE_SIZE = 10;

/**
 * Dashboard page — protected route showing payments.
 * Fetches payments from the API, shows a summary widget, a filterable,
 * paginated table, and a logout button.
 */
export function DashboardPage(): React.JSX.Element {
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const query = usePayments({
    ...(filter === 'all' ? {} : { status: filter }),
    page,
    limit: PAGE_SIZE,
  });
  const payments = query.data?.payments ?? [];
  const totalPages = query.data?.total_pages ?? 1;
  const summary = query.data?.summary;

  function changeFilter(next: StatusFilter): void {
    setFilter(next);
    setPage(1); // reset to first page when the filter changes
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:p-4 focus:text-zinc-900">Skip to payments</a>
      <header className="border-b border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center bg-zinc-950 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
              D
            </div>
            <span className="text-lg font-bold tracking-tight">durianpay<span className="text-zinc-400">.</span></span>
            <span className="ml-3 hidden border-l border-zinc-300 pl-6 text-xs text-zinc-500 dark:border-zinc-700 sm:block">Internal workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="control-button"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">Workspace / Payments</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Payments dashboard</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Monitor payment activity and transaction outcomes.</p>
          </div>
          <div className="border-l-2 border-zinc-300 pl-4 dark:border-zinc-700">
            <p className="eyebrow">Signed in / <span>{role ?? '—'}</span></p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-600 dark:text-zinc-300">{email ?? 'user'}</p>
          </div>
        </div>

        <section aria-labelledby="overview-heading" className="mb-9">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="overview-heading" className="eyebrow">Overview</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{filter === 'all' ? 'All payments' : `${filter.charAt(0).toUpperCase()}${filter.slice(1)} payments`} <span aria-hidden="true" className="px-1">/</span> <span className="font-mono">IDR</span></p>
          </div>
          <SummaryWidget payments={payments} summary={summary} unavailable={query.isLoading || query.isError} />
        </section>

        <section aria-labelledby="ledger-heading" className="border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-300 px-4 py-4 dark:border-zinc-800 sm:px-5">
            <div>
              <h2 id="ledger-heading" className="text-sm font-semibold">Payment ledger</h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Transaction records by status</p>
            </div>
            <StatusFilterBar value={filter} onChange={changeFilter} />
          </div>
        {query.isLoading ? (
          <div role="status" className="p-16 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Loading payments…
          </div>
        ) : query.isError ? (
          <div role="alert" className="p-10 text-center text-sm">
            <p className="font-semibold">Failed to load payments.</p>
            <p className="mx-auto mt-2 max-w-xl break-words text-xs text-zinc-500 dark:text-zinc-400">{query.error?.message ?? 'Please try again.'}</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="control-button mt-5"
            >
              Retry
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div role="status" className="p-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No payments found{filter !== 'all' ? ` with status "${filter}"` : ''}.
          </div>
        ) : (
          <PaymentsTable payments={payments} />
        )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-300 px-4 py-3 dark:border-zinc-800 sm:px-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
              {query.isLoading ? 'Fetching records…' : query.isError ? 'Records unavailable' : <><span className="font-mono tabular-nums">{payments.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{payments.length ? (page - 1) * PAGE_SIZE + payments.length : 0}</span> of <span className="font-mono tabular-nums">{query.data?.total ?? 0}</span> records</>}
            </p>
            {!query.isLoading && !query.isError && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </div>
        </section>
        <footer className="mt-5 flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <span>Durianpay / Internal use only</span>
          <span>Amounts in <span className="font-mono">IDR</span> · Dates in local time</span>
        </footer>
      </main>
    </div>
  );
}
