-- Migration 003: Agendamento da coleta automatizada via pg_cron
-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que chama a Edge Function collect-opportunities
CREATE OR REPLACE FUNCTION public.schedule_collect_opportunities()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := current_setting('supabase_functions_url') || '/collect-opportunities',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('supabase_anon_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
END;
$$;

-- Agenda execução diária às 06:00
SELECT cron.schedule(
  'collect-opportunities-daily',
  '0 6 * * *',
  $$SELECT public.schedule_collect_opportunities()$$
);
