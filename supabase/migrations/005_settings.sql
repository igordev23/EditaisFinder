-- Migration 005: Configuração de chaves para coleta

-- Tabela de configuração
CREATE TABLE IF NOT EXISTS public.settings (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode ler
CREATE POLICY "Service role pode ler settings"
  ON public.settings FOR SELECT
  USING (true);

-- Inserir chave Serper
INSERT INTO public.settings (chave, valor)
VALUES ('serper_api_key', 'd6a7378ba3c2a53931f8de7a7ee07d47bb866452')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now();

-- Função atualizada que lê do settings
CREATE OR REPLACE FUNCTION public.collect_all()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  q RECORD;
  api_key TEXT;
  request_id BIGINT;
  response_body TEXT;
  result_json JSONB;
  item JSONB;
  titulo TEXT;
  descricao TEXT;
  link TEXT;
  inserted_count INTEGER;
BEGIN
  -- Lê chave da tabela de configuração
  SELECT valor INTO api_key FROM public.settings WHERE chave = 'serper_api_key';

  IF api_key IS NULL OR api_key = '' THEN
    INSERT INTO public.collect_log (fonte, status, erro)
    VALUES ('all', 'error', 'serper_api_key not configured');
    RETURN;
  END IF;

  FOR q IN SELECT * FROM public.search_queries WHERE ativa = true
  LOOP
    inserted_count := 0;

    SELECT net.http_post(
      url := 'https://google.serper.dev/search',
      headers := jsonb_build_object(
        'X-API-KEY', api_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('q', q.query_string, 'hl', 'pt-br')
    ) INTO request_id;

    PERFORM net.wait(request_id, max_seconds := 15);

    SELECT body::text INTO response_body
    FROM net._http_response WHERE id = request_id;

    BEGIN
      result_json := response_body::jsonb;

      FOR item IN SELECT * FROM jsonb_array_elements(result_json->'organic')
      LOOP
        titulo := COALESCE(item->>'title', '');
        descricao := COALESCE(item->>'snippet', '');
        link := COALESCE(item->>'link', '');

        IF link = '' THEN CONTINUE; END IF;

        INSERT INTO public.opportunities (titulo, descricao, link, tipo, fonte, data_publicacao)
        VALUES (titulo, descricao, link, public.detectar_tipo(titulo, descricao), 'serper', now())
        ON CONFLICT (link) DO NOTHING;

        IF FOUND THEN inserted_count := inserted_count + 1; END IF;
      END LOOP;

      INSERT INTO public.collect_log (fonte, status, items_count)
      VALUES (q.query_string, 'success', inserted_count);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.collect_log (fonte, status, erro)
      VALUES (q.query_string, 'error', SQLERRM);
    END;

    UPDATE public.search_queries
    SET ultima_execucao = now()
    WHERE id = q.id;
  END LOOP;
END;
$$;
