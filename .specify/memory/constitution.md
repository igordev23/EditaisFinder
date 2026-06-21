# EditaisFinder Constitution

## Core Principles

### I. Serverless-First
Toda a lógica server-side deve rodar em Supabase Edge Functions (Deno/TypeScript). Sem servidores Express/NestJS tradicionais.

### II. SPA com foco Mobile
Frontend como Single Page Application (React + TypeScript + Vite), responsivo e priorizando experiência mobile.

### III. TypeScript Obrigatório
Todo código, tanto frontend quanto Edge Functions, deve ser escrito em TypeScript com tipagem estrita (sem `any`).

### IV. Segurança por Design
Row Level Security (RLS) no Supabase para proteção a nível de linha. Sem segredos no código-fonte. Autenticação via Supabase Auth.

## Stack Tecnológica

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, React Router
- **Backend/Infra:** Supabase (PostgreSQL, Auth, Storage), Edge Functions (Deno/TypeScript)
- **Agendamento:** pg_cron
- **APIs Externas:** Serper API (buscas web), RSS IFPI (feedparser)
- **Notificações:** Resend (e-mail)
- **Deploy:** Render (frontend), Supabase CLI (Edge Functions)

## Escopo do Sistema

- **Para alunos:** oportunidades de estágio, bolsa, monitoria, emprego e edital
- **Para empresas:** licitações públicas de prefeituras e órgãos governamentais

## Qualidade e Testes

- Testes com Playwright (E2E)
- Commits seguindo Conventional Commits
- ESLint + Prettier para formatação

## Governança

Esta constituição substitui práticas conflitantes. Emendas requerem documentação e aprovação.

**Versão**: 2.0.0 | **Ratificada**: 2026-06-21
