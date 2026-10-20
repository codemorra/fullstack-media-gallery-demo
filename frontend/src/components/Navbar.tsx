/**
 * Navbar component for the application.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
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
 * Builds the shared navigation style with a visible active-page state.
 *
 * @param state - The active route information supplied by React Router.
 * @returns Tailwind classes for the navigation link.
 */
function navigationClass({ isActive }: { isActive: boolean }): string {
  return `button button-ghost ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200' : ''}`;
}

/**
 * Component that renders the navigation bar with links and user authentication status.
 */
function Navbar({ user, isCheckingAuth, onLogout, themeToggle }: NavbarProps) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'Gallery' },
    ...(isCheckingAuth
      ? []
      : user
        ? [{ to: '/my-gallery', label: 'My images' }]
        : [
            { to: '/login', label: 'Login' },
            { to: '/register', label: 'Register' },
          ]),
  ];

  // Handle user logout.
  async function handleLogout() {
    setErrorMessage(null);

    // Attempt to log out the user and navigate to the home page.
    try {
      await onLogout();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Logout failed.',
      );
    }
  }

  const navigation = (
    <>
      {navigationItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={
            to === '/register' ? 'button button-primary' : navigationClass
          }
          onClick={() => setIsMenuOpen(false)}
        >
          {label}
        </NavLink>
      ))}
      {isCheckingAuth && (
        <span className="px-3 text-xs text-slate-500">Checking session …</span>
      )}
      {!isCheckingAuth && user && (
        <>
          <span className="hidden max-w-32 truncate px-2 text-xs text-slate-500 lg:block dark:text-slate-400">
            {user.username}
          </span>
          <button
            className="button button-secondary"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
      <nav
        className="mx-auto w-full max-w-7xl px-5 sm:px-6"
        aria-label="Main navigation"
      >
        <div className="flex min-h-20 items-center justify-between gap-3">
          <Link
            className="flex shrink-0 items-center gap-3"
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8" cy="8" r="1.5" />
                <path d="m3 16 5-5 4 4 3-3 6 6" />
              </svg>
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Fullstack
              </span>
              <span className="block text-sm font-semibold tracking-tight text-slate-950 sm:text-base dark:text-white">
                Media Gallery
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {navigation}
            </div>
            {themeToggle}
            <button
              className="button button-secondary size-10 p-0 md:hidden"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg
                aria-hidden="true"
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path
                  d={
                    isMenuOpen
                      ? 'm6 6 12 12M6 18 18 6'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="flex flex-wrap gap-2 border-t border-slate-200 py-4 md:hidden dark:border-slate-800"
          >
            {navigation}
          </div>
        )}
      </nav>
      {errorMessage && (
        <p className="notice notice-error mx-auto mb-3 max-w-7xl" role="alert">
          {errorMessage}
        </p>
      )}
    </header>
  );
}

export default Navbar;
