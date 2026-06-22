-- Migration 019: Trigger para classificar como 'licitacao' qualquer item que parecer licitação

CREATE OR REPLACE FUNCTION public.reclassificar_licitacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    NEW.titulo ILIKE '%licita%'
    OR NEW.titulo ILIKE '%preg%'
    OR NEW.titulo ILIKE '%concorr%'
    OR NEW.titulo ILIKE '%prefeitura%'
    OR NEW.titulo ILIKE '%municipio%'
    OR NEW.titulo ILIKE '%camara municipal%'
    OR NEW.descricao ILIKE '%licita%'
    OR NEW.descricao ILIKE '%preg%'
    OR NEW.descricao ILIKE '%concorr%'
    OR NEW.descricao ILIKE '%prefeitura%'
    OR NEW.descricao ILIKE '%municipio%'
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
WHERE (
    titulo ILIKE '%licita%'
    OR titulo ILIKE '%preg%'
    OR titulo ILIKE '%concorr%'
    OR titulo ILIKE '%prefeitura%'
    OR titulo ILIKE '%municipio%'
    OR titulo ILIKE '%camara municipal%'
    OR descricao ILIKE '%licita%'
    OR descricao ILIKE '%preg%'
    OR descricao ILIKE '%concorr%'
    OR descricao ILIKE '%prefeitura%'
    OR descricao ILIKE '%municipio%'
  );
