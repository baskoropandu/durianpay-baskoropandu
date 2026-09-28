import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '../store/theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('durianpay.theme');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('durianpay.theme');
  });

  it('switches the document theme and persists both preferences', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('durianpay.theme')).toBe('dark');
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('durianpay.theme')).toBe('light');
  });

  it('remains usable when browser storage is blocked', async () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    render(<ThemeToggle />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });
});