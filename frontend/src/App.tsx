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

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    isApiConfigured ? 'loading' : 'unauthenticated',
  );
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    if (!isApiConfigured) {
      return;
    }

    void getCurrentUser()
      .then(() => {
        setAuthStatus('authenticated');
      })
      .catch(() => {
        setAuthStatus('unauthenticated');
      });
  }, []);

  async function handleLogin(email: string, password: string) {
    const currentUser = await login(email, password);

    setUser(currentUser);
    setAuthStatus('authenticated');
  }

  async function handleRegister(
    username: string,
    email: string,
    password: string,
  ) {
    await register(username, email, password);
  }

  async function handleLogout() {
    await logout();

    setUser(null);
    setAuthStatus('unauthenticated');
  }

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
