-- Seed: Dados de exemplo para desenvolvimento

-- Search queries padrão
INSERT INTO public.search_queries (query_string, ativa) VALUES
  ('estágio Piauí 2026', true),
  ('vaga emprego Piripiri', true),
  ('edital bolsa IFPI', true),
  ('monitoria IFPI 2026', true),
  ('oportunidade estágio Teresina', true);

-- Oportunidades de exemplo
INSERT INTO public.opportunities (titulo, descricao, link, tipo, fonte, data_publicacao) VALUES
  (
    'Processo Seletivo para Estágio - IFPI Campus Piripiri',
    'Abertura de processo seletivo para estagiários do IFPI Campus Piripiri. Vagas para diversos cursos.',
    'https://ifpi.edu.br/estagio-piripiri-2026',
    'estagio',
    'manual',
    '2026-06-20T10:00:00Z'
  ),
  (
    'Bolsa de Iniciação Científica PIBIC 2026',
    'Programa Institucional de Bolsas de Iniciação Científica. Inscrições abertas para alunos do IFPI.',
    'https://ifpi.edu.br/pibic-2026',
    'bolsa',
    'rss',
    '2026-06-19T08:00:00Z'
  ),
  (
    'Edital de Monitoria 2026.1',
    'Edital para seleção de monitores para o semestre 2026.1. Vagas para disciplinas de exatas e humanas.',
    'https://ifpi.edu.br/monitoria-2026-1',
    'monitoria',
    'manual',
    '2026-06-18T14:00:00Z'
  );
