const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const isApiConfigured = Boolean(apiBaseUrl);

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
};

type ApiErrorResponse = {
  detail?: string;
};

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

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(error?.detail || 'The request failed.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getCurrentUser(): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/me');
}

export function login(
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  });
}

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

export function getGallery(): Promise<{ items: unknown[] }> {
  return apiRequest<{ items: unknown[] }>('/api/gallery');
}
