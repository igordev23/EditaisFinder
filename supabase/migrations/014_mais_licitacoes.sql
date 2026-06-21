INSERT INTO public.search_queries (query_string, ativa) VALUES
  ('site:piripiri.pi.gov.br licitacao', true),
  ('site:mabus.com.br licitacao Piaui', true),
  ('site:administracaotransparente.com.br licitacao', true),
  ('licitacao prefeitura Oeiras PI 2026', true),
  ('licitacao prefeitura Campo Maior PI', true),
  ('licitacao prefeitura Sao Raimundo Nonato PI', true),
  ('licitacao prefeitura Bom Jesus PI', true),
  ('licitacao prefeitura Esperantina PI', true),
  ('licitacao prefeitura Barras PI', true),
  ('licitacao prefeitura Pedro II PI', true)
ON CONFLICT DO NOTHING;
