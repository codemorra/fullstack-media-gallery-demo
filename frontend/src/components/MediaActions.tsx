/**
 * Editing and deletion controls for images in the authenticated user's gallery.
 */

import { useState } from 'react';
import type * as React from 'react';
import { deleteImage, updateImage, type GalleryItem } from '../lib/api.ts';

type MediaActionsProps = {
  item: Pick<GalleryItem, 'id' | 'title' | 'visibility'>;
  onUpdated: (item: GalleryItem) => void;
  onDeleted: (mediaId: number) => void;
};

/**
 * Renders an inline editor and an explicit deletion confirmation.
 *
 * @param props - The image and callbacks used to update the gallery.
 * @param props.item - The owned image shown by the surrounding card.
 * @param props.onUpdated - Called after the backend saves the changes.
 * @param props.onDeleted - Called after the backend deletes the image record.
 * @returns The image controls and any pending action or error feedback.
 */
function MediaActions({ item, onUpdated, onDeleted }: MediaActionsProps) {
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
  const [title, setTitle] = useState(item.title);
  const [visibility, setVisibility] = useState(item.visibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Saves the edited metadata without changing the displayed card on failure.
   *
   * @param event - The form submission event whose default navigation is prevented.
   * @returns A promise that resolves after the update attempt completes.
   */
  async function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('The title must not be blank.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedItem = await updateImage(item.id, {
        title: title.trim(),
        visibility,
      });
      onUpdated(updatedItem);
      setMode(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not save changes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Deletes the image after the user has opened and confirmed the deletion panel.
   *
   * @returns A promise that resolves after the deletion attempt completes.
   */
  async function handleDelete() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await deleteImage(item.id);
      onDeleted(item.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not delete image.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800"
      aria-busy={isSubmitting}
    >
      {mode === null && (
        <div className="flex items-center gap-4">
          <button
            className="font-medium text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
            type="button"
            aria-label={`Edit ${item.title}`}
            onClick={() => {
              // Start each edit with the latest values confirmed by the backend.
              setTitle(item.title);
              setVisibility(item.visibility);
              setErrorMessage(null);
              setMode('edit');
            }}
          >
            Edit
          </button>
          <button
            className="font-medium text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
            type="button"
            aria-label={`Delete ${item.title}`}
            onClick={() => {
              setErrorMessage(null);
              setMode('delete');
            }}
          >
            Delete
          </button>
        </div>
      )}

      {mode === 'edit' && (
        <form className="space-y-4" onSubmit={handleSave}>
          <label className="block">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Title
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="block">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Visibility
            </span>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as GalleryItem['visibility'])
              }
              disabled={isSubmitting}
            >
              <option value="private">Private — only you</option>
              <option value="public">Public — everyone</option>
            </select>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Public images appear in the gallery and can be viewed without
            signing in.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:hover:bg-cyan-300"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving …' : 'Save changes'}
            </button>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setErrorMessage(null);
                setMode(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'delete' && (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-400/30 dark:bg-red-400/10">
          <p className="text-red-700 dark:text-red-200">
            Delete “{item.title}”? This cannot be undone.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              {isSubmitting ? 'Deleting …' : 'Delete permanently'}
            </button>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-600 hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setErrorMessage(null);
                setMode(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-red-600 dark:text-red-300" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default MediaActions;
