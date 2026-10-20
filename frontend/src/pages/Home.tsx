/**
 * Home component that displays the homepage of the Fullstack Media Gallery Demo.
 */

import { Link } from 'react-router';

function Home() {
  return (
    <div className="grid min-h-[65vh] place-items-center py-12 sm:py-16">
      <section className="max-w-3xl text-center">
        <p className="eyebrow">Fullstack Learning Project</p>
        <h1 className="mt-6 text-5xl leading-[1.08] font-semibold tracking-tight text-slate-950 sm:text-7xl dark:text-white">
          A gallery
          <br />
          <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-300">
            in progress.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          An evolving fullstack media gallery built to explore modern frontend
          and backend development.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link className="button button-primary px-5" to="/gallery">
            Explore the gallery <span aria-hidden="true">→</span>
          </Link>
          <a
            className="button button-secondary px-5"
            href="https://github.com/codemorra/fullstack-media-gallery-demo"
          >
            View source
          </a>
        </div>
        <p className="mt-12 border-t border-slate-200/80 pt-6 text-xs tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
          React & TypeScript{' '}
          <span className="mx-3" aria-hidden="true">
            ·
          </span>{' '}
          FastAPI & SQLite
        </p>
      </section>
    </div>
  );
}

export default Home;
