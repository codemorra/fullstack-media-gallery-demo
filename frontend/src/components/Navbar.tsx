import { Link } from 'react-router';

function Navbar() {
  return (
    <header className="border-b border-slate-800">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-semibold text-white" to="/">
          Media Gallery
        </Link>

        <div className="flex gap-4 text-sm text-slate-300">
          <Link className="hover:text-white" to="/">
            Start
          </Link>
          <Link className="hover:text-white" to="/gallery">
            Galerie
          </Link>
          <Link className="hover:text-white" to="/login">
            Login
          </Link>
          <Link className="hover:text-white" to="/register">
            Registrieren
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
