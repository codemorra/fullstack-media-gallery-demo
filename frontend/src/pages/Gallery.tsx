import { useState, useEffect } from 'react';
import { getGallery } from '../lib/api.ts';

function Gallery() {
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void getGallery()
      .then((gallery) => {
        setItemCount(gallery.items.length);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : 'Could not load gallery.',
        );
      });
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="mt-2 text-slate-400">Dein geschützter Galerie-Bereich.</p>

      {errorMessage && (
        <p className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      {itemCount !== null && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-300">
            Gallery items: <span className="font-semibold">{itemCount}</span>
          </p>
        </div>
      )}
    </section>
  );
}

export default Gallery;
