export interface Categoria {
  id: string
  label: string
  keywords: string[]
}

export const CATEGORIAS_LICITACOES: Categoria[] = [
  { id: 'informatica', label: 'Informática', keywords: ['computador', 'informatica', 'software', 'digital', 'ti'] },
  { id: 'obras', label: 'Obras', keywords: ['obra', 'construcao', 'reforma', 'pavimentacao'] },
  { id: 'veiculos', label: 'Veículos', keywords: ['veiculo', 'transporte', 'frota', 'automotivo'] },
  { id: 'saude', label: 'Saúde', keywords: ['saude', 'medico', 'hospital', 'farmacia'] },
  { id: 'educacao', label: 'Educação', keywords: ['educacao', 'escola', 'merenda', 'ensino'] },
  { id: 'servicos', label: 'Serviços', keywords: ['servico', 'prestacao', 'contratacao'] },
]

export const CATEGORIAS_OPORTUNIDADES: Categoria[] = [
  { id: 'ti', label: 'Tecnologia', keywords: ['programacao', 'desenvolvimento', 'software', 'computador', 'ti', 'informatica'] },
  { id: 'admin', label: 'Administrativo', keywords: ['administrativo', 'financeiro', 'contabil', 'rh', 'secretaria'] },
  { id: 'saude', label: 'Saúde', keywords: ['enfermagem', 'medico', 'saude', 'hospital', 'farmacia'] },
  { id: 'educacao', label: 'Educação', keywords: ['educacao', 'pedagogia', 'ensino', 'professor', 'monitoria'] },
  { id: 'engenharia', label: 'Engenharia', keywords: ['engenharia', 'obra', 'construcao', 'projeto'] },
]

export function formatCategoriaKeywords(categorias: Categoria[], selectedIds: string[]): string[] | null {
  const ids = new Set(selectedIds)
  const keywords = categorias
    .filter((c) => ids.has(c.id))
    .flatMap((c) => c.keywords.map((k) => `%${k}%`))
  return keywords.length > 0 ? keywords : null
}
