import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../services/supabase'

export default function Login() {
  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Entrar</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        localization={{
          variables: {
            sign_in: { email_label: 'E-mail', password_label: 'Senha', button_label: 'Entrar' },
            sign_up: { email_label: 'E-mail', password_label: 'Senha', button_label: 'Cadastrar' },
          },
        }}
      />
    </div>
  )
}
