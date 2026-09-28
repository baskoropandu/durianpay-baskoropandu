import { describe, expect, it } from 'vitest';
import { formatAmount, formatDateTime } from './format';

describe('formatAmount', () => {
  it('formats as IDR currency without decimals', () => {
    // Intl may use a non-breaking space between the symbol and number.
    expect(formatAmount(100000)).toMatch(/^Rp[\s\u00a0]100\.000$/);
  });

  it('formats zero', () => {
    expect(formatAmount(0)).toMatch(/^Rp[\s\u00a0]0$/);
  });
});

describe('formatDateTime', () => {
  it('formats a valid ISO date', () => {
    const out = formatDateTime('2026-01-01T00:00:00Z');
    expect(out).toContain('2026');
  });

  it('returns the input unchanged for an invalid date', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
  });
});
