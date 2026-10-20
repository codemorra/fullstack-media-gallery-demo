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
 * Renders the shared-styled sign-in form with pending and error feedback.
 *
 * @param props - The login action supplied by App.
 * @param props.onLogin - Authenticates the user and updates application state.
 * @returns The sign-in form and a registration link.
 */
function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Opens My images after login, keeping failures visible in the form.
   *
   * @param event - The form submission event whose navigation is prevented.
   * @returns A promise that resolves after the login attempt.
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
