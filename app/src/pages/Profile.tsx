import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { Profile as ProfileType } from '../types/supabase'

export default function Profile() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session) return

    const form = new FormData(e.currentTarget)
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      nome: form.get('nome') as string,
      curso: form.get('curso') as string,
      periodo: Number(form.get('periodo')),
      areas_interesse: (form.get('areas_interesse') as string).split(',').map(s => s.trim()),
    })

    if (!error) loadProfile(session.user.id)
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Faça login para acessar seu perfil.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input name="nome" defaultValue={profile?.nome ?? ''} required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Curso</label>
          <input name="curso" defaultValue={profile?.curso ?? ''} required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Período</label>
          <input name="periodo" type="number" min={1} max={10}
            defaultValue={profile?.periodo ?? 1} required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Áreas de Interesse (separadas por vírgula)
          </label>
          <input name="areas_interesse"
            defaultValue={profile?.areas_interesse?.join(', ') ?? ''}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
        </div>
        <button type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
          Salvar
        </button>
      </form>
    </div>
  )
}
