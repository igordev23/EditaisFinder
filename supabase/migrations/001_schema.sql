-- Migration 001: Schema inicial do EditaisFinder
-- Cria todas as tabelas do sistema

-- 1. Profiles (perfil do aluno, estendendo auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  curso TEXT NOT NULL,
  periodo INTEGER NOT NULL,
  areas_interesse TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'aluno' CHECK (role IN ('aluno', 'professor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Search queries (consultas para coleta automatizada)
CREATE TABLE public.search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_string TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  ultima_execucao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Opportunities (oportunidades)
CREATE TABLE public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('estagio', 'bolsa', 'monitoria', 'emprego', 'edital')),
  fonte TEXT NOT NULL CHECK (fonte IN ('serper', 'rss', 'manual')),
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  score_relevancia REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_opportunities_tipo ON public.opportunities(tipo);
CREATE INDEX idx_opportunities_data ON public.opportunities(data_publicacao DESC);
CREATE INDEX idx_opportunities_fonte ON public.opportunities(fonte);
CREATE INDEX idx_opportunities_busca ON public.opportunities USING GIN(
  to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, ''))
);

-- 4. User interests (interesses do aluno)
CREATE TABLE public.user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  palavra_chave TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, palavra_chave)
);

-- 5. Favorites (favoritos)
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- 6. Relevance feedback (feedback do aluno)
CREATE TABLE public.relevance_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  relevante BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
