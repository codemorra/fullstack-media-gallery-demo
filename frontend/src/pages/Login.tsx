/**
 * Login component for user authentication.
 */

import { useState } from 'react';
import type * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { isApiConfigured } from '../lib/api.ts';

type LoginProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

/**
 * Login component that renders a login form and handles user authentication.
 */
function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the form submission for user login.
   * It sets the submitting state, and attempts to log in the user with the provided email and password.
   * If the login is successful, it navigates to the gallery page.
   * If an error occurs during login, it sets an appropriate error message.
   */
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    // Attempt to log in the user with the provided email and password
    try {
      await onLogin(email, password);
      navigate('/gallery', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="mt-2 text-slate-400">
        Einloggen, um auf die Galerie zuzugreifen.
      </p>

      {!isApiConfigured && (
        <p className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Login nicht möglich ohne lokale Backend Verbindung.
        </p>
      )}

      <form
        className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}

        <button
          className="w-full rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={!isApiConfigured || isSubmitting}
        >
          {isSubmitting ? 'Signing in …' : 'Sign in'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-400">
        No account yet?{' '}
        <Link className="text-cyan-300 hover:text-cyan-200" to="/register">
          Register here
        </Link>
      </p>
    </section>
  );
}

export default Login;
