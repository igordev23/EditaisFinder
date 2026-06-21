-- Migration 010: Adiciona suporte a licitações (para empresas)

ALTER TABLE public.opportunities DROP CONSTRAINT opportunities_tipo_check;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_tipo_check
  CHECK (tipo IN ('estagio', 'bolsa', 'monitoria', 'emprego', 'edital', 'licitacao'));

ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS orgao TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS cidade TEXT;

CREATE INDEX IF NOT EXISTS idx_opportunities_cidade ON public.opportunities(cidade);
CREATE INDEX IF NOT EXISTS idx_opportunities_orgao ON public.opportunities(orgao);
