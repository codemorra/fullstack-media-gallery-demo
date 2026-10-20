/**
 * Upload form for adding private images to the authenticated user's gallery.
 */

import { useState } from 'react';
import type * as React from 'react';
import { uploadImage, type GalleryItem } from '../lib/api.ts';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type UploadFormProps = {
  onUploaded: (item: GalleryItem) => void;
};

/**
 * Renders the image upload form and reports successfully created media records.
 *
 * @param props - The upload form callbacks.
 * @param props.onUploaded - Called after the backend has saved the image.
 * @returns The upload form with progress, error, and success feedback.
 */
function UploadForm({ onUploaded }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Checks basic input limits and sends the selected file to the backend.
   *
   * @param event - The form submission event whose default navigation is prevented.
   * @returns A promise that resolves after the upload attempt completes.
   */
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || !file) {
      setErrorMessage('Enter a title and select an image.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMessage('The image must not exceed 10 MiB.');
      return;
    }

    setIsSubmitting(true);
    try {
      // The backend performs the authoritative format, size, and ownership checks.
      const item = await uploadImage(title.trim(), file);
      onUploaded(item);
      setTitle('');
      setFile(null);
      form.reset();
      setSuccessMessage(
        'Image uploaded. It is private and only visible to you.',
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Upload failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Add an image</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          New uploads are private. JPEG, PNG, or WebP, up to 10 MiB and 20
          million pixels. Animated images are not supported.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Title
          </span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-300"
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Image file
          </span>
          <input
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-slate-100 file:px-3 file:py-2.5 file:font-medium file:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            disabled={isSubmitting}
            required
          />
        </label>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-300" role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <button
        className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:hover:bg-cyan-300"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Uploading …' : 'Upload image'}
      </button>
    </form>
  );
}

export default UploadForm;
