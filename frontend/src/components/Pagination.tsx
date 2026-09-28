/**
 * Pagination controls (prev / page indicator / next).
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): React.JSX.Element {
  if (totalPages <= 1) {
    return <div aria-hidden="true" />;
  }

  return (
    <nav className="flex flex-wrap items-center gap-3" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="control-button"
      >
        Previous
      </button>
      <span className="font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
        Page <span className="font-semibold">{page}</span> of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="control-button"
      >
        Next
      </button>
    </nav>
  );
}
