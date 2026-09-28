import type { Payment, PaymentSummary } from '../api';
import { computeSummary } from '../utils/summary';
import { formatAmount } from '../utils/format';

/**
 * Summary widget showing total payments and a status breakdown.
 * Prefers the backend-provided aggregate `summary` (all matching payments);
 * falls back to computing from the current `payments` list.
 */
export function SummaryWidget({
  payments,
  summary,
  unavailable = false,
}: {
  payments: Payment[];
  summary?: PaymentSummary;
  unavailable?: boolean;
}): React.JSX.Element {
  const s = summary
    ? {
        total: summary.total ?? 0,
        completed: summary.completed ?? 0,
        processing: summary.processing ?? 0,
        failed: summary.failed ?? 0,
        totalAmount: summary.total_amount ?? 0,
      }
    : computeSummary(payments);

  const cards = [
    { label: 'Total payments', value: s.total, accent: 'bg-zinc-500', detail: 'Transaction count' },
    { label: 'Completed', value: s.completed, accent: 'bg-success-600 dark:bg-success-500', detail: 'Successfully processed' },
    { label: 'Processing', value: s.processing, accent: 'bg-warning-600 dark:bg-warning-500', detail: 'Awaiting completion' },
    { label: 'Failed', value: s.failed, accent: 'bg-danger-600 dark:bg-danger-500', detail: 'Unsuccessful payments' },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border border-zinc-300 bg-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white p-4 dark:bg-zinc-950 sm:p-5"
        >
          <p className="eyebrow flex items-center gap-2">
            <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 ${c.accent}`} />
            {c.label}
          </p>
          <p className="mt-5 font-mono text-3xl font-medium tabular-nums tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-4xl">
            {unavailable ? '—' : c.value.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{c.detail}</p>
        </div>
      ))}
      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 bg-zinc-100 px-4 py-4 dark:bg-zinc-900/70 sm:px-5 lg:col-span-4">
        <p className="eyebrow">Total volume <span className="ml-2 font-mono font-normal">/ IDR</span></p>
        <p className="break-all font-mono text-xl font-medium tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
          {unavailable ? '—' : formatAmount(s.totalAmount)}
        </p>
      </div>
    </div>
  );
}
