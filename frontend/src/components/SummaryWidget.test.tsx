import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryWidget } from './SummaryWidget';
import { formatAmount } from '../utils/format';

describe('SummaryWidget', () => {
  it('uses aggregate totals rather than just the visible page', () => {
    render(<SummaryWidget payments={[]} summary={{ total: 25, completed: 19, processing: 4, failed: 2, total_amount: 850000 }} />);
    for (const value of ['25', '19', '4', '2']) {
      expect(screen.getByText(value)).toHaveClass('font-mono');
    }
    expect(screen.getByText(formatAmount(850000), { normalizer: (text) => text })).toBeInTheDocument();
  });

  it('computes totals from payments when no aggregate is supplied', () => {
    render(<SummaryWidget payments={[{ id: '1', amount: 150000, status: 'completed' }]} />);
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByText(formatAmount(150000), { normalizer: (text) => text })).toBeInTheDocument();
  });

  it('does not misrepresent unavailable data as zero', () => {
    render(<SummaryWidget payments={[]} unavailable />);
    expect(screen.getAllByText('—')).toHaveLength(5);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});