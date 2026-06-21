-- Migration 007: Classificação de relevância por palavras-chave

-- Função que calcula score de relevância para um usuário
CREATE OR REPLACE FUNCTION public.calcular_relevancia(user_id UUID, opp_id UUID)
RETURNS REAL
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  score REAL := 0;
  palavra TEXT;
  texto_oportunidade TEXT;
BEGIN
  -- Pega o texto da oportunidade
  SELECT LOWER(COALESCE(titulo, '') || ' ' || COALESCE(descricao, ''))
  INTO texto_oportunidade
  FROM public.opportunities WHERE id = opp_id;

  IF texto_oportunidade IS NULL THEN RETURN 0; END IF;

  -- Para cada interesse do aluno, conta ocorrências no texto
  FOR palavra IN
    SELECT LOWER(palavra_chave) FROM public.user_interests WHERE user_id = $1
  LOOP
    score := score + (
      (LENGTH(texto_oportunidade) - LENGTH(REPLACE(texto_oportunidade, palavra, ''))) 
      / LENGTH(palavra)
    );
  END LOOP;

  RETURN score;
END;
$$;

-- Função que retorna oportunidades com score de relevância
CREATE OR REPLACE FUNCTION public.get_opportunities_with_relevance(
  user_id UUID,
  tipo_filter TEXT DEFAULT NULL,
  search_text TEXT DEFAULT NULL,
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
    o.data_publicacao,
    public.calcular_relevancia(user_id, o.id) AS score_relevancia,
    (EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = $1 AND f.opportunity_id = o.id)) AS is_favorited
  FROM public.opportunities o
  WHERE
    (tipo_filter IS NULL OR o.tipo = tipo_filter)
    AND (search_text IS NULL OR o.titulo ILIKE '%' || search_text || '%' OR o.descricao ILIKE '%' || search_text || '%')
  ORDER BY score_relevancia DESC, o.data_publicacao DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$;
