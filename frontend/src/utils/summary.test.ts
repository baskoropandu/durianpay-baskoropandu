import { describe, expect, it } from 'vitest';
import { computeSummary } from './summary';
import type { Payment } from '../api';

const payments: Payment[] = [
  {
    id: '1',
    merchant_name: 'A',
    amount: 100,
    status: 'completed',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    merchant_name: 'B',
    amount: 200,
    status: 'completed',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    merchant_name: 'C',
    amount: 50,
    status: 'processing',
    created_at: '2026-01-01T00:00:00Z',
  },
  { id: '4', merchant_name: 'D', amount: 25, status: 'failed', created_at: '2026-01-01T00:00:00Z' },
];

describe('computeSummary', () => {
  it('counts totals and breakdowns correctly', () => {
    const s = computeSummary(payments);
    expect(s.total).toBe(4);
    expect(s.completed).toBe(2);
    expect(s.processing).toBe(1);
    expect(s.failed).toBe(1);
    expect(s.totalAmount).toBe(375);
  });

  it('handles an empty list', () => {
    const s = computeSummary([]);
    expect(s.total).toBe(0);
    expect(s.completed).toBe(0);
    expect(s.processing).toBe(0);
    expect(s.failed).toBe(0);
    expect(s.totalAmount).toBe(0);
  });

  it('ignores missing amounts', () => {
    const s = computeSummary([{ id: '1', status: 'completed' }]);
    expect(s.total).toBe(1);
    expect(s.totalAmount).toBe(0);
  });
});
