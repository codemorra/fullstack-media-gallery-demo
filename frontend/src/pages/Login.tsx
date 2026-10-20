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
   * If the login is successful, it navigates to the user's personal gallery.
   * If an error occurs during login, it sets an appropriate error message.
   */
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    // Attempt to log in the user with the provided email and password
    try {
      await onLogin(email, password);
      navigate('/my-gallery', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto my-4 max-w-md sm:my-8">
      <p className="eyebrow">Your collection awaits</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Log in to view your own images.
      </p>

      {!isApiConfigured && (
        <p className="notice notice-info mt-6">
          Sign-in is unavailable in the static preview.
        </p>
      )}

      <form
        className="panel mt-8 space-y-5 border-t-2 border-t-indigo-500 p-6 sm:p-8"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="field-label">Email</span>
          <input
            className="field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {errorMessage && (
          <p className="notice notice-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          className="button button-primary w-full"
          type="submit"
          disabled={!isApiConfigured || isSubmitting}
        >
          {isSubmitting ? 'Signing in …' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No account yet?{' '}
        <Link className="text-link" to="/register">
          Register here
        </Link>
      </p>
    </section>
  );
}

export default Login;
