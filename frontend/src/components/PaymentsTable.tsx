import type { Payment } from '../api';
import { StatusBadge } from './StatusBadge';
import { formatAmount, formatDateTime } from '../utils/format';

/**
 * Responsive table of payments.
 * Columns: Payment ID, Merchant Name, Date, Amount, Status.
 * Dense, sharp grid layout suited to financial data.
 */
export function PaymentsTable({ payments }: { payments: Payment[] }): React.JSX.Element {
  return (
    <div className="table-scroll overflow-x-auto bg-white dark:bg-zinc-950" role="region" aria-label="Payment records" tabIndex={0}>
      <table className="w-full min-w-[760px] divide-y divide-zinc-300 text-sm dark:divide-zinc-800">
        <caption className="sr-only">Payment records with merchant, local date, amount in IDR, and status</caption>
        <thead className="bg-zinc-100/80 dark:bg-zinc-900">
          <tr>
            <th scope="col" className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Payment ID
            </th>
            <th scope="col" className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Merchant Name
            </th>
            <th scope="col" className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Date
            </th>
            <th scope="col" className="border-l border-zinc-200 px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Amount
            </th>
            <th scope="col" className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80">
              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {p.id ? `#${p.id}` : '—'}
              </td>
              <td className="min-w-44 px-5 py-3.5 text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                <span className="block max-w-64 break-words">{p.merchant_name ?? '—'}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {p.created_at ? formatDateTime(p.created_at) : '—'}
              </td>
              <td className="whitespace-nowrap border-l border-zinc-200 px-5 py-3.5 text-right font-mono text-xs font-medium tabular-nums text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                {p.amount !== undefined ? formatAmount(p.amount) : '—'}
              </td>
              <td className="whitespace-nowrap px-5 py-3.5">
                {p.status ? <StatusBadge status={p.status} /> : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
