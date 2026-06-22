-- Migration 018: Reclassificar itens de licitação que foram classificados como 'edital'
-- O detectarTipo() checava 'edital' antes de 'licitacao', fazendo itens com
-- "edital" + "pregão"/"licitação" serem classificados como edital em vez de licitacao.

UPDATE public.opportunities
SET tipo = 'licitacao'
WHERE tipo = 'edital'
  AND (
    titulo ILIKE '%licita%'
    OR titulo ILIKE '%pregão%'
    OR titulo ILIKE '%pregao%'
    OR titulo ILIKE '%concorrência%'
    OR titulo ILIKE '%concorrencia%'
    OR titulo ILIKE '%tomada de preço%'
    OR titulo ILIKE '%prefeitura%'
    OR descricao ILIKE '%licita%'
    OR descricao ILIKE '%pregão%'
    OR descricao ILIKE '%pregao%'
    OR descricao ILIKE '%concorrência%'
    OR descricao ILIKE '%concorrencia%'
    OR descricao ILIKE '%tomada de preço%'
  );
