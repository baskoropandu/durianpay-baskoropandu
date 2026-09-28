import type { Payment } from '../api';

export interface Summary {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalAmount: number;
}

/** Compute summary statistics from a list of payments. */
export function computeSummary(payments: Payment[]): Summary {
  const summary: Summary = { total: 0, completed: 0, processing: 0, failed: 0, totalAmount: 0 };
  for (const p of payments) {
    summary.total += 1;
    summary.totalAmount += p.amount ?? 0;
    switch (p.status) {
      case 'completed':
        summary.completed += 1;
        break;
      case 'processing':
        summary.processing += 1;
        break;
      case 'failed':
        summary.failed += 1;
        break;
    }
  }
  return summary;
}
