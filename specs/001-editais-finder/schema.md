# Database Schema: EditaisFinder

**Branch**: `001-editais-finder` | **Date**: 2026-06-21 | **Spec**: `specs/001-editais-finder/spec.md`

## Visão Geral

Banco PostgreSQL no Supabase com suporte a Full-Text Search (GIN), Row Level Security (RLS) e agendamento via pg_cron.

---

## Tabelas

### `public.profiles`

Perfil do usuário, estendendo `auth.users` do Supabase.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, FK → `auth.users(id)` ON DELETE CASCADE | ID do usuário |
| `nome` | `TEXT` | NOT NULL | Nome completo |
| `curso` | `TEXT` | NOT NULL | Curso do aluno |
| `periodo` | `INTEGER` | NOT NULL | Período letivo atual |
| `areas_interesse` | `TEXT[]` | DEFAULT `'{}'` | Áreas de interesse |
| `role` | `TEXT` | CHECK (`aluno`, `professor`, `admin`), DEFAULT `'aluno'` | Papel no sistema |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de atualização |

**RLS**: Usuário vê apenas seu próprio perfil.

---

### `public.opportunities`

Oportunidades (estágios, bolsas, monitorias, empregos, editais, licitações).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `titulo` | `TEXT` | NOT NULL | Título da oportunidade |
| `descricao` | `TEXT` | | Descrição detalhada |
| `link` | `TEXT` | NOT NULL, UNIQUE | Link externo |
| `tipo` | `TEXT` | NOT NULL, CHECK (`estagio`, `bolsa`, `monitoria`, `emprego`, `edital`, `licitacao`) | Tipo de oportunidade |
| `fonte` | `TEXT` | NOT NULL, CHECK (`serper`, `rss`, `manual`) | Fonte de origem |
| `periodo` | `TEXT` | | Período letivo associado |
| `orgao` | `TEXT` | | Órgão público (licitações) |
| `cidade` | `TEXT` | | Cidade (licitações) |
| `data_validade` | `TIMESTAMPTZ` | | Prazo de validade/inscrição |
| `data_publicacao` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Data de publicação |
| `score_relevancia` | `REAL` | DEFAULT `0` | Score de relevância |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |

**Índices**:
- `idx_opportunities_tipo` ON `tipo`
- `idx_opportunities_data` ON `data_publicacao DESC`
- `idx_opportunities_fonte` ON `fonte`
- `idx_opportunities_busca` GIN ON `to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, ''))`
- `idx_opportunities_cidade` ON `cidade`
- `idx_opportunities_orgao` ON `orgao`
- `idx_opportunities_periodo` ON `periodo`
- `idx_opportunities_data_validade` ON `data_validade`

**RLS**: Leitura pública. Inserção/atualização apenas admin/professor. Deleção apenas admin.

---

### `public.search_queries`

Consultas para coleta automatizada via Serper API.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `query_string` | `TEXT` | NOT NULL | String de busca |
| `ativa` | `BOOLEAN` | DEFAULT `true` | Se a query está ativa |
| `ultima_execucao` | `TIMESTAMPTZ` | | Última execução |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |

---

### `public.user_interests`

Palavras-chave de interesse do aluno para classificação de relevância.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | ID do usuário |
| `palavra_chave` | `TEXT` | NOT NULL | Palavra-chave |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |

**Unique**: `(user_id, palavra_chave)`

**RLS**: Usuário vê/gerencia apenas seus próprios interesses.

---

### `public.favorites`

Oportunidades favoritadas pelo usuário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | ID do usuário |
| `opportunity_id` | `UUID` | NOT NULL, FK → `opportunities(id)` ON DELETE CASCADE | ID da oportunidade |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |

**Unique**: `(user_id, opportunity_id)`

**RLS**: Usuário vê/gerencia apenas seus próprios favoritos.

---

### `public.relevance_feedback`

Feedback do aluno sobre relevância de oportunidades.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | ID do usuário |
| `opportunity_id` | `UUID` | NOT NULL, FK → `opportunities(id)` ON DELETE CASCADE | ID da oportunidade |
| `relevante` | `BOOLEAN` | NOT NULL | Se é relevante |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |

**Unique**: `(user_id, opportunity_id)`

**RLS**: Usuário vê/insere apenas seu próprio feedback.

---

### `public.settings`

Configurações do sistema (chaves de API, etc.).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `chave` | `TEXT` | PK | Nome da configuração |
| `valor` | `TEXT` | NOT NULL | Valor da configuração |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de atualização |

**RLS**: Leitura pública (acessível via service_role).

---

### `public.collect_log`

Log de execuções da coleta automatizada.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `fonte` | `TEXT` | NOT NULL | Fonte da coleta |
| `status` | `TEXT` | NOT NULL | Status (`success`, `error`) |
| `items_count` | `INTEGER` | DEFAULT `0` | Itens inseridos |
| `erro` | `TEXT` | | Mensagem de erro |
| `executed_at` | `TIMESTAMPTZ` | DEFAULT `now()` | Data de execução |

---

### `public.digest_log`

Log de envio de notificações por e-mail.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | ID único |
| `user_id` | `UUID` | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | ID do usuário |
| `ultimo_envio` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Data do último envio |
| `total_oportunidades` | `INTEGER` | NOT NULL, DEFAULT `0` | Total de oportunidades enviadas |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Data de criação |

**Índices**: `idx_digest_log_user` ON `user_id`

**RLS**: Usuário vê próprio log. Edge Function pode inserir/atualizar.

---

## Funções (RPC)

### `public.detectar_tipo(titulo TEXT, descricao TEXT) → TEXT`

Detecta o tipo da oportunidade baseado em regex no título + descrição.

| Padrão | Tipo |
|--------|------|
| `estágio`, `trainee`, `aprendiz` | `estagio` |
| `bolsa`, `pibic`, `pibiti`, `fomento` | `bolsa` |
| `monitória`, `monitor` | `monitoria` |
| `emprego`, `vaga`, `contratação`, `trabalhe conosco` | `emprego` |
| (fallback) | `edital` |

### `public.calcular_relevancia(user_id UUID, opp_id UUID) → REAL`

Calcula score de relevância contando ocorrências de palavras-chave do usuário no texto da oportunidade.

### `public.get_opportunities_with_relevance(...) → TABLE`

Retorna oportunidades com score de relevância e status de favorito. Versão atual (migration 017) aceita os parâmetros:

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `user_id` | `UUID` | (obrigatório) | ID do usuário logado |
| `tipo_filter` | `TEXT` | `NULL` | Filtro por tipo |
| `search_text` | `TEXT` | `NULL` | Busca ILIKE em título, descrição, órgão e cidade |
| `periodo_filter` | `TEXT` | `NULL` | Filtro por período letivo |
| `categoria_keywords` | `TEXT[]` | `NULL` | Filtro por keywords de categoria |
| `status_filter` | `TEXT` | `'todas'` | Filtro por status (`abertas`, `expiradas`, `todas`) |
| `page_size` | `INTEGER` | `10` | Limite por página |
| `page_offset` | `INTEGER` | `0` | Offset para paginação |

### `public.collect_all() → void`

Executa todas as search queries ativas via Serper API e insere resultados em `opportunities`.

### `public.collect_from_serper(query_text TEXT, api_key TEXT) → void`

Executa uma única query na Serper API.

### `public.schedule_collect_opportunities() → void`

Chama Edge Function `collect-opportunities` via `net.http_post`.

---

## Triggers

### `set_profiles_updated_at`

Atualiza `updated_at` em `profiles` antes de UPDATE.

---

## Agendamento (pg_cron)

| Job | Horário | Ação |
|-----|---------|------|
| `collect-opportunities-daily` | 06:00 diário | Executa coleta automatizada |
| `send-digest-daily` | 08:00 diário | Envia notificações por e-mail |

---

## Extensões

- `pg_cron` — Agendamento de tarefas
- `pg_net` — Requisições HTTP do PostgreSQL
