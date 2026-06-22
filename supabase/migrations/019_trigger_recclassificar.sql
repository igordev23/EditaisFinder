-- Migration 019: Trigger para classificar como 'licitacao' qualquer item que parecer licitação

CREATE OR REPLACE FUNCTION public.reclassificar_licitacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    lower(NEW.titulo) ~ 'licita|preg|concorr|prefeitura|municipio|camara|aquisição|aquisicao|fornecimento|dispensa'
    OR lower(coalesce(NEW.descricao,'')) ~ 'licita|preg|concorr|prefeitura|municipio|aquisição|aquisicao|fornecimento|dispensa'
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

UPDATE public.opportunities
SET tipo = 'licitacao'
WHERE lower(titulo) ~ 'licita|preg|concorr|prefeitura|municipio|aquisição|aquisicao|fornecimento|dispensa'
   OR lower(coalesce(descricao,'')) ~ 'licita|preg|concorr|prefeitura|municipio|aquisição|aquisicao|fornecimento|dispensa';
