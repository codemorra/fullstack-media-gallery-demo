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
import './App.css';

// Define the possible authentication statuses for the application
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

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

  // Determine if the application is currently checking the authentication status or if the user is authenticated
  const isCheckingAuth = authStatus === 'loading';
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        user={user}
        isCheckingAuth={isCheckingAuth}
        onLogout={handleLogout}
      />

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
