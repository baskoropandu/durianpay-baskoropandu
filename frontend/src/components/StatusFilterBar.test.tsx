import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusFilterBar } from './StatusFilterBar';

describe('StatusFilterBar', () => {
  it('renders all filter options', () => {
    render(<StatusFilterBar value="all" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Processing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Failed' })).toBeInTheDocument();
  });

  it('marks the active filter as pressed', () => {
    render(<StatusFilterBar value="completed" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a filter is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusFilterBar value="all" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Failed' }));
    expect(onChange).toHaveBeenCalledWith('failed');
  });
});
