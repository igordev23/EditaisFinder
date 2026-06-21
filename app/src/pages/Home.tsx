import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import FilterBar from '../components/opportunities/FilterBar'
import SearchInput from '../components/ui/SearchInput'
import type { Opportunity } from '../types/supabase'

type OppExtended = Opportunity & { is_favorited?: boolean }

const PAGE_SIZE = 10

export default function Home() {
  const [opportunities, setOpportunities] = useState<OppExtended[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data: OppExtended[] = []
      let count: number | null = null

      if (session) {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_opportunities_with_relevance',
          {
            user_id: session.user.id,
            tipo_filter: tipo || null,
            search_text: search || null,
            page_size: PAGE_SIZE,
            page_offset: page * PAGE_SIZE,
          }
        )
        if (rpcError) throw rpcError
        data = (rpcData as OppExtended[]) ?? []
        count = data.length
      } else {
        let query = supabase
          .from('opportunities')
          .select('*', { count: 'exact' })

        if (tipo) query = query.eq('tipo', tipo)
        if (search) {
          query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%`)
        }

        const from = page * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const result = await query
          .order('data_publicacao', { ascending: false })
          .range(from, to)

        if (result.error) throw result.error
        data = result.data ?? []
        count = result.count
      }

      if (page === 0) {
        setOpportunities(data)
      } else {
        setOpportunities((prev) => [...prev, ...data])
      }

      setHasMore(count !== null && (page + 1) * PAGE_SIZE < count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [tipo, search, page, session])

  useEffect(() => {
    setPage(0)
    load()
  }, [tipo, search, session])

  useEffect(() => {
    if (page > 0) load()
  }, [page])

  async function handleFeedback(opportunityId: string, relevante: boolean) {
    if (!session) return
    await supabase.from('relevance_feedback').upsert(
      { user_id: session.user.id, opportunity_id: opportunityId, relevante },
      { onConflict: 'user_id, opportunity_id' }
    )
  }

  async function handleFavorite(opp: OppExtended) {
    if (!session) return
    if (opp.is_favorited) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('opportunity_id', opp.id)
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, opportunity_id: opp.id })
    }
    setOpportunities((prev) => prev.map((o) => o.id === opp.id ? { ...o, is_favorited: !o.is_favorited } : o))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Oportunidades</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por palavra-chave..."
          />
        </div>
        <FilterBar tipo={tipo} onTipoChange={setTipo} />
      </div>

      {loading && page === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhuma oportunidade encontrada</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{opp.titulo}</h2>
                    <p className="text-sm text-gray-500 mt-1">{opp.descricao}</p>
                    {opp.score_relevancia !== undefined && opp.score_relevancia > 0 && (
                      <span className="text-xs text-green-600 mt-1 block">
                        Relevância: {opp.score_relevancia}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded whitespace-nowrap">
                      {opp.tipo}
                    </span>
                    {session && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleFeedback(opp.id, true)}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                          title="Relevante"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleFeedback(opp.id, false)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          title="Não relevante"
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                  <span>{new Date(opp.data_publicacao).toLocaleDateString('pt-BR')}</span>
                  <div className="flex items-center gap-3">
                    {session && (
                      <button onClick={() => handleFavorite(opp)}
                        className={opp.is_favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}>
                        {opp.is_favorited ? '♥' : '♡'}
                      </button>
                    )}
                    <a href={opp.link} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline">
                      Ver mais →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
