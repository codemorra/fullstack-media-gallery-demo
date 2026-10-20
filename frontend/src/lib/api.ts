/**
 * This file contains functions for interacting with the backend API.
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

export const isApiConfigured = Boolean(apiBaseUrl);

// This type represents the authenticated user object returned by the backend API.
export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string;
};

// These types match the gallery response models in the backend.
export type GalleryItem = {
  id: number;
  title: string;
  file_path: string;
  owner_id: number;
  owner_username: string;
  visibility: 'public' | 'private';
  created_at: string;
};

export type GalleryResponse = {
  items: GalleryItem[];
};

export type MediaUpdateData = Partial<
  Pick<GalleryItem, 'title' | 'visibility'>
>;

// This type represents the error response returned by the backend API.
type ApiErrorResponse = {
  detail?: string | { msg: string }[];
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
  const headers = new Headers(options.headers);

  // FormData needs the browser-generated Content-Type, including its multipart boundary.
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Attempt to make the API request and handle network errors.
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new Error('Backend is not reachable.');
  }

  // Check if the response is not OK (status code outside the range 200-299).
  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    const detail = error?.detail;
    const message = Array.isArray(detail)
      ? detail.map((issue) => issue.msg).join(' ')
      : detail;
    throw new Error(message || 'The request failed.');
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

/**
 * Retrieves the signed-in user's public and private gallery items.
 *
 * @returns The media records owned by the authenticated user.
 * @throws {Error} If the session is invalid or the request fails.
 */
export function getMyGallery(): Promise<GalleryResponse> {
  return apiRequest<GalleryResponse>('/api/gallery/mine');
}

/**
 * Uploads an image with the selected visibility for the signed-in user.
 *
 * @param title - The descriptive title of the image.
 * @param file - The JPEG, PNG, or WebP file to upload.
 * @param visibility - Who may view the image; defaults to private.
 * @returns The newly created media record including its uploader's username.
 * @throws {Error} If validation, authentication, or the upload fails.
 */
export function uploadImage(
  title: string,
  file: File,
  visibility: GalleryItem['visibility'] = 'private',
): Promise<GalleryItem> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  formData.append('visibility', visibility);

  return apiRequest<GalleryItem>('/api/media', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Updates the title and/or visibility of an image owned by the signed-in user.
 *
 * @param mediaId - The ID of the image to update.
 * @param data - The title and/or visibility fields to change.
 * @returns The updated media record.
 * @throws {Error} If validation, ownership checks, or the request fails.
 */
export function updateImage(
  mediaId: number,
  data: MediaUpdateData,
): Promise<GalleryItem> {
  return apiRequest<GalleryItem>(`/api/media/${mediaId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Deletes an image owned by the signed-in user.
 *
 * @param mediaId - The ID of the image to delete.
 * @returns A promise that resolves when the image record has been deleted.
 * @throws {Error} If authentication, ownership checks, or the request fails.
 */
export function deleteImage(mediaId: number): Promise<void> {
  return apiRequest<void>(`/api/media/${mediaId}`, {
    method: 'DELETE',
  });
}

/**
 * Builds the URL of an image served through the backend's access checks.
 *
 * @param mediaId - The ID of the requested media record.
 * @returns The absolute URL of the image endpoint.
 * @throws {Error} If the API base URL is not configured.
 */
export function getMediaFileUrl(mediaId: number): string {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured.');
  }

  return `${apiBaseUrl}/api/media/${mediaId}/file`;
}
