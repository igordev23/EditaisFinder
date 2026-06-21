-- Migration 009: Agendar digest diário (08:00)

SELECT cron.schedule(
  'send-digest-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://gtwcqggageryffzfdivv.functions.supabase.co/send-digest',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json'
    )
  ) AS request_id;
  $$
);
