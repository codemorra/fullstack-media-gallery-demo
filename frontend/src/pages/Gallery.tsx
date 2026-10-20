/**
 * Gallery component for public images, personal images, and static preview samples.
 */

import { useEffect, useState } from 'react';
import {
  getGallery,
  getMediaFileUrl,
  getMyGallery,
  isApiConfigured,
  type GalleryItem,
} from '../lib/api.ts';
import UploadForm from '../components/UploadForm.tsx';
import MediaActions from '../components/MediaActions.tsx';
import Modal from '../components/Modal.tsx';
import MediaAttribution from '../components/MediaAttribution.tsx';
import SampleCopyright from '../components/SampleCopyright.tsx';

// Static samples share the card fields but have no assigned uploader.
type GalleryCard = Pick<
  GalleryItem,
  'id' | 'title' | 'file_path' | 'visibility'
> & { owner_username?: string };

type GalleryProps = {
  personal?: boolean;
};

const sampleGalleryItems: GalleryCard[] = [
  'sample_001.webp',
  'sample_002.webp',
  'sample_003.webp',
  'sample_004.webp',
  'sample_005.webp',
  'sample_006.webp',
].map((filePath, index) => ({
  id: index + 1,
  title: `Sample ${String(index + 1).padStart(2, '0')}`,
  file_path: filePath,
  visibility: 'public',
}));

/**
 * Displays public or personal image cards and an enlarged image dialog.
 * Personal galleries also provide upload, editing, and deletion dialogs.
 *
 * @param props - The gallery view settings.
 * @param props.personal - Whether to load only the authenticated user's images.
 * @returns The selected gallery and its loading, error, or empty state.
 */
function Gallery({ personal = false }: GalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryCard[]>(
    isApiConfigured || personal ? [] : sampleGalleryItems,
  );
  const [isLoading, setIsLoading] = useState(isApiConfigured);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryCard | null>(null);

  useEffect(() => {
    if (!isApiConfigured) {
      return;
    }

    // Ignore responses after leaving the page, including StrictMode's cleanup.
    let isActive = true;

    const loadGallery = personal ? getMyGallery : getGallery;

    void loadGallery()
      .then((gallery) => {
        if (isActive) {
          setGalleryItems(gallery.items);
        }
      })
      .catch((error) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Could not load gallery.',
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [personal]);

  /**
   * Adds a successfully uploaded image to the personal collection immediately.
   *
   * @param item - The new media record returned by the upload endpoint.
   */
  function handleUploaded(item: GalleryItem) {
    setActionMessage(null);
    setGalleryItems((items) => [item, ...items]);
  }

  /**
   * Replaces the image metadata after a successful update.
   *
   * @param item - The updated media record returned by the backend.
   */
  function handleUpdated(item: GalleryItem) {
    setGalleryItems((items) =>
      items.map((current) => (current.id === item.id ? item : current)),
    );
    setActionMessage('Image updated.');
  }

  /**
   * Removes a deleted image from the displayed collection.
   *
   * @param mediaId - The ID of the image whose deletion was confirmed by the backend.
   */
  function handleDeleted(mediaId: number) {
    setGalleryItems((items) => items.filter((item) => item.id !== mediaId));
    setActionMessage('Image deleted.');
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">
            {personal
              ? 'Your collection'
              : isApiConfigured
                ? 'Public collection'
                : 'Sample collection'}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {personal ? 'My images' : 'Gallery'}
          </h1>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            {personal
              ? 'Your public and private images, all in one place.'
              : isApiConfigured
                ? 'Explore the publicly shared images in this gallery.'
                : 'Local sample images used to establish the visual direction of the project.'}
          </p>
        </div>

        {!isLoading && !errorMessage && (
          <p className="panel self-start px-3 py-2 text-xs font-medium text-slate-500 sm:self-auto dark:text-slate-400">
            {galleryItems.length}{' '}
            {galleryItems.length === 1 ? 'image' : 'images'}
          </p>
        )}
      </div>

      {isLoading && (
        <p className="mt-8 text-slate-500 dark:text-slate-400" role="status">
          Loading gallery …
        </p>
      )}

      {errorMessage && (
        <p className="notice notice-error mt-8" role="alert">
          {errorMessage}
        </p>
      )}

      {personal && isApiConfigured && !isLoading && !errorMessage && (
        <UploadForm onUploaded={handleUploaded} />
      )}

      {actionMessage && (
        <p className="notice notice-success mt-6" role="status">
          {actionMessage}
        </p>
      )}

      {!isLoading && !errorMessage && galleryItems.length === 0 && (
        <p
          className="panel mt-8 px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
          role="status"
        >
          {personal ? 'You have no images yet.' : 'No public images yet.'}
        </p>
      )}

      <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <figure className="panel group overflow-hidden" key={item.id}>
            <button
              className="relative block aspect-3/2 w-full overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset dark:bg-slate-800"
              type="button"
              aria-label={`Open ${item.title}`}
              aria-haspopup="dialog"
              onClick={() => setSelectedImage(item)}
            >
              <img
                alt={item.title}
                className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
                loading={index < 3 ? 'eager' : 'lazy'}
                // Private images require the same session cookie as API requests.
                crossOrigin={isApiConfigured ? 'use-credentials' : undefined}
                src={
                  isApiConfigured
                    ? getMediaFileUrl(item.id)
                    : `${import.meta.env.BASE_URL}${item.file_path}`
                }
              />
              <SampleCopyright filePath={item.file_path} />
            </button>
            <figcaption className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-medium wrap-anywhere text-slate-700 dark:text-slate-200">
                    {item.title}
                  </span>
                  {personal && (
                    <span
                      className={`rounded px-2 py-1 text-[11px] font-medium ${item.visibility === 'private' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'}`}
                    >
                      {item.visibility === 'private' ? 'Private' : 'Public'}
                    </span>
                  )}
                </div>
                <MediaAttribution username={item.owner_username} />
              </div>
              {personal && (
                <MediaActions
                  item={item}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {selectedImage && (
        <Modal
          title={selectedImage.title}
          wide
          onClose={() => setSelectedImage(null)}
        >
          <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-sm">
            <img
              className="block max-h-[70dvh] max-w-full object-contain"
              alt={selectedImage.title}
              crossOrigin={isApiConfigured ? 'use-credentials' : undefined}
              src={
                isApiConfigured
                  ? getMediaFileUrl(selectedImage.id)
                  : `${import.meta.env.BASE_URL}${selectedImage.file_path}`
              }
            />
            <SampleCopyright filePath={selectedImage.file_path} />
          </div>
          <div className="mt-4 text-right">
            <MediaAttribution username={selectedImage.owner_username} />
          </div>
        </Modal>
      )}
    </section>
  );
}

export default Gallery;
