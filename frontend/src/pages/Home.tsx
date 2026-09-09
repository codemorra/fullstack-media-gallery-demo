/**
 * Home component that displays the homepage of the Fullstack Media Gallery Demo.
 */
function Home() {
  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <section className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
          Fullstack Learning Project
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
          A gallery in progress.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          An evolving fullstack media gallery built to explore modern frontend
          and backend development.
        </p>
      </section>
    </div>
  );
}

export default Home;
