-- Coluna data_validade (prazo de validade/inscricao)
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS data_validade TIMESTAMPTZ;

-- Indice para filtrar expiradas
CREATE INDEX IF NOT EXISTS idx_opportunities_data_validade ON public.opportunities(data_validade);

-- RPC com suporte a status_filter e data_validade
CREATE OR REPLACE FUNCTION public.get_opportunities_with_relevance(
  user_id UUID,
  tipo_filter TEXT DEFAULT NULL,
  search_text TEXT DEFAULT NULL,
  periodo_filter TEXT DEFAULT NULL,
  categoria_keywords TEXT[] DEFAULT NULL,
  status_filter TEXT DEFAULT 'todas',
  page_size INTEGER DEFAULT 10,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  descricao TEXT,
  link TEXT,
  tipo TEXT,
  fonte TEXT,
  periodo TEXT,
  orgao TEXT,
  cidade TEXT,
  data_validade TIMESTAMPTZ,
  data_publicacao TIMESTAMPTZ,
  score_relevancia REAL,
  is_favorited BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.titulo,
    o.descricao,
    o.link,
    o.tipo,
    o.fonte,
    o.periodo,
    o.orgao,
    o.cidade,
    o.data_validade,
    o.data_publicacao,
    public.calcular_relevancia(user_id, o.id) AS score_relevancia,
    (EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = $1 AND f.opportunity_id = o.id)) AS is_favorited
  FROM public.opportunities o
  WHERE
    (tipo_filter IS NULL OR o.tipo = tipo_filter)
    AND (search_text IS NULL OR o.titulo ILIKE '%' || search_text || '%' OR o.descricao ILIKE '%' || search_text || '%' OR o.orgao ILIKE '%' || search_text || '%' OR o.cidade ILIKE '%' || search_text || '%')
    AND (periodo_filter IS NULL OR o.periodo = periodo_filter)
    AND (categoria_keywords IS NULL OR o.titulo ILIKE ANY(categoria_keywords) OR o.descricao ILIKE ANY(categoria_keywords) OR o.orgao ILIKE ANY(categoria_keywords) OR o.cidade ILIKE ANY(categoria_keywords))
    AND (status_filter = 'todas' OR (status_filter = 'abertas' AND (o.data_validade IS NULL OR o.data_validade >= now())) OR (status_filter = 'expiradas' AND o.data_validade IS NOT NULL AND o.data_validade < now()))
  ORDER BY
    CASE WHEN status_filter = 'abertas' THEN COALESCE(o.data_validade, '9999-12-31'::timestamptz) END ASC,
    score_relevancia DESC,
    o.data_publicacao DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;
