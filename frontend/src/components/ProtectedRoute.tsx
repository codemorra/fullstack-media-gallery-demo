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
 * Component that renders its children only if the user is authenticated.
 */
function ProtectedRoute({
  isCheckingAuth,
  isAuthenticated,
  children,
}: ProtectedRouteProps) {
  if (isCheckingAuth) {
    return <p className="text-slate-400">Checking session …</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
