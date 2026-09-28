import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentsTable } from './PaymentsTable';
import type { Payment } from '../api';

const payments: Payment[] = [
  {
    id: '1',
    merchant_name: 'Merchant A',
    amount: 100000,
    status: 'completed',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    merchant_name: 'Merchant B',
    amount: 50000,
    status: 'failed',
    created_at: '2026-01-02T00:00:00Z',
  },
];

describe('PaymentsTable', () => {
  it('renders all column headers', () => {
    render(<PaymentsTable payments={payments} />);
    expect(screen.getByRole('columnheader', { name: 'Payment ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Merchant Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  });

  it('renders payment rows with merchant and status', () => {
    render(<PaymentsTable payments={payments} />);
    expect(screen.getByText('Merchant A')).toBeInTheDocument();
    expect(screen.getByText('Merchant B')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders an empty state when there are no payments', () => {
    render(<PaymentsTable payments={[]} />);
    // No rows should render; the table body is empty.
    const rows = screen.getAllByRole('row');
    // Only the header row.
    expect(rows).toHaveLength(1);
  });
});
