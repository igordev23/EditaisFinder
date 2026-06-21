import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Favorites from './pages/Favorites'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            EditaisFinder
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">Início</Link>
            <Link to="/favorites" className="text-gray-600 hover:text-indigo-600">Favoritos</Link>
            <Link to="/profile" className="text-gray-600 hover:text-indigo-600">Perfil</Link>
            <Link to="/login" className="text-gray-600 hover:text-indigo-600">Entrar</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  )
}
