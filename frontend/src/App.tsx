import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { getCurrentUser, isApiConfigured } from './lib/api.ts';
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

  const isCheckingAuth = authStatus === 'loading';
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
