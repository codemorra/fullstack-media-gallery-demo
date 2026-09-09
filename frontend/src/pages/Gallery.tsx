/**
 * Gallery component that displays locally bundled sample images.
 */

const galleryItems = [
  'sample_001.webp',
  'sample_002.webp',
  'sample_003.webp',
  'sample_004.webp',
  'sample_005.webp',
  'sample_006.webp',
];

function Gallery() {
  return (
    <section className="py-4 sm:py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
            Sample collection
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Gallery
          </h1>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Local sample images used to establish the visual direction of the
            project.
          </p>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {galleryItems.length} images
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((imageName, index) => (
          <figure
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            key={imageName}
          >
            <div className="aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                alt={`Sample gallery image ${index + 1}`}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
                loading={index < 3 ? 'eager' : 'lazy'}
                src={`${import.meta.env.BASE_URL}${imageName}`}
              />
            </div>
            <figcaption className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Sample {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                © Christopher Kranz
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
