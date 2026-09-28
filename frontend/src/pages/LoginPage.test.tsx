import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

// Mock the auth store's login action.
vi.mock('../store/auth', () => ({
  useAuthStore: (selector: (state: { login: unknown; isAuthenticated: boolean }) => unknown) =>
    selector({
      login: vi.fn(),
      isAuthenticated: false,
    }),
}));

describe('LoginPage', () => {
  it('renders the sign-in form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /payments dashboard/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to (light|dark) mode/i })).toBeInTheDocument();
  });

  it('shows a validation error when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/enter both email and password/i);
    });
  });
});
