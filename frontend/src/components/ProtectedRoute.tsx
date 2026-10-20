/**
 * Protected Route component that checks if the user is authenticated before rendering the children.
 */

import { type ReactNode } from 'react';
import { Navigate } from 'react-router';

// Props for the ProtectedRoute component.
type ProtectedRouteProps = {
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  children: ReactNode;
};

/**
 * Waits for session restoration before rendering content or redirecting to login.
 * Backend endpoints enforce access independently of this navigation guard.
 *
 * @param props - The authentication state and protected page.
 * @param props.isCheckingAuth - Whether the initial session check is pending.
 * @param props.isAuthenticated - Whether a valid session has been confirmed.
 * @param props.children - The protected page to render.
 * @returns A loading message, login redirect, or the protected content.
 */
function ProtectedRoute({
  isCheckingAuth,
  isAuthenticated,
  children,
}: ProtectedRouteProps) {
  if (isCheckingAuth) {
    return (
      <p className="text-slate-500 dark:text-slate-400">Checking session …</p>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
