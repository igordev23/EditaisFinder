# Implementation Plan: EditaisFinder

**Branch**: `001-editais-finder` | **Date**: 2026-06-21 | **Spec**: `specs/001-editais-finder/spec.md`

## Summary

Sistema para centralizar, classificar e distribuir oportunidades (estágios, bolsas, monitorias, empregos e editais) para estudantes do IFPI Campus Piripiri. Arquitetura 100% serverless com Supabase + SPA React.

## Technical Context

**Language/Version**: TypeScript 5.x (Deno para Edge Functions)

**Primary Dependencies**:
- Frontend: React 18+, Vite, Tailwind CSS, React Router, @supabase/supabase-js
- Edge Functions: Deno/std, serper API client, feedparser (npm)
- Infra: Supabase CLI, Resend SDK

**Storage**: Supabase PostgreSQL (com Full-Text Search via índices GIN)

**Testing**: Vitest (frontend), Deno test (Edge Functions)

**Target Platform**: Web (SPA responsivo) - navegadores modernos

**Project Type**: Web application (SPA + Serverless backend)

**Performance Goals**: Carregamento inicial <2s, busca full-text <500ms

**Constraints**: Custo zero no MVP (planos gratuitos Supabase + Vercel)

**Scale/Scope**: ~1000 alunos, ~5000 oportunidades, uma instituição (expansível)

## Constitution Check

- ✅ Serverless-First: Edge Functions para toda lógica backend
- ✅ SPA com foco Mobile: React + Vite + Tailwind
- ✅ TypeScript Obrigatório: Sem `any`
- ✅ Segurança por Design: RLS obrigatório em todas as tabelas

## Project Structure

### Documentation

```text
specs/001-editais-finder/
├── spec.md              # Especificação funcional
├── plan.md              # Este arquivo
└── tasks.md             # Gerado pelo /speckit.tasks
```

### Source Code

```text
# Frontend (SPA)
app/
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── ui/          # Botões, inputs, cards, modais
│   │   ├── layout/      # Header, footer, sidebar
│   │   └── opportunities/ # Cards, listas, filtros
│   ├── pages/           # Páginas da aplicação
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Admin.tsx
│   │   └── Favorites.tsx
│   ├── services/        # Clientes Supabase, API helpers
│   │   └── supabase.ts
│   ├── hooks/           # Custom hooks React
│   ├── types/           # Interfaces e tipos TypeScript
│   └── utils/           # Funções utilitárias
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

# Supabase (Edge Functions + Migrations)
supabase/
├── functions/
│   ├── collect-opportunities/  # Coleta Serper API + RSS
│   │   ├── index.ts
│   │   └── test.ts
│   ├── classify-relevance/     # Classificação TF-IDF
│   │   └── index.ts
│   └── send-digest/            # Notificações por e-mail
│       └── index.ts
├── migrations/                 # Schema SQL
│   ├── 001_schema.sql
│   └── 002_rls_policies.sql
└── seed.sql                    # Dados de exemplo

# Raiz
├── .env.example
├── supabase/config.toml
└── package.json                # Scripts de deploy
```

## Implementation Sequence

### Phase 0: Setup
- Inicializar projeto React + Vite + TypeScript
- Configurar Tailwind CSS, ESLint, Prettier
- Configurar projeto Supabase (CLI + migrations)
- Configurar variáveis de ambiente

### Phase 1: Autenticação e Perfil (Foundation)
- Schema do banco (usuários, perfis, oportunidades)
- Supabase Auth (magic link + email/senha)
- Páginas de Login/Cadastro
- Edição de perfil do aluno

### Phase 2: Listagem de Oportunidades (MVP)
- Tabela `opportunities` com índices
- Página Home com listagem ordenada por data
- Componente de card de oportunidade
- Carregamento e tratamento de erros

### Phase 3: Filtros e Busca
- Filtros por tipo, localidade, data
- Campo de busca full-text (PostgreSQL GIN)
- Paginação ou infinite scroll

### Phase 4: Coleta Automatizada
- Edge Function `collect-opportunities`
- Integração Serper API
- Parser RSS IFPI
- Agendamento via pg_cron

### Phase 5: Classificação de Relevância
- Tabela `user_interests`
- Edge Function `classify-relevance`
- Algoritmo TF-IDF (ou fallback keywords)
- Feedback do aluno (relevante/não relevante)

### Phase 6: Cadastro Manual (Admin/Professor)
- Formulário de cadastro de oportunidade
- Painel administrativo básico
- Validação de URL e dados

### Phase 7: Notificações e Favoritos
- Edge Function `send-digest` (Resend)
- Agendamento pg_cron
- Tabela `favorites`
- Links compartilháveis

## Complexity Tracking

Nenhuma violação da constituição identificada.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
