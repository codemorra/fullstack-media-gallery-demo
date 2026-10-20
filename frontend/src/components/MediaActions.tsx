/**
 * Editing and deletion controls for images in the authenticated user's gallery.
 */

import { useState } from 'react';
import type * as React from 'react';
import { deleteImage, updateImage, type GalleryItem } from '../lib/api.ts';
import Modal from './Modal.tsx';

type MediaActionsProps = {
  item: Pick<GalleryItem, 'id' | 'title' | 'visibility'>;
  onUpdated: (item: GalleryItem) => void;
  onDeleted: (mediaId: number) => void;
};

/**
 * Renders action buttons with editing and deletion confirmation dialogs.
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
   * Deletes the image after the user has opened and confirmed the deletion dialog.
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
      <div className="flex items-center gap-2">
        <button
          className="button button-secondary min-h-9 px-3 py-1.5 text-xs"
          type="button"
          aria-label={`Edit ${item.title}`}
          aria-haspopup="dialog"
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
          className="button button-danger-ghost min-h-9 px-3 py-1.5 text-xs"
          type="button"
          aria-label={`Delete ${item.title}`}
          aria-haspopup="dialog"
          onClick={() => {
            setErrorMessage(null);
            setMode('delete');
          }}
        >
          Delete
        </button>
      </div>

      {mode !== null && (
        <Modal
          title={mode === 'edit' ? 'Edit image' : 'Delete image'}
          isBusy={isSubmitting}
          onClose={() => setMode(null)}
        >
          {mode === 'edit' && (
            <form className="space-y-4" onSubmit={handleSave}>
              <label className="block">
                <span className="field-label">Title</span>
                <input
                  className="field"
                  type="text"
                  data-autofocus
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label className="block">
                <span className="field-label">Visibility</span>
                <select
                  className="field"
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(
                      event.target.value as GalleryItem['visibility'],
                    )
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

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving …' : 'Save changes'}
                </button>
                <button
                  className="button button-secondary"
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
            <div className="notice notice-error space-y-3">
              <p className="text-red-700 dark:text-red-200">
                Delete “{item.title}”? This cannot be undone.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="button button-danger"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDelete}
                >
                  {isSubmitting ? 'Deleting …' : 'Delete permanently'}
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  data-autofocus
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
            <p className="notice notice-error mt-3" role="alert">
              {errorMessage}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

export default MediaActions;
