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
    <section className="mx-auto my-4 max-w-md sm:my-8">
      <p className="eyebrow">Make it your own</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Create an account.
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Start your own image collection.
      </p>

      {!isApiConfigured && (
        <p className="notice notice-info mt-6">
          Registration is unavailable in the static preview.
        </p>
      )}

      <form
        className="panel mt-8 space-y-5 border-t-2 border-t-indigo-500 p-6 sm:p-8"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="field-label">Username</span>
          <input
            className="field"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={10}
            maxLength={128}
            required
          />
        </label>

        {errorMessage && (
          <p className="notice notice-error" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="notice notice-success" role="status">
            {successMessage}
          </p>
        )}

        <button
          className="button button-primary w-full"
          type="submit"
          disabled={!isApiConfigured || isSubmitting}
        >
          {isSubmitting ? 'Creating account …' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link className="text-link" to="/login">
          Go to login
        </Link>
      </p>
    </section>
  );
}

export default Register;
