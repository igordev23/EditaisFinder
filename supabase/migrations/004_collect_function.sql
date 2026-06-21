-- Migration 004: Coleta automatizada via SQL + pg_net
-- Substitui a Edge Function, evitando deploy externo

-- Função auxiliar para detectar tipo da oportunidade
CREATE OR REPLACE FUNCTION public.detectar_tipo(titulo TEXT, descricao TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  texto TEXT := LOWER(titulo || ' ' || COALESCE(descricao, ''));
BEGIN
  IF texto ~ '(est[áa]gio|trainee|aprendiz)' THEN RETURN 'estagio'; END IF;
  IF texto ~ '(bolsa|pibic|pibiti|fomento)' THEN RETURN 'bolsa'; END IF;
  IF texto ~ '(monit[óo]ria|monitor)' THEN RETURN 'monitoria'; END IF;
  IF texto ~ '(emprego|vaga|contrata[çc][ãa]o|trabalhe conosco)' THEN RETURN 'emprego'; END IF;
  RETURN 'edital';
END;
$$;

-- Tabela para armazenar respostas das requisições HTTP
CREATE TABLE IF NOT EXISTS public.collect_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fonte TEXT NOT NULL,
  status TEXT NOT NULL,
  items_count INTEGER DEFAULT 0,
  erro TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- Função principal de coleta
CREATE OR REPLACE FUNCTION public.collect_from_serper(query_text TEXT, api_key TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id BIGINT;
  response_status INTEGER;
  response_body TEXT;
  result_json JSONB;
  item JSONB;
  titulo TEXT;
  descricao TEXT;
  link TEXT;
  tipo_oportunidade TEXT;
  inserted_count INTEGER := 0;
BEGIN
  -- Faz requisição à Serper API
  SELECT net.http_post(
    url := 'https://google.serper.dev/search',
    headers := jsonb_build_object(
      'X-API-KEY', api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('q', query_text, 'hl', 'pt-br')
  ) INTO request_id;

  -- Aguarda e obtém resultado
  PERFORM net.wait(request_id, max_seconds := 15);
  SELECT status, body::text INTO response_status, response_body
  FROM net._http_response WHERE id = request_id;

  IF response_status != 200 THEN
    INSERT INTO public.collect_log (fonte, status, erro)
    VALUES ('serper', 'error', 'HTTP ' || response_status || ': ' || response_body);
    RETURN;
  END IF;

  result_json := response_body::jsonb;

  -- Processa resultados orgânicos
  FOR item IN SELECT * FROM jsonb_array_elements(result_json->'organic')
  LOOP
    titulo := COALESCE(item->>'title', '');
    descricao := COALESCE(item->>'snippet', '');
    link := COALESCE(item->>'link', '');
    tipo_oportunidade := public.detectar_tipo(titulo, descricao);

    IF link = '' THEN CONTINUE; END IF;

    BEGIN
      INSERT INTO public.opportunities (titulo, descricao, link, tipo, fonte, data_publicacao)
      VALUES (titulo, descricao, link, tipo_oportunidade, 'serper', now())
      ON CONFLICT (link) DO NOTHING;

      IF FOUND THEN
        inserted_count := inserted_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignora erros individuais
    END;
  END LOOP;

  INSERT INTO public.collect_log (fonte, status, items_count)
  VALUES ('serper', 'success', inserted_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.collect_all()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  q RECORD;
  api_key TEXT;
BEGIN
  api_key := current_setting('app.serper_api_key', true);

  IF api_key IS NULL OR api_key = '' THEN
    INSERT INTO public.collect_log (fonte, status, erro)
    VALUES ('all', 'error', 'SERPER_API_KEY not configured');
    RETURN;
  END IF;

  FOR q IN SELECT * FROM public.search_queries WHERE ativa = true
  LOOP
    PERFORM public.collect_from_serper(q.query_string, api_key);

    UPDATE public.search_queries
    SET ultima_execucao = now()
    WHERE id = q.id;
  END LOOP;
END;
$$;
