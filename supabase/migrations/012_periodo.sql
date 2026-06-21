ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS periodo TEXT;

CREATE INDEX IF NOT EXISTS idx_opportunities_periodo ON public.opportunities(periodo);
