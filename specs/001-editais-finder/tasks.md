# Tasks: EditaisFinder - Rastreador de Oportunidades

**Input**: Design documents from `specs/001-editais-finder/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto e estrutura base

- [ ] T001 Inicializar projeto React + TypeScript + Vite em `app/`
- [ ] T002 Configurar Tailwind CSS, ESLint, Prettier em `app/`
- [ ] T003 [P] Criar projeto Supabase com `supabase init`
- [ ] T004 [P] Configurar variáveis de ambiente em `.env.example`

---

## Phase 2: Database & Auth Foundation (Blocking Prerequisites)

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase

- [ ] T005 Criar migration `001_schema.sql` com tabelas: `profiles`, `opportunities`, `search_queries`, `user_interests`, `favorites`
- [ ] T006 [P] Configurar Supabase Auth (magic link + email/senha)
- [ ] T007 [P] Criar migration `002_rls_policies.sql` com políticas RLS para todas as tabelas
- [ ] T008 Criar cliente Supabase em `app/src/services/supabase.ts`
- [ ] T009 [P] Configurar tipos TypeScript em `app/src/types/supabase.ts`
- [ ] T010 Configurar React Router com rotas base (Home, Login, Profile, Admin)

**Checkpoint**: Foundation ready

---

## Phase 3: User Story 1 - Visualizar Oportunidades (Priority: P1) 🎯 MVP

**Goal**: Aluno vê lista de oportunidades ordenadas por data

**Independent Test**: Abrir página Home e ver cards de oportunidades carregados do Supabase

### Implementation for User Story 1

- [ ] T011 [US1] Criar componente `OpportunityCard` em `app/src/components/opportunities/OpportunityCard.tsx`
- [ ] T012 [US1] Criar página `Home` em `app/src/pages/Home.tsx` com listagem
- [ ] T013 [US1] Criar hook `useOpportunities` em `app/src/hooks/useOpportunities.ts`
- [ ] T014 [US1] Implementar loading state (skeleton/spinner)
- [ ] T015 [US1] Implementar empty state ("Nenhuma oportunidade encontrada")
- [ ] T016 [US1] Implementar error state (falha de conexão, erro do Supabase)

**Checkpoint**: User Story 1 funcional — aluno vê oportunidades

---

## Phase 4: User Story 2 - Cadastro e Perfil do Aluno (Priority: P1)

**Goal**: Aluno cria perfil com curso, período e interesses

**Independent Test**: Aluno logado edita perfil e mudanças persistem

### Implementation for User Story 2

- [ ] T017 [US2] Criar página `Login` com formulário de autenticação em `app/src/pages/Login.tsx`
- [ ] T018 [US2] Criar hook `useAuth` em `app/src/hooks/useAuth.ts`
- [ ] T019 [US2] Criar página `Profile` com formulário de cadastro em `app/src/pages/Profile.tsx`
- [ ] T020 [US2] Implementar salvamento de perfil (curso, período, áreas de interesse)
- [ ] T021 [US2] Criar componente `ProtectedRoute` para rotas autenticadas

**Checkpoint**: User Stories 1 e 2 funcionais

---

## Phase 5: User Story 3 - Filtros e Busca (Priority: P2)

**Goal**: Aluno filtra oportunidades por tipo, localidade, data e palavra-chave

**Independent Test**: Selecionar filtro "estágio" e ver apenas estágios

### Implementation for User Story 3

- [ ] T022 [P] [US3] Criar componente `FilterBar` em `app/src/components/opportunities/FilterBar.tsx`
- [ ] T023 [P] [US3] Criar componente `SearchInput` em `app/src/components/ui/SearchInput.tsx`
- [ ] T024 [US3] Implementar filtros por tipo, localidade e data
- [ ] T025 [US3] Implementar busca full-text via Supabase query
- [ ] T026 [US3] Adicionar paginação ou infinite scroll

---

## Phase 6: User Story 4 - Coleta Automatizada (Priority: P2)

**Goal**: Edge Function coleta oportunidades automaticamente

**Independent Test**: Executar Edge Function e ver novos registros no banco

### Implementation for User Story 4

- [ ] T027 [P] [US4] Criar Edge Function `collect-opportunities` em `supabase/functions/collect-opportunities/index.ts`
- [ ] T028 [P] [US4] Implementar integração com Serper API (buscas parametrizadas)
- [ ] T029 [P] [US4] Implementar parser RSS do IFPI com feedparser
- [ ] T030 [US4] Implementar lógica de deduplicação (índice único no link)
- [ ] T031 [US4] Configurar agendamento pg_cron (06:00 diário)
- [ ] T032 [US4] Criar tabela `search_queries` e seed com queries padrão

---

## Phase 7: User Story 5 - Classificação Inteligente (Priority: P3)

**Goal**: Oportunidades ordenadas por relevância baseada no perfil do aluno

**Independent Test**: Aluno com interesses vê ordem diferente de aluno sem interesses

### Implementation for User Story 5

- [ ] T033 [US5] Implementar Edge Function `classify-relevance` com algoritmo TF-IDF
- [ ] T034 [US5] Criar fallback por contagem de palavras-chave
- [ ] T035 [US5] Integrar score de relevância na query de listagem
- [ ] T036 [US5] Implementar feedback do aluno (botões relevante/não relevante)

---

## Phase 8: User Story 6 - Cadastro Manual (Priority: P3)

**Goal**: Professores cadastram oportunidades manualmente

**Independent Test**: Professor logado cadastra vaga e ela aparece na lista

### Implementation for User Story 6

- [ ] T037 [US6] Criar página `Admin` com formulário de cadastro em `app/src/pages/Admin.tsx`
- [ ] T038 [US6] Implementar validação de URL e dados do formulário
- [ ] T039 [US6] Implementar role-based access (admin/professor vs aluno)

---

## Phase 9: User Story 7 - Notificações (Priority: P3)

**Goal**: Alunos recebem e-mail diário com novas oportunidades

**Independent Test**: Executar Edge Function e verificar e-mail recebido

### Implementation for User Story 7

- [ ] T040 [US7] Criar Edge Function `send-digest` em `supabase/functions/send-digest/index.ts`
- [ ] T041 [US7] Integrar com Resend SDK para envio de e-mails
- [ ] T042 [US7] Configurar template de e-mail com novas oportunidades
- [ ] T043 [US7] Agendar execução via pg_cron

---

## Phase 10: User Story 8 - Favoritos e Compartilhamento (Priority: P3)

**Goal**: Aluno salva favoritos e compartilha links

**Independent Test**: Aluno favorita vaga e ela aparece na aba "Favoritos"

### Implementation for User Story 8

- [ ] T044 [P] [US8] Criar tabela `favorites` (já inclusa na migration)
- [ ] T045 [US8] Implementar toggle favorito no `OpportunityCard`
- [ ] T046 [US8] Criar página `Favorites` em `app/src/pages/Favorites.tsx`
- [ ] T047 [US8] Implementar geração de link compartilhável

---

## Implementation Strategy

### MVP First (User Stories 1-2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Visualizar oportunidades)
4. Complete Phase 4: User Story 2 (Perfil do aluno)
5. **STOP and VALIDATE**: MVP funcional!
6. Deploy frontend

---

## Phase 11: Licitações para Empresas

**Purpose**: Expandir sistema para empresas com licitações públicas

- [x] T048 [P] Adicionar tipo `licitacao` ao CHECK de opportunities (migration 010)
- [x] T049 [P] Adicionar colunas `orgao` e `cidade` na tabela opportunities
- [x] T050 [P] Atualizar tipos TypeScript com `OpportunityTipo` e novos campos
- [x] T051 [P] Atualizar Edge Function `collect-opportunities` com detecção de licitações (keywords, extração de orgao/cidade)
- [x] T052 [P] Adicionar search queries para licitações no seed.sql
- [x] T053 Criar página `Licitacoes.tsx` com filtros por cidade e busca por órgão
- [x] T054 [P] Adicionar abas de navegação (Oportunidades / Licitações) no App.tsx
- [x] T055 [P] Deployar Edge Function atualizada
- [x] T056 [P] Aplicar migration 010 no Supabase
- [x] T057 Atualizar spec.md com US9 (Licitações para Empresas)
- [x] T058 Atualizar plan.md com Phase 11
- [x] T059 Atualizar constitution.md com escopo de empresas

**Checkpoint**: Sistema com licitações funcionando

---

## Phase 12: Filtro de Período Letivo

**Purpose**: Melhorar filtros com período letivo nas oportunidades

- [x] T060 [P] Adicionar coluna `periodo` na tabela opportunities (migration 012)
- [x] T061 [P] Atualizar Edge Function `collect-opportunities` com extração de período
- [x] T062 [P] Atualizar RPC `get_opportunities_with_relevance` com suporte a periodo_filter
- [x] T063 [P] Adicionar filtro de período na página Home
- [x] T064 Exibir badge de período nos cards de oportunidade
- [x] T065 Atualizar spec com critérios de aceitação para filtro de período

**Checkpoint**: Filtro de período letivo funcionando

### Incremental Delivery

1. Setup + Foundation → Base pronta
2. US1 + US2 → Deploy MVP
3. US3 + US4 → Filtros e coleta automática
4. US5 + US6 → Classificação e cadastro manual
5. US7 + US8 → Notificações e favoritos
6. US9 → Licitações para empresas

---

## Phase 13: Cobertura Total de Licitações por Cidade

**Purpose**: Garantir que licitações de todas as 224 cidades do Piauí sejam coletadas automaticamente

- [x] T066 [P] Edge Function: consultar IBGE API para listar municípios do PI
- [x] T067 [P] Edge Function: descobrir cidades sem dados na tabela opportunities
- [x] T068 [P] Edge Function: buscar 8 cidades por execução (rotação aleatória)
- [x] T069 Update spec.md com FR-014 (IBGE API no filtro) e FR-015 (coleta progressiva)
- [x] T070 Update plan.md com coleta progressiva por cidade
- [x] T071 Update README.md com cobertura completa
- [x] T072 Deployar Edge Function atualizada
- [x] T073 Test: 86 licitações de 26 cidades após primeira execução

**Checkpoint**: Todas as 224 cidades do PI cobertas em ~14 dias

---

## Phase 14: Busca Reforçada com Debounce e Mais Campos

**Purpose**: Melhorar a busca em oportunidades e licitações com debounce, botão de refinar e mais campos pesquisáveis

- [ ] T074 [P] Atualizar RPC `get_opportunities_with_relevance`: adicionar `orgao` e `cidade` na cláusula WHERE ILIKE
- [ ] T075 [P] Adicionar botão de busca (🔍) no SearchInput
- [ ] T076 [P] Implementar debounce de 300ms na Home (search → debouncedSearch)
- [ ] T077 [P] Implementar debounce de 300ms no Licitacoes
- [ ] T078 [P] Adicionar `orgao` e `cidade` na busca ILIKE da Home (modo anônimo)
- [ ] T079 [P] Adicionar `cidade` na busca ILIKE do Licitacoes
- [ ] T080 [P] Criar migration 015_search_improved.sql
- [ ] T081 [P] Aplicar migration 015 no Supabase
- [ ] T082 Atualizar spec.md com FR-016 (debounce/refinar) e FR-017 (busca em 4 campos)
- [ ] T083 Test: busca por "computador" encontra licitações e oportunidades em todos os campos

**Checkpoint**: Busca mais rápida e precisa em ambas as páginas

---

## Phase 15: Filtro por Categoria (Chips)

**Purpose**: Adicionar filtros visuais por categoria nas páginas de Oportunidades e Licitações

- [ ] T084 [P] Criar tipo `Categoria` e constantes `CATEGORIAS_LICITACOES` e `CATEGORIAS_OPORTUNIDADES`
- [ ] T085 [P] Criar componente `CategoryChips` com pills clicáveis
- [ ] T086 [P] Atualizar RPC `get_opportunities_with_relevance`: parâmetro `categoria_keywords TEXT[]` com ILIKE ANY
- [ ] T087 [P] Migration 016: novo RPC + search_queries por categoria
- [ ] T088 [P] Adicionar CategoryChips na Home (Oportunidades)
- [ ] T089 [P] Adicionar CategoryChips no Licitacoes
- [ ] T090 [P] Search_queries: 6 categorias licitações + 5 categorias oportunidades
- [ ] T091 Atualizar spec.md com FR-018 (filtro por categoria)
- [ ] T092 Atualizar docs (plan, README)

**Checkpoint**: Filtro visual por categoria funcionando em ambas as páginas
