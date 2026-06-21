import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import SearchInput from '../components/ui/SearchInput'
import type { Opportunity } from '../types/supabase'

const PAGE_SIZE = 10
const PERIODOS = ['', '2026', '2026.1', '2026.2', '2025', '2025.1', '2025.2']
const DEBOUNCE_MS = 300

export default function Licitacoes() {
  const [licitacoes, setLicitacoes] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cidade, setCidade] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [cidades, setCidades] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/PI/municipios')
      .then((r) => r.json())
      .then((data) => setCidades(data.map((m: { nome: string }) => m.nome).sort()))
      .catch(() => {})
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timerRef.current)
  }, [search])

  function refinarBusca() {
    clearTimeout(timerRef.current)
    setDebouncedSearch(search)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('opportunities')
        .select('*', { count: 'exact' })
        .eq('tipo', 'licitacao')

      if (cidade) query = query.eq('cidade', cidade)
      if (periodo) query = query.eq('periodo', periodo)
      if (debouncedSearch) {
        query = query.or(
          `titulo.ilike.%${debouncedSearch}%,descricao.ilike.%${debouncedSearch}%,orgao.ilike.%${debouncedSearch}%,cidade.ilike.%${debouncedSearch}%`
        )
      }

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await query
        .order('data_publicacao', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (page === 0) {
        setLicitacoes(data ?? [])
      } else {
        setLicitacoes((prev) => [...prev, ...(data ?? [])])
      }

      setHasMore(count !== null && from + PAGE_SIZE < count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, cidade, periodo, page])

  useEffect(() => {
    setPage(0)
    load()
  }, [debouncedSearch, cidade, periodo])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Licitações</h1>
      <p className="text-sm text-gray-500 mb-4">Licitações públicas de prefeituras e órgãos governamentais</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            onSearch={refinarBusca}
            placeholder="Buscar por palavra-chave ou órgão..."
          />
        </div>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Todos os períodos</option>
          {PERIODOS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading && page === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : licitacoes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhuma licitação encontrada</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {licitacoes.map((lic) => (
              <div key={lic.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{lic.titulo}</h2>
                    {lic.orgao && (
                      <p className="text-sm text-indigo-600 mt-1">{lic.orgao}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{lic.descricao}</p>
                    <div className="flex gap-2 mt-1">
                      {lic.periodo && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {lic.periodo}
                        </span>
                      )}
                      {lic.cidade && (
                        <span className="text-xs text-gray-400">📍 {lic.cidade}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded whitespace-nowrap">
                    licitação
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                  <span>{new Date(lic.data_publicacao).toLocaleDateString('pt-BR')}</span>
                  <a href={lic.link} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline">
                    Ver edital →
                  </a>
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
