/**
 * Navbar component for the application.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { AuthenticatedUser } from '../lib/api.ts';

// Props for the Navbar component.
type NavbarProps = {
  user: AuthenticatedUser | null;
  isCheckingAuth: boolean;
  onLogout: () => Promise<void>;
};

/**
 * Component that renders the navigation bar with links and user authentication status.
 */
function Navbar({ user, isCheckingAuth, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle user logout.
  async function handleLogout() {
    setErrorMessage(null);

    // Attempt to log out the user and navigate to the home page.
    try {
      await onLogout();
      navigate('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Logout failed.',
      );
    }
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link className="font-semibold text-cyan-300" to="/">
          Media Gallery
        </Link>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <Link className="hover:text-cyan-300" to="/">
            Home
          </Link>
          <Link className="hover:text-cyan-300" to="/gallery">
            Gallery
          </Link>

          {isCheckingAuth ? (
            <span className="text-slate-500">Checking session …</span>
          ) : user ? (
            <>
              <span className="text-slate-400">{user.username}</span>
              <button
                className="hover:text-cyan-300"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hover:text-cyan-300" to="/login">
                Login
              </Link>
              <Link className="hover:text-cyan-300" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {errorMessage && (
        <p className="px-6 pb-3 text-center text-sm text-red-300">
          {errorMessage}
        </p>
      )}
    </header>
  );
}

export default Navbar;
