import { type ReactNode } from 'react';
import { Navigate } from 'react-router';

type ProtectedRouteProps = {
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  children: ReactNode;
};

function ProtectedRoute({
  isCheckingAuth,
  isAuthenticated,
  children,
}: ProtectedRouteProps) {
  if (isCheckingAuth) {
    return <p className="text-slate-400">Sitzung wird überprüft...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
