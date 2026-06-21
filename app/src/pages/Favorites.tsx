import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Opportunity } from '../types/supabase'

export default function Favorites() {
  const [favorites, setFavorites] = useState<(Opportunity & { favorited_at: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('favorites')
      .select('created_at, opportunities(*)')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setFavorites(
        data.map((f) => ({
          ...(f.opportunities as unknown as Opportunity),
          favorited_at: f.created_at,
        }))
      )
    }
    setLoading(false)
  }

  async function handleRemove(oppId: string) {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.user.id)
      .eq('opportunity_id', oppId)
    setFavorites((prev) => prev.filter((f) => f.id !== oppId))
  }

  function handleShare(opp: Opportunity) {
    const url = opp.link
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(opp.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhum favorito ainda</p>
          <p className="text-gray-400 text-sm mt-2">
            Navegue pelas oportunidades e salve as que mais te interessarem
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((opp) => (
            <div key={opp.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{opp.titulo}</h2>
                  <p className="text-sm text-gray-500 mt-1">{opp.descricao}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Favoritado em {new Date(opp.favorited_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded whitespace-nowrap">
                  {opp.tipo}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemove(opp.id)}
                    className="text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remover
                  </button>
                  <button
                    onClick={() => handleShare(opp)}
                    className="text-indigo-600 hover:underline"
                  >
                    {copiedId === opp.id ? 'Link copiado!' : 'Compartilhar'}
                  </button>
                </div>
                <a href={opp.link} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline">
                  Ver mais →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
