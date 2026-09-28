import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders no controls when there is only one page', () => {
    render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('shows the current page and total pages', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveTextContent('Page');
    expect(nav).toHaveTextContent('2');
    expect(nav).toHaveTextContent('of');
    expect(nav).toHaveTextContent('5');
  });

  it('disables Previous on the first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls onPageChange with the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with the previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
