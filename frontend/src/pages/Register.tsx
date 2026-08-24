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
      <h1 className="text-3xl font-bold">Register</h1>
      <p className="mt-2 text-slate-400">Create a local demo account.</p>

      {!isApiConfigured && (
        <p className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          Registration is unavailable without a local backend connection.
        </p>
      )}

      <form
        className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="text-sm font-medium">Username</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>

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
            minLength={10}
            maxLength={128}
            required
          />
        </label>

        {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}

        {successMessage && (
          <p className="text-sm text-emerald-300">{successMessage}</p>
        )}

        <button
          className="w-full rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={!isApiConfigured || isSubmitting}
        >
          {isSubmitting ? 'Creating account …' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-400">
        Already registered?{' '}
        <Link className="text-cyan-300 hover:text-cyan-200" to="/login">
          Go to login
        </Link>
      </p>
    </section>
  );
}

export default Register;
