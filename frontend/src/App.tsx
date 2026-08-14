import { Route, Routes } from 'react-router';
import Home from './pages/Home.tsx';
import Gallery from './pages/Gallery.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Navbar from './components/Navbar.tsx';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
