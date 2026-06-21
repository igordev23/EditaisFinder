-- Migration 002: Políticas de Row Level Security (RLS)
-- Habilita segurança a nível de linha em todas as tabelas

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários inserem seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários atualizam seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Opportunities (leitura pública, escrita apenas admin/professor)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler oportunidades"
  ON public.opportunities FOR SELECT
  USING (true);

CREATE POLICY "Apenas admin/professor podem inserir"
  ON public.opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'professor')
    )
  );

CREATE POLICY "Apenas admin/professor podem atualizar"
  ON public.opportunities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'professor')
    )
  );

CREATE POLICY "Apenas admin pode deletar"
  ON public.opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User interests
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus próprios interesses"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam seus próprios interesses"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios interesses"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus próprios favoritos"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam seus próprios favoritos"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios favoritos"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Relevance feedback
ALTER TABLE public.relevance_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seu próprio feedback"
  ON public.relevance_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem seu próprio feedback"
  ON public.relevance_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
