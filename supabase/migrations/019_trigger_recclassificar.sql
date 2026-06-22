-- Migration 019: Trigger para classificar como 'licitacao' qualquer item que parecer licitação
-- Corrige classificacao incorreta vinda do detectarTipo() da Edge Function

CREATE OR REPLACE FUNCTION public.reclassificar_licitacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    NEW.titulo ILIKE '%licita%'
    OR NEW.titulo ILIKE '%pregão%'
    OR NEW.titulo ILIKE '%pregao%'
    OR NEW.titulo ILIKE '%concorrência%'
    OR NEW.titulo ILIKE '%concorrencia%'
    OR NEW.titulo ILIKE '%prefeitura%'
    OR NEW.descricao ILIKE '%licita%'
    OR NEW.descricao ILIKE '%pregão%'
    OR NEW.descricao ILIKE '%pregao%'
    OR NEW.descricao ILIKE '%concorrência%'
    OR NEW.descricao ILIKE '%concorrencia%'
  ) THEN
    NEW.tipo := 'licitacao';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reclassificar_licitacao ON public.opportunities;

CREATE TRIGGER trg_reclassificar_licitacao
  BEFORE INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.reclassificar_licitacao();

-- Reclassificar itens existentes (qualquer tipo que parecer licitação)
UPDATE public.opportunities
SET tipo = 'licitacao'
WHERE (
    titulo ILIKE '%licita%'
    OR titulo ILIKE '%pregão%'
    OR titulo ILIKE '%pregao%'
    OR titulo ILIKE '%concorrência%'
    OR titulo ILIKE '%concorrencia%'
    OR titulo ILIKE '%prefeitura%'
    OR descricao ILIKE '%licita%'
    OR descricao ILIKE '%pregão%'
    OR descricao ILIKE '%pregao%'
    OR descricao ILIKE '%concorrência%'
    OR descricao ILIKE '%concorrencia%'
  );
