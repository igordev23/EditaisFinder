import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(data?.role ?? null)
      }
      setCheckingAuth(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const { error: insertError } = await supabase.from('opportunities').insert({
      titulo: form.get('titulo') as string,
      descricao: form.get('descricao') as string,
      link: form.get('link') as string,
      tipo: form.get('tipo') as string,
      fonte: 'manual',
      data_publicacao: new Date().toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  if (checkingAuth) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session || (role !== 'admin' && role !== 'professor')) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Acesso restrito a professores e administradores.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastrar Oportunidade</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input name="titulo" required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="descricao" rows={3}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Link *</label>
          <input name="link" type="url" required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select name="tipo" required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border">
            <option value="estagio">Estágio</option>
            <option value="bolsa">Bolsa</option>
            <option value="monitoria">Monitoria</option>
            <option value="emprego">Emprego</option>
            <option value="edital">Edital</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Oportunidade cadastrada com sucesso!
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 transition">
          {loading ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
