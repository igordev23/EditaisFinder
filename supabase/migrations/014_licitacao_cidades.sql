INSERT INTO public.search_queries (query_string, ativa) VALUES
  ('licitacao prefeitura Piripiri PI', true),
  ('pregao eletronico Piripiri', true),
  ('edital licitacao Piripiri Piaui', true),
  ('licitacao prefeitura Teresina 2026', true),
  ('licitacao prefeitura Parnaiba', true),
  ('licitacao prefeitura Picos', true),
  ('licitacao prefeitura Floriano', true)
ON CONFLICT DO NOTHING;
