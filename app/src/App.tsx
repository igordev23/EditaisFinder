import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Licitacoes from './pages/Licitacoes'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Favorites from './pages/Favorites'

function NavTabs() {
  const { pathname } = useLocation()
  const tabs = [
    { path: '/', label: 'Oportunidades', emoji: '🎓' },
    { path: '/licitacoes', label: 'Licitações', emoji: '📋' },
  ]

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            pathname === tab.path
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.emoji} {tab.label}
        </Link>
      ))}
    </div>
  )
}

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
          <Route path="/" element={<><NavTabs /><Home /></>} />
          <Route path="/licitacoes" element={<><NavTabs /><Licitacoes /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </div>
  )
}
