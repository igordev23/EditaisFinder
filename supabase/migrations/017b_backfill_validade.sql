DO $$
DECLARE
  r RECORD;
  d TEXT;
  parts TEXT[];
  ts TIMESTAMPTZ;
BEGIN
  FOR r IN SELECT id, lower(coalesce(titulo,'') || ' ' || coalesce(descricao,'')) AS texto
           FROM public.opportunities
           WHERE data_validade IS NULL
  LOOP
    SELECT (regexp_matches(r.texto, '(?:ate|prazo|data.?limite|encerramento|validade|inscricoes?|inscricao):?\s*(\d{2})/(\d{2})/(\d{4})', 'i'))[1] INTO d;
    IF d IS NOT NULL THEN
      parts := regexp_match(d, '(\d{2})/(\d{2})/(\d{4})');
      IF array_length(parts, 1) = 3 THEN
        BEGIN
          ts := to_timestamp(parts[1] || '/' || parts[2] || '/' || parts[3], 'DD/MM/YYYY');
          UPDATE public.opportunities SET data_validade = ts WHERE id = r.id;
        EXCEPTION WHEN OTHERS THEN END;
      END IF;
    END IF;
  END LOOP;
END $$;
