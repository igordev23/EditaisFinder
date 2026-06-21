-- Migration 008: Notificações por e-mail (digest_log)

CREATE TABLE IF NOT EXISTS public.digest_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ultimo_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_oportunidades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_digest_log_user ON public.digest_log(user_id);

ALTER TABLE public.digest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprio log"
  ON public.digest_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Edge Function pode inserir/atualizar"
  ON public.digest_log FOR ALL
  USING (true)
  WITH CHECK (true);
