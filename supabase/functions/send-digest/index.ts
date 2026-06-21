import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'EditaisFinder <noreply@editaisfinder.com.net>'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface UserProfile {
  id: string
  nome: string | null
  email?: string
}

interface Interesse {
  palavra_chave: string
}

interface Oportunidade {
  id: string
  titulo: string
  descricao: string | null
  link: string
  tipo: string
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await supabase.auth.admin.getUserById(userId)
  return data?.user?.email ?? null
}

function matchingKeywords(opp: Oportunidade, keywords: string[]): string[] {
  const texto = `${opp.titulo} ${opp.descricao ?? ''}`.toLowerCase()
  return keywords.filter((k) => texto.includes(k.toLowerCase()))
}

async function sendDigestEmail(
  email: string,
  nome: string | null,
  oportunidades: Oportunidade[],
  matchedKeywords: string[]
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[DRY-RUN] Para ${email}: ${oportunidades.length} oportunidades (${matchedKeywords.join(', ')})`)
    return true
  }

  const itemsHtml = oportunidades
    .map(
      (o) =>
        `<li style="margin-bottom:12px">
          <a href="${o.link}" style="color:#4f46e5;font-weight:600;text-decoration:none">${o.titulo}</a>
          <span style="display:inline-block;background:#eef2ff;color:#4338ca;font-size:12px;padding:2px 8px;border-radius:4px;margin-left:8px">${o.tipo}</span>
          <p style="margin:4px 0 0;color:#6b7280;font-size:14px">${o.descricao ?? ''}</p>
        </li>`
    )
    .join('')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: `Novas oportunidades para você (${matchedKeywords.join(', ')})`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif">
          <h1 style="color:#111827">Olá${nome ? `, ${nome}` : ''}!</h1>
          <p style="color:#4b5563">Encontramos <strong>${oportunidades.length}</strong> nova(s) oportunidade(s) que combinam com seus interesses:</p>
          <ul style="list-style:none;padding:0">${itemsHtml}</ul>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            Você está recebendo este e-mail porque possui interesses cadastrados no EditaisFinder.
          </p>
        </div>
      `,
    }),
  })

  return res.ok
}

Deno.serve(async () => {
  console.log('Starting digest...')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .not('areas_interesse', 'eq', '[]')

  if (!profiles || profiles.length === 0) {
    console.log('Nenhum perfil com interesses encontrado')
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  let totalSent = 0

  for (const profile of profiles) {
    const userId = profile.id

    const { data: interesses } = await supabase
      .from('user_interests')
      .select('palavra_chave')
      .eq('user_id', userId)

    if (!interesses || interesses.length === 0) continue

    const keywords = interesses.map((i) => i.palavra_chave)

    const { data: lastDigest } = await supabase
      .from('digest_log')
      .select('ultimo_envio')
      .eq('user_id', userId)
      .order('ultimo_envio', { ascending: false })
      .limit(1)
      .single()

    const since = lastDigest?.ultimo_envio
      ? new Date(lastDigest.ultimo_envio).toISOString()
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: oportunidades } = await supabase
      .from('opportunities')
      .select('id, titulo, descricao, link, tipo')
      .gte('data_publicacao', since)
      .order('data_publicacao', { ascending: false })

    if (!oportunidades || oportunidades.length === 0) continue

    const matched: Oportunidade[] = []
    const matchedKw = new Set<string>()

    for (const opp of oportunidades) {
      const m = matchingKeywords(opp, keywords)
      if (m.length > 0) {
        matched.push(opp)
        m.forEach((k) => matchedKw.add(k))
      }
    }

    if (matched.length === 0) continue

    const email = await getUserEmail(userId)
    if (!email) continue

    const ok = await sendDigestEmail(email, profile.nome, matched, [...matchedKw])
    if (!ok) {
      console.error(`Falha ao enviar e-mail para ${email}`)
      continue
    }

    await supabase.from('digest_log').insert({
      user_id: userId,
      ultimo_envio: new Date().toISOString(),
      total_oportunidades: matched.length,
    })

    totalSent++
  }

  console.log(`Digest concluído: ${totalSent} e-mails enviados`)
  return new Response(
    JSON.stringify({ sent: totalSent }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
