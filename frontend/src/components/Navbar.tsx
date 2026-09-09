/**
 * Navbar component for the application.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import type { AuthenticatedUser } from '../lib/api.ts';

// Props for the Navbar component.
type NavbarProps = {
  user: AuthenticatedUser | null;
  isCheckingAuth: boolean;
  onLogout: () => Promise<void>;
  themeToggle: ReactNode;
};

/**
 * Component that renders the navigation bar with links and user authentication status.
 */
function Navbar({
  user,
  isCheckingAuth,
  onLogout,
  themeToggle,
}: NavbarProps) {
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
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          className="font-semibold tracking-tight text-slate-950 dark:text-white"
          to="/"
        >
          Fullstack{' '}
          <span className="text-cyan-600 dark:text-cyan-300">
            Media Gallery
          </span>
        </Link>

        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link className="transition hover:text-cyan-600 dark:hover:text-cyan-300" to="/">
            Home
          </Link>
          <Link
            className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
            to="/gallery"
          >
            Gallery
          </Link>

          {isCheckingAuth ? (
            <span className="hidden text-slate-400 sm:inline">Checking session …</span>
          ) : user ? (
            <>
              <span className="hidden text-slate-500 sm:inline dark:text-slate-400">
                {user.username}
              </span>
              <button
                className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
                to="/register"
              >
                Register
              </Link>
            </>
          )}

          {themeToggle}
        </div>
      </nav>

      {errorMessage && (
        <p className="px-6 pb-3 text-center text-sm text-red-600 dark:text-red-300">
          {errorMessage}
        </p>
      )}
    </header>
  );
}

export default Navbar;
