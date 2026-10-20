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

// Both data sources provide the same fields needed by the image cards.
type GalleryCard = Pick<
  GalleryItem,
  'id' | 'title' | 'file_path' | 'visibility'
>;

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
 * Displays the selected collection using shared image cards and loading states.
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
    setGalleryItems((items) => [item, ...items]);
  }

  return (
    <section className="py-4 sm:py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
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
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
        <p
          className="mt-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {personal && isApiConfigured && !isLoading && !errorMessage && (
        <UploadForm onUploaded={handleUploaded} />
      )}

      {!isLoading && !errorMessage && galleryItems.length === 0 && (
        <p className="mt-8 text-slate-500 dark:text-slate-400" role="status">
          {personal ? 'You have no images yet.' : 'No public images yet.'}
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <figure
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            key={item.id}
          >
            <div className="aspect-3/2 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                alt={item.title}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
                loading={index < 3 ? 'eager' : 'lazy'}
                // Private images require the same session cookie as API requests.
                crossOrigin={isApiConfigured ? 'use-credentials' : undefined}
                src={
                  isApiConfigured
                    ? getMediaFileUrl(item.id)
                    : `${import.meta.env.BASE_URL}${item.file_path}`
                }
              />
            </div>
            <figcaption className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {item.title}
                </span>
                {personal && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.visibility === 'private' ? 'Private' : 'Public'}
                  </span>
                )}
              </div>
              <span className="text-slate-400 dark:text-slate-500">
                {sampleGalleryItems.some(
                  (sample) => sample.file_path === item.file_path,
                )
                  ? '© Christopher Kranz'
                  : 'Uploaded image'}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
