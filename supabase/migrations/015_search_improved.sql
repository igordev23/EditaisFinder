-- Busca em orgao e cidade alem de titulo/descricao
CREATE OR REPLACE FUNCTION public.get_opportunities_with_relevance(
  user_id UUID,
  tipo_filter TEXT DEFAULT NULL,
  search_text TEXT DEFAULT NULL,
  periodo_filter TEXT DEFAULT NULL,
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
    o.data_publicacao,
    public.calcular_relevancia(user_id, o.id) AS score_relevancia,
    (EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = $1 AND f.opportunity_id = o.id)) AS is_favorited
  FROM public.opportunities o
  WHERE
    (tipo_filter IS NULL OR o.tipo = tipo_filter)
    AND (search_text IS NULL OR o.titulo ILIKE '%' || search_text || '%' OR o.descricao ILIKE '%' || search_text || '%' OR o.orgao ILIKE '%' || search_text || '%' OR o.cidade ILIKE '%' || search_text || '%')
    AND (periodo_filter IS NULL OR o.periodo = periodo_filter)
  ORDER BY score_relevancia DESC, o.data_publicacao DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;
