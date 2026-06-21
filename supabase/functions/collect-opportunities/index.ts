import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY')!
const RSS_URL = 'https://ifpi.edu.br/ultimas-noticias/rss'

const TIPOS_KEYWORDS: Record<string, string[]> = {
  estagio: ['estágio', 'estagio', 'trainee', 'aprendiz'],
  bolsa: ['bolsa', 'pibic', 'pibiti', 'fomento'],
  monitoria: ['monitória', 'monitoria', 'monitor'],
  emprego: ['emprego', 'vaga', 'contratação', 'contratacao', 'trabalhe conosco'],
  edital: ['edital', 'processo seletivo', 'chamada pública', 'chamada publica'],
  licitacao: ['licitação', 'licitacao', 'pregão', 'pregao', 'concorrência', 'concorrencia', 'tomada de preços'],
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function detectarTipo(titulo: string, descricao: string): string {
  const texto = `${titulo} ${descricao}`.toLowerCase()
  for (const [tipo, keywords] of Object.entries(TIPOS_KEYWORDS)) {
    if (keywords.some((k) => texto.includes(k))) return tipo
  }
  return 'edital'
}

function extractOrgao(titulo: string, snippet: string): string | null {
  const padroes = [
    /prefeitura municipal de ([a-záéíóúãõç\s]+)/i,
    /secretaria (municipal|estadual) (de |da |do )?([a-záéíóúãõç\s]+)/i,
    /governo (do estado|municipal) de ([a-záéíóúãõç\s]+)/i,
    /câmara municipal de ([a-záéíóúãõç\s]+)/i,
    /(\w+\s+\w*\s*-\s*prefeitura)/i,
  ]
  for (const p of padroes) {
    const m = `${titulo} ${snippet}`.match(p)
    if (m) return m[0].trim()
  }
  return null
}

function extractCidade(titulo: string, snippet: string): string | null {
  const padroes = [
    /prefeitura municipal de ([a-záéíóúãõç\s]+?)(?:\s|-|,|$)/i,
    /município de ([a-záéíóúãõç\s]+?)(?:\s|-|,|\.|$)/i,
    /cidade de ([a-záéíóúãõç\s]+?)(?:\s|-|,|\.|$)/i,
    /em ([A-ZÁÉÍÓÚÃÕÇ][a-záéíóúãõç]+)(?:\s|-|,|\.|$)/,
  ]
  const texto = `${titulo} ${snippet}`
  for (const p of padroes) {
    const m = texto.match(p)
    if (m && m[1]) {
      const cid = m[1].trim()
      if (cid.length > 2 && cid.length < 40) return cid.charAt(0).toUpperCase() + cid.slice(1).toLowerCase()
    }
  }
  return null
}

function extractPeriodo(titulo: string, snippet: string): string | null {
  const padroes = [
    /(\d{4}\.\d)\b/,
    /(\d{4})\/(\d{4})/,
    /semestre\s*(\d{4})\.?(\d?)/i,
    /ano\s*(letivo\s*)?(\d{4})/i,
    /(\d{4})/,
  ]
  const texto = `${titulo} ${snippet}`
  for (const p of padroes) {
    const m = texto.match(p)
    if (m) {
      if (m[1] && m[2] && p.toString().includes('/')) return `${m[1]}/${m[2]}`
      if (m[1] && p.toString().includes('.')) return m[1]
      if (m[2] && p.toString().includes('ano')) return m[2]
      if (m[1] && /^\d{4}$/.test(m[1])) return m[1]
    }
  }
  return null
}

async function collectSerper(): Promise<number> {
  const { data: queries } = await supabase
    .from('search_queries')
    .select('*')
    .eq('ativa', true)

  if (!queries) return 0

  let total = 0
  for (const query of queries) {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query.query_string, hl: 'pt-br' }),
      })

      if (!res.ok) {
        console.error(`Serper API error for ${query.query_string}: ${res.status}`)
        continue
      }

      const data = await res.json()
      const results = data.organic ?? []

      for (const item of results) {
        const snippet = item.snippet ?? ''
        const tipo = detectarTipo(item.title, snippet)
        const { error } = await supabase.from('opportunities').upsert(
          {
            titulo: item.title,
            descricao: snippet,
            link: item.link,
            tipo,
            fonte: 'serper',
            orgao: tipo === 'licitacao' ? extractOrgao(item.title, snippet) : null,
            cidade: tipo === 'licitacao' ? extractCidade(item.title, snippet) : null,
            periodo: extractPeriodo(item.title, snippet),
            data_publicacao: new Date().toISOString(),
          },
          { onConflict: 'link', ignoreDuplicates: true }
        )
        if (!error) total++
      }

      await supabase
        .from('search_queries')
        .update({ ultima_execucao: new Date().toISOString() })
        .eq('id', query.id)
    } catch (err) {
      console.error(`Error collecting ${query.query_string}:`, err)
    }
  }
  return total
}

async function collectRSS(): Promise<number> {
  try {
    const res = await fetch(RSS_URL)
    if (!res.ok) {
      console.error(`RSS fetch error: ${res.status}`)
      return 0
    }

    const xml = await res.text()
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

    let total = 0
    for (const itemXml of items) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? itemXml.match(/<title>(.*?)<\/title>/)?.[1] ?? ''

      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
      const desc = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? itemXml.match(/<description>(.*?)<\/description>/)?.[1] ?? ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''

      if (!link) continue

      const descLimpa = desc.replace(/<[^>]*>/g, '')
      const { error } = await supabase.from('opportunities').upsert(
        {
          titulo: title.replace(/<[^>]*>/g, ''),
          descricao: descLimpa,
          link,
          tipo: detectarTipo(title, desc),
          fonte: 'rss',
          periodo: extractPeriodo(title, descLimpa),
          data_publicacao: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        },
        { onConflict: 'link', ignoreDuplicates: true }
      )
      if (!error) total++
    }
    return total
  } catch (err) {
    console.error('Error collecting RSS:', err)
    return 0
  }
}

Deno.serve(async () => {
  console.log('Starting collection...')

  const serperCount = await collectSerper()
  console.log(`Serper: ${serperCount} new items`)

  const rssCount = await collectRSS()
  console.log(`RSS: ${rssCount} new items`)

  return new Response(
    JSON.stringify({ serper: serperCount, rss: rssCount, total: serperCount + rssCount }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
