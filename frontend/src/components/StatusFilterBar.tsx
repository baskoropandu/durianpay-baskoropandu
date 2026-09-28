import type { PaymentStatus } from '../api';

export type StatusFilter = NonNullable<PaymentStatus> | 'all';

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Sharp, segmented filter for payment status.
 */
export function StatusFilterBar({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}): React.JSX.Element {
  return (
    <div
      className="inline-flex max-w-full border border-zinc-300 dark:border-zinc-700"
      role="group"
      aria-label="Filter by status"
    >
      {OPTIONS.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`min-h-10 border-zinc-300 px-2.5 text-[11px] font-medium transition-colors dark:border-zinc-700 sm:px-4 ${
              i > 0 ? 'border-l' : ''
            } ${
              active
                ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
