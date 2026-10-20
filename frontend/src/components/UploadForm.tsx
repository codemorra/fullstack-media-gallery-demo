/**
 * Upload form for adding private images to the authenticated user's gallery.
 */

import { useState } from 'react';
import type * as React from 'react';
import { uploadImage, type GalleryItem } from '../lib/api.ts';
import Modal from './Modal.tsx';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type UploadFormProps = {
  onUploaded: (item: GalleryItem) => void;
};

/**
 * Opens the image upload dialog and reports successfully created media records.
 *
 * @param props - The upload form callbacks.
 * @param props.onUploaded - Called after the backend has saved the image.
 * @returns An upload button, its dialog, and successful upload feedback.
 */
function UploadForm({ onUploaded }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);
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
      setSuccessMessage('Image uploaded as private.');
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Upload failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        className="button button-primary"
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setTitle('');
          setFile(null);
          setErrorMessage(null);
          setSuccessMessage(null);
          setIsOpen(true);
        }}
      >
        <span aria-hidden="true">+</span> Upload image
      </button>
      {successMessage && (
        <p className="notice notice-success mt-4" role="status">
          {successMessage}
        </p>
      )}
      {isOpen && (
        <Modal
          title="Upload an image"
          isBusy={isSubmitting}
          onClose={() => setIsOpen(false)}
        >
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
          >
            <div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                New uploads are private. JPEG, PNG, or WebP, up to 10 MiB and 20
                million pixels. Animated images are not supported.
              </p>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="field-label">Title</span>
                <input
                  className="field"
                  type="text"
                  data-autofocus
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label className="block">
                <span className="field-label">Image file</span>
                <input
                  className="file-field"
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
              <p className="notice notice-error" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
              <button
                className="button button-secondary"
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading …' : 'Upload image'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default UploadForm;
