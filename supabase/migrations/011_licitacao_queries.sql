INSERT INTO public.search_queries (query_string, ativa) VALUES
  ('licitacao prefeitura Piaui 2026', true),
  ('pregao eletronico Teresina', true),
  ('concorrencia publica municipio Piaui', true),
  ('tomada de precos prefeitura Piaui', true)
ON CONFLICT DO NOTHING;
