export interface Profile {
  id: string
  nome: string
  curso: string
  periodo: number
  areas_interesse: string[]
  role: 'aluno' | 'professor' | 'admin'
  created_at: string
  updated_at: string
}

export type OpportunityTipo = 'estagio' | 'bolsa' | 'monitoria' | 'emprego' | 'edital' | 'licitacao'

export interface Opportunity {
  id: string
  titulo: string
  descricao: string | null
  link: string
  tipo: OpportunityTipo
  fonte: 'serper' | 'rss' | 'manual'
  orgao: string | null
  cidade: string | null
  periodo: string | null
  data_validade: string | null
  data_publicacao: string
  score_relevancia: number
  created_at: string
}

export interface SearchQuery {
  id: string
  query_string: string
  ativa: boolean
  ultima_execucao: string | null
  created_at: string
}

export interface UserInterest {
  id: string
  user_id: string
  palavra_chave: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  opportunity_id: string
  created_at: string
}

export interface RelevanceFeedback {
  id: string
  user_id: string
  opportunity_id: string
  relevante: boolean
  created_at: string
}
