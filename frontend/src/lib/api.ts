/**
 * This file contains functions for interacting with the backend API.
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const isApiConfigured = Boolean(apiBaseUrl);

// This type represents the authenticated user object returned by the backend API.
export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string;
};

// These types match the public gallery response models in the backend.
export type GalleryItem = {
  id: number;
  title: string;
  file_path: string;
  owner_id: number;
  created_at: string;
};

export type GalleryResponse = {
  items: GalleryItem[];
};

// This type represents the error response returned by the backend API.
type ApiErrorResponse = {
  detail?: string;
};

/**
 * Makes an API request to the specified path with the given options.
 * Throws an error if the request fails or the backend is not reachable.
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error(
      'API base URL is not configured. Run the app locally with .env.local.',
    );
  }

  let response: Response;

  // Attempt to make the API request and handle network errors.
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Backend is not reachable.');
  }

  // Check if the response is not OK (status code outside the range 200-299).
  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(error?.detail || 'The request failed.');
  }

  // If the response status is 204 (No Content), return undefined.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Retrieves the currently authenticated user from the backend API.
 */
export function getCurrentUser(): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/me');
}

/**
 * Logs in a user with the provided email and password.
 * Returns the authenticated user object on success.
 */
export function login(
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logs out the currently authenticated user.
 */
export function logout(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * Registers a new user with the provided username, email, and password.
 * Returns the authenticated user object on success.
 */
export function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * Retrieves public gallery items without requiring login.
 *
 * @returns The public media records returned by the backend.
 * @throws {Error} If the API is not configured, unavailable, or returns an error response.
 */
export function getGallery(): Promise<GalleryResponse> {
  return apiRequest<GalleryResponse>('/api/gallery');
}
