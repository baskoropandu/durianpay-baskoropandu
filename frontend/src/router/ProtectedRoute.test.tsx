import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Mock the auth store to control authentication state per test.
const mocks = vi.hoisted(() => ({ isAuthenticated: false }));
vi.mock('../store/auth', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mocks.isAuthenticated }),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>DASHBOARD</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    mocks.isAuthenticated = false;
    const { container } = renderProtected();
    expect(container).toHaveTextContent('LOGIN_PAGE');
    expect(container).not.toHaveTextContent('DASHBOARD');
  });

  it('renders the protected content when authenticated', () => {
    mocks.isAuthenticated = true;
    const { container } = renderProtected();
    expect(container).toHaveTextContent('DASHBOARD');
    expect(container).not.toHaveTextContent('LOGIN_PAGE');
  });
});
