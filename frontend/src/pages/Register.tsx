/**
 * Register component that renders a registration form and handles user registration.
 */

import { useState } from 'react';
import type * as React from 'react';
import { Link } from 'react-router';
import { isApiConfigured } from '../lib/api.ts';

// Define the props for the Register component
type RegisterProps = {
  onRegister: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
};

/**
 * Register component that renders a registration form and handles user registration.
 */
function Register({ onRegister }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the form submission for user registration.
   * It tries to register the user with the provided username, email, and password.
   * If the registration is successful, it sets a success message and clears the form fields.
   * If an error occurs during registration, it sets an appropriate error message.
   */
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Attempt to register the user with the provided username, email, and password
    try {
      await onRegister(username, email, password);

      setSuccessMessage('Registration successful!');

      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      // Set an error message based on the error type
      setErrorMessage(
        error instanceof Error ? error.message : 'Registration failed.',
      );
    } finally {
      // Reset the submitting state after the registration attempt
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Register</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Create a local demo account.
      </p>

      {!isApiConfigured && (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          Registration is unavailable without a local backend connection.
        </p>
      )}

      <form
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Username
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-300 dark:focus:ring-cyan-300/20"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-300 dark:focus:ring-cyan-300/20"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-300 dark:focus:ring-cyan-300/20"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={10}
            maxLength={128}
            required
          />
        </label>

        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-300">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        )}

        <button
          className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:hover:bg-cyan-300"
          type="submit"
          disabled={!isApiConfigured || isSubmitting}
        >
          {isSubmitting ? 'Creating account …' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link
          className="font-medium text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
          to="/login"
        >
          Go to login
        </Link>
      </p>
    </section>
  );
}

export default Register;
