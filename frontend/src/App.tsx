/**
 * App component that manages authentication state and routing for the application.
 */

import { useEffect, useLayoutEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import {
  getCurrentUser,
  isApiConfigured,
  login,
  logout,
  register,
  type AuthenticatedUser,
} from './lib/api.ts';
import Home from './pages/Home.tsx';
import Gallery from './pages/Gallery.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Navbar from './components/Navbar.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './App.css';

// Define the possible authentication statuses for the application
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * App component that manages authentication state and routing for the application.
 * It checks the current authentication status on mount and provides handlers for login, registration, and logout.
 */
function App() {
  // State to manage the current authentication status and the authenticated user
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    isApiConfigured ? 'loading' : 'unauthenticated',
  );
  // State to manage the authenticated user information
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply the theme before painting to avoid flashing light controls in dark mode.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect hook to check the current authentication status when the component mounts
  useEffect(() => {
    if (!isApiConfigured) {
      return;
    }

    // Check the current user and update the authentication status accordingly
    void getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setAuthStatus('authenticated');
      })
      .catch(() => {
        setAuthStatus('unauthenticated');
      });
  }, []);

  /**
   * Handles the login process for the user.
   * It calls the login API with the provided email and password, updates the user state,
   * and sets the authentication status to 'authenticated'.
   */
  async function handleLogin(email: string, password: string) {
    const currentUser = await login(email, password);

    setUser(currentUser);
    setAuthStatus('authenticated');
  }

  /**
   * Handles the registration process for a new user.
   * It calls the register API with the provided username, email, and password.
   */
  async function handleRegister(
    username: string,
    email: string,
    password: string,
  ) {
    await register(username, email, password);
  }

  /**
   * Handles the logout process for the user.
   * It calls the logout API, clears the user state, and sets the authentication status to 'unauthenticated'.
   */
  async function handleLogout() {
    await logout();

    setUser(null);
    setAuthStatus('unauthenticated');
  }

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  // Determine if the application is currently checking the authentication status or if the user is authenticated
  const isCheckingAuth = authStatus === 'loading';
  const isStaticPreview = !isApiConfigured;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-indigo-50/60 via-slate-50 to-cyan-50/40 text-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100">
      <button
        className="button button-primary fixed top-3 left-3 z-50 -translate-y-24 focus:translate-y-0"
        type="button"
        onClick={() => document.getElementById('main-content')?.focus()}
      >
        Skip to content
      </button>
      <Navbar
        user={user}
        isCheckingAuth={isCheckingAuth}
        onLogout={handleLogout}
        themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
      />

      {isStaticPreview && (
        <div
          className="border-b border-indigo-200/60 bg-indigo-50/80 px-5 py-2.5 text-center text-xs leading-5 text-indigo-700 dark:border-indigo-400/15 dark:bg-indigo-400/5 dark:text-indigo-300"
          role="status"
        >
          Frontend preview · Browse the sample collection. Sign-in and image
          management are available when running the project locally.
        </div>
      )}

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 outline-none sm:px-6 sm:py-14"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery key="public" />} />
          <Route
            path="/my-gallery"
            element={
              <ProtectedRoute
                isCheckingAuth={isCheckingAuth}
                isAuthenticated={authStatus === 'authenticated'}
              >
                <Gallery key={user?.id} personal />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<Register onRegister={handleRegister} />}
          />
        </Routes>
      </main>
      <footer className="border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-slate-500 sm:px-6 dark:text-slate-400">
          <p>Fullstack Media Gallery · A learning project</p>
          <p>Work in progress</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
