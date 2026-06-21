# Feature Specification: EditaisFinder - Rastreador de Oportunidades

**Feature Branch**: `001-editais-finder`

**Created**: 2026-06-21

**Status**: Draft

**Input**: Escopo do sistema descrito no PDF "ESCOPO DO SISTEMA – RASTREADOR DE OPORTUNIDADES.pdf"

## User Scenarios & Testing

### User Story 1 - Visualizar Oportunidades (Priority: P1)

Como aluno do IFPI, quero visualizar uma lista de oportunidades (estágios, bolsas, monitorias, empregos e editais) ordenadas por data de publicação para não perder prazos.

**Why this priority**: É a funcionalidade central do sistema — sem ela não há valor para o usuário final.

**Independent Test**: Abrir a página inicial e ver a lista de oportunidades carregadas do Supabase, ordenadas da mais recente para a mais antiga.

**Acceptance Scenarios**:
1. **Given** que existem oportunidades cadastradas, **When** o aluno acessa a página inicial, **Then** as oportunidades são exibidas em ordem decrescente de data de publicação.
2. **Given** que não há oportunidades cadastradas, **When** o aluno acessa a página inicial, **Then** é exibida uma mensagem "Nenhuma oportunidade encontrada".
3. **Given** que a busca está em andamento, **When** os dados ainda não carregaram, **Then** é exibido um indicador de carregamento.

---

### User Story 2 - Cadastro e Perfil do Aluno (Priority: P1)

Como aluno, quero me cadastrar com meu curso, período e áreas de interesse para receber oportunidades personalizadas.

**Why this priority**: A personalização depende do perfil do aluno. Sem ele, não há classificação inteligente.

**Independent Test**: Aluno acessa o formulário de cadastro, preenche curso/período/interesses e os dados são salvos no Supabase via autenticação.

**Acceptance Scenarios**:
1. **Given** que o aluno não está logado, **When** ele clica em "Cadastrar", **Then** é redirecionado para o formulário de autenticação via Supabase Auth.
2. **Given** que o aluno está logado, **When** ele edita seu perfil, **Then** as alterações são persistidas no PostgreSQL.
3. **Given** que um aluno tenta acessar o perfil de outro usuário, **Then** a política RLS impede o acesso.

---

### User Story 3 - Filtros e Busca (Priority: P2)

Como aluno, quero filtrar oportunidades por tipo (estágio, bolsa, monitoria, emprego, edital), localidade, data e palavra-chave para encontrar rapidamente o que me interessa.

**Why this priority**: Melhora a experiência do usuário, mas o sistema já funciona sem filtros.

**Independent Test**: Selecionar um filtro de tipo "estágio" e ver apenas oportunidades desse tipo.

**Acceptance Scenarios**:
1. **Given** que existem oportunidades de múltiplos tipos, **When** o aluno seleciona o filtro "estágio", **Then** apenas oportunidades de estágio são exibidas.
2. **Given** que o aluno digita uma palavra-chave no campo de busca, **When** ele pressiona Enter, **Then** são exibidas oportunidades cujo título ou descrição contenham a palavra.
3. **Given** que nenhuma oportunidade corresponde aos filtros, **When** a busca é realizada, **Then** é exibida a mensagem "Nenhum resultado encontrado".

---

### User Story 4 - Coleta Automatizada (Priority: P2)

Como administrador, quero que o sistema colete automaticamente oportunidades de fontes externas (Serper API e RSS do IFPI) diariamente para manter o banco de dados atualizado.

**Why this priority**: Automatiza a alimentação do sistema, mas inicialmente podemos cadastrar manualmente.

**Independent Test**: Edge Function agendada via pg_cron executa a coleta e insere novos registros na tabela `opportunities`.

**Acceptance Scenarios**:
1. **Given** que a Edge Function `collect-opportunities` é executada, **When** há novos resultados da Serper API, **Then** novos registros são inseridos em `opportunities` sem duplicatas.
2. **Given** que o feed RSS do IFPI tem novas notícias, **When** o parser é executado, **Then** as notícias relevantes são cadastradas como oportunidades.
3. **Given** que um link já existe no banco, **When** a coleta tenta inseri-lo novamente, **Then** o índice único no link impede a duplicação.

---

### User Story 5 - Classificação Inteligente (Priority: P3)

Como aluno, quero ver oportunidades classificadas por relevância baseada no meu perfil para priorizar as mais importantes para mim.

**Why this priority**: É um diferencial, não essencial para o MVP.

**Independent Test**: Após logar, o aluno vê as oportunidades ordenadas por score de relevância calculado pelo algoritmo TF-IDF.

**Acceptance Scenarios**:
1. **Given** que o aluno possui interesses cadastrados, **When** ele acessa a lista de oportunidades, **Then** as oportunidades são ordenadas por relevância (maior score primeiro).
2. **Given** que o aluno marca uma oportunidade como "não relevante", **When** o feedback é registrado, **Then** a tabela de treinamento é atualizada.

---

### User Story 6 - Cadastro Manual por Professores (Priority: P3)

Como professor/coordenador, quero cadastrar oportunidades manualmente pela interface para divulgar vagas que chegam até mim.

**Why this priority**: Expande as fontes de dados, mas a coleta automatizada já cobre o essencial.

**Independent Test**: Professor autenticado acessa formulário de cadastro, preenche os dados da vaga e ela aparece na lista pública.

**Acceptance Scenarios**:
1. **Given** que um professor está autenticado, **When** ele preenche o formulário de nova oportunidade, **Then** a vaga é salva com fonte "manual".
2. **Given** que um aluno não autenticado tenta acessar o formulário de cadastro, **Then** é redirecionado para o login.

---

### User Story 7 - Notificações por E-mail (Priority: P3)

Como aluno, quero receber um e-mail diário com novas oportunidades relevantes para não precisar acessar o sistema todos os dias.

**Why this priority**: Recurso de conveniência, não crítico para o funcionamento.

**Independent Test**: Edge Function dispara e-mails via Resend para alunos com novas oportunidades desde o último envio.

**Acceptance Scenarios**:
1. **Given** que há novas oportunidades desde o último e-mail, **When** a Edge Function `send-digest` é executada, **Then** os alunos recebem um e-mail com as novidades.
2. **Given** que não há novas oportunidades, **When** a função é executada, **Then** nenhum e-mail é enviado.

---

### User Story 8 - Favoritos e Compartilhamento (Priority: P3)

Como aluno, quero salvar oportunidades como favoritas e gerar links compartilháveis para enviar para colegas.

**Why this priority**: Funcionalidade social, pode vir depois do MVP.

**Independent Test**: Aluno autenticado salva uma vaga como favorita e ela aparece em uma lista "Favoritos".

**Acceptance Scenarios**:
1. **Given** que o aluno está logado, **When** ele clica no ícone de favorito em uma oportunidade, **Then** a vaga é salva em sua lista de favoritos.
2. **Given** que o aluno está na página de favoritos, **When** ele clica em "Compartilhar", **Then** um link copiável é gerado.

---

### Edge Cases

- O que acontece quando a Serper API atinge o limite de requisições?
- Como o sistema se comporta se o feed RSS do IFPI estiver fora do ar?
- O que acontece se um aluno tentar se cadastrar com um e-mail já existente?
- Como tratar URLs inválidas no cadastro manual?
- O que acontece quando o pg_cron falha ao executar a Edge Function?

## Requirements

### Functional Requirements

- **FR-001**: Sistema MUST permitir cadastro de alunos com curso, período e áreas de interesse
- **FR-002**: Sistema MUST coletar oportunidades automaticamente via Serper API e RSS IFPI
- **FR-003**: Sistema MUST exibir lista de oportunidades ordenadas por data
- **FR-004**: Sistema MUST permitir filtros por tipo, localidade, data e palavra-chave
- **FR-005**: Sistema MUST classificar oportunidades por relevância baseada no perfil do aluno
- **FR-006**: Sistema MUST autenticar usuários via Supabase Auth (magic link ou email/senha)
- **FR-007**: Sistema MUST enviar notificações por e-mail diárias com novas oportunidades
- **FR-008**: Sistema MUST permitir cadastro manual por professores autenticados
- **FR-009**: Sistema MUST permitir salvar favoritos e gerar links compartilháveis
- **FR-010**: Sistema MUST aplicar RLS para segurança a nível de linha

### Key Entities

- **opportunities**: Título, descrição, link, data_publicação, tipo (estágio/bolsa/monitoria/emprego/edital), fonte (automática/manual), score_relevancia
- **search_queries**: Query_string, ativa, última_execucao
- **user_interests**: Relaciona usuário com palavras-chave de interesse
- **profiles**: Curso, período, áreas de interesse do aluno
- **favorites**: Relaciona usuário com oportunidades favoritadas

## Success Criteria

### Measurable Outcomes

- **SC-001**: Alunos conseguem ver oportunidades em até 2 segundos após carregar a página
- **SC-002**: Coleta automatizada executa diariamente sem intervenção manual
- **SC-003**: Zero duplicatas na tabela de oportunidades
- **SC-004**: Sistema funciona com custo zero no plano gratuito do Supabase

## Assumptions

- Alunos têm acesso à internet estável
- Serper API fornece cota gratuita suficiente para o MVP
- Feed RSS do IFPI permanece disponível no mesmo endpoint
- Usuários utilizam navegadores modernos (Chrome, Firefox, Edge, Safari)
- Não há necessidade de aplicativo mobile nativo (apenas SPA responsivo)
