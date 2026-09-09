/**
 * App component that manages authentication state and routing for the application.
 */

import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import {
  getCurrentUser,
  isApiConfigured,
  login,
  logout,
  register,
  type AuthenticatedUser,
} from './lib/api.ts';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Home from './pages/Home.tsx';
import Gallery from './pages/Gallery.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Navbar from './components/Navbar.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';
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

  // Apply the selected color theme to the document and remember manual choices.
  useEffect(() => {
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
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    );
  }

  // Determine if the application is currently checking the authentication status or if the user is authenticated
  const isCheckingAuth = authStatus === 'loading';
  const isAuthenticated = authStatus === 'authenticated';
  const isStaticPreview = !isApiConfigured;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        user={user}
        isCheckingAuth={isCheckingAuth}
        onLogout={handleLogout}
        themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
      />

      {isStaticPreview && (
        <div
          className="border-b border-amber-300 bg-amber-50 px-6 py-3 text-center text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
          role="status"
        >
          Static frontend preview: authentication and gallery data are
          unavailable because no backend is deployed.
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute
                isCheckingAuth={isCheckingAuth}
                isAuthenticated={isAuthenticated}
              >
                <Gallery />
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
    </div>
  );
}

export default App;
