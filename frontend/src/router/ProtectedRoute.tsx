import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

/**
 * Guards protected routes. If the user is not authenticated, redirects to /login.
 * Renders the nested route via <Outlet /> when authenticated.
 */
export function ProtectedRoute(): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
