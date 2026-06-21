# EditaisFinder

Rastreador de oportunidades para alunos do IFPI Campus Piripiri e licitações públicas para empresas. Centraliza estágios, bolsas, monitorias, empregos, editais e licitações em um só lugar.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + pg_cron)
- **Deploy:** Render (frontend) + Supabase (backend)

## Sobre o `schema.md` / `spec.md`

Este projeto foi desenvolvido seguindo a metodologia **SDD (Spec-Driven Development)** com o fluxo **Spec Kit**. O Spec Kit nomeia o artefato de especificação como `spec.md`, enquanto a atividade acadêmica se refere a ele como `schema.md`. Ambos contêm a mesma informação: os requisitos funcionais, user stories e critérios de aceitação do sistema.

- `specs/001-editais-finder/spec.md` — especificação funcional (Spec Kit)
- `specs/001-editais-finder/plan.md` — plano de implementação
- `specs/001-editais-finder/tasks.md` — roadmap de tarefas
- `.specify/memory/constitution.md` — regras de tecnologia

## Estrutura do Projeto

```
.
├── app/                          # Frontend React + Vite
│   ├── src/
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── opportunities/    # FilterBar
│   │   │   └── ui/               # SearchInput
│   │   ├── pages/                # Home, Login, Profile, Admin, Favorites
│   │   ├── services/             # Cliente Supabase
│   │   └── types/                # Tipos TypeScript
│   └── e2e/                      # Testes Playwright
├── supabase/
│   ├── functions/                # Edge Functions (collect-opportunities, send-digest)
│   └── migrations/               # 11 migrations SQL (001 a 011)
└── specs/                        # Documentação SDD
```

## Funcionalidades

- **Home:** Listagem de oportunidades com busca por palavra-chave, filtro por tipo, período letivo e paginação
- **Login:** Autenticação via Supabase Auth (e-mail/senha)
- **Perfil:** Cadastro de curso, período e áreas de interesse
- **Admin:** Cadastro manual de oportunidades (professores/admin)
- **Favoritos:** Salvar oportunidades e compartilhar links
- **Coleta Automatizada:** Edge Function busca oportunidades via Serper API + RSS IFPI (06:00 via pg_cron)
- **Classificação:** Score de relevância baseado nas palavras-chave de interesse do aluno
- **Notificações:** E-mail diário com novas oportunidades relevantes (08:00 via pg_cron + Resend)
- **Licitações:** Seção dedicada para empresas com licitações públicas de prefeituras, filtro por cidade e busca por órgão

## Deploy

### Frontend (Render)

1. Conecte o repositório ao Render
2. Configure como **Static Site** ou **Web Service**
3. Build command: `cd app && npm install && npm run build`
4. Publish directory: `app/dist`
5. Env vars:
   - `VITE_SUPABASE_URL=https://gtwcqggageryffzfdivv.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon`

### Supabase

O backend já está rodando em: `https://gtwcqggageryffzfdivv.supabase.co`
