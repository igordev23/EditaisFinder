-- Atualiza agendamento para chamar Edge Function
SELECT cron.unschedule('collect-opportunities-daily');

SELECT cron.schedule(
  'collect-opportunities-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://gtwcqggageryffzfdivv.functions.supabase.co/collect-opportunities',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
