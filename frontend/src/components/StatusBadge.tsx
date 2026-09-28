import type { PaymentStatus } from '../api';

// The generated Payment.status is optional (string | undefined), so we define
// a non-nullable status type for the badge.
export type Status = Exclude<PaymentStatus, undefined>;

const STATUS_STYLES: Record<Status, string> = {
  completed: 'border-success-600/20 bg-success-600/5 text-success-700 dark:border-success-500/20 dark:bg-success-500/5 dark:text-success-500',
  processing:
    'border-warning-600/20 bg-warning-600/5 text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/5 dark:text-warning-500',
  failed: 'border-danger-600/20 bg-danger-600/5 text-danger-700 dark:border-danger-500/20 dark:bg-danger-500/5 dark:text-danger-500',
};

const STATUS_LABELS: Record<Status, string> = {
  completed: 'Completed',
  processing: 'Processing',
  failed: 'Failed',
};

/**
 * Muted, sharp-edged status indicator for a payment status.
 * Uses a subtle colored dot + uppercase label rather than a bright pill.
 */
export function StatusBadge({ status }: { status: Status }): React.JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-2 border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      <span className="inline-block h-1.5 w-1.5 bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
