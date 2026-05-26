# Second Brain Hub

O **Second Brain Hub** é um ecossistema integrado de produtividade pessoal estruturado em torno de dois domínios principais: **Gestão Financeira** (com lançamentos manuais, automações recorrentes e consolidação de saldos) e **Planejamento Fitness** (com controle de fichas de treino, cronômetro de sessões em tempo real e análise de progressão de carga via gráficos analíticos).

O projeto adota uma arquitetura desacoplada, utilizando uma API RESTful modularizada no back-end e um cliente SPA moderno e responsivo no front-end.

---

## 🏗️ Arquitetura do Sistema

A imagem abaixo ilustra o fluxo de dados entre o cliente Next.js, a API NestJS, o mecanismo de agendamento de tarefas (Cron Engine) e o banco de dados relacional PostgreSQL:

```mermaid
graph TD
    subgraph Client [Front-End: Next.js]
        UI[User Interface / Tailwind v4]
        RQ[TanStack Query - Cache State]
        ZS[Zustand - Active Session State]
    end

    subgraph Server [Back-End: NestJS]
        API[API REST Controllers]
        Guard[Auth Guard / JWT Strategy]
        Service[Business Logic Services]
        Cron[Cron Engine - Daily Task Scheduler]
    end

    subgraph Database [Storage]
        Prisma[Prisma ORM]
        DB[(PostgreSQL Database)]
    end

    UI -->|Ações do Usuário| RQ
    UI -->|Persistência Local da Sessão| ZS
    RQ -->|HTTP Requests / Bearer Token| API
    API -->|Validação de Token| Guard
    Guard -->|Dados Validados| Service
    Cron -->|Processamento de Lançamentos Recorrentes| Service
    Service --> Prisma
    Prisma --> DB
```

---

## 🛠️ Tecnologias Utilizadas

### Back-End (API)
*   **Framework:** [NestJS](https://nestjs.com/) (v11) - Arquitetura modular baseada em injeção de dependência.
*   **ORM:** [Prisma](https://www.prisma.io/) (v7) - Interface type-safe com o banco de dados.
*   **Banco de Dados:** PostgreSQL relacional.
*   **Autenticação:** Passport.js com criptografia de senhas via `bcrypt` e tokens JWT.
*   **Validação:** `class-validator` e `class-transformer` para validação de DTOs nas requisições HTTP.
*   **Agendamento:** `@nestjs/schedule` para execução do motor diário de transações recorrentes.

### Front-End (Web)
*   **Framework:** [Next.js](https://nextjs.org/) (v16.2 Beta/RC / v15) com App Router.
*   **Estilização:** Tailwind CSS v4 com variáveis nativas no Dark Mode.
*   **Gerenciamento de Estado de Servidor:** [TanStack React Query v5](https://tanstack.com/query/latest) para controle de cache, sincronização e paginação.
*   **Gerenciamento de Estado Local:** [Zustand](https://github.com/pmndrs/zustand) com persistência automática (via `localStorage` para a sessão de treino ativa).
*   **Formulários:** React Hook Form integrado com validação de esquemas via **Zod**.
*   **Comunicação HTTP:** Axios com interceptores para injeção de tokens JWT e redirecionamento automático em caso de expiração de sessão (HTTP 401).

---

## 📂 Organização do Repositório

O repositório está organizado de forma clara, separando as responsabilidades de cliente e servidor:

```text
├── backend/                  # Código fonte do servidor NestJS
│   ├── prisma/               # Schema do banco de dados e arquivos de migração
│   ├── src/                  # Módulos da aplicação (auth, finance, workout-plans, etc.)
│   └── tsconfig.json         # Configurações do compilador TypeScript
│
├── frontend/                 # Código fonte da aplicação web Next.js
│   ├── src/
│   │   ├── app/              # Roteamento baseado em pastas (App Router)
│   │   ├── components/       # Componentes globais compartilhados
│   │   ├── features/         # Lógica de negócio segmentada por domínios (auth, finance, fitness)
│   │   └── lib/              # Funções utilitárias e helpers globais
│   └── tsconfig.json         # Configurações do compilador TypeScript
```

---

## ⚙️ Decisões de Design e Engenharia

1.  **Separação de Responsabilidades no Front-End (Feature-Based):**
    Em vez de agrupar todos os componentes em pastas genéricas, o código do front-end é organizado por domínios de negócio (`features/auth`, `features/finance`, `features/fitness`). Cada módulo encapsula seus próprios componentes, hooks de requisição, serviços e tipos, o que reduz o acoplamento e facilita a escalabilidade da base de código.
2.  **Abordagem Híbrida de Estado (Zustand vs. React Query):**
    Os estados que dependem do servidor (como listas de transações, histórico de treinos e resumos financeiros) são gerenciados pelo **TanStack React Query**, aproveitando sua engine de cache e invalidação de queries. O **Zustand** é usado estritamente para estados puramente locais da UI, como dados de autenticação e o cronômetro do treino em andamento, persistido para que o progresso não seja perdido se o usuário recarregar o navegador.
3.  **Motor de Recorrência Baseado em Cron:**
    No back-end, um Cron Job configurado para rodar diariamente analisa se existem agendamentos financeiros (`RecurringTransaction`) com a data de execução expirada ou igual ao dia corrente. O processamento ocorre dentro de uma transação isolada do banco de dados (`$transaction` do Prisma), gerando o lançamento físico na tabela de transações e recalculando o próximo disparo com base na frequência cadastrada (diária, semanal, mensal, etc.).
4.  **Tratamento de Fusos Horários locais no Next.js:**
    Para mitigar problemas clássicos de diferença de fuso horário entre o horário salvo em formato UTC no banco e a conversão automática do JavaScript no navegador, foi criada uma utilidade de normalização (`parseUTCToLocalDate`) que garante que o dia, mês e ano inseridos pelo usuário permaneçam idênticos visualmente, independente da localização do cliente.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.
*   Instância ativa do banco de dados PostgreSQL (pode ser executada localmente ou via container Docker).

---

### Passo 1: Configurando o Back-End

1.  Navegue até a pasta do servidor:
    ```bash
    cd backend
    ```
2.  Instale as dependências necessárias:
    ```bash
    npm install
    ```
3.  Crie um arquivo chamado `.env` na raiz do diretório `backend` e configure as credenciais do seu banco de dados e a chave secreta de assinatura dos tokens JWT:
    ```env
    DATABASE_URL="postgresql://usuario:senha@localhost:5432/secondbrain?schema=public"
    JWT_SECRET="sua_chave_secreta_e_segura_aqui"
    PORT=3333
    ```
4.  Execute as migrações do banco de dados com o Prisma para estruturar as tabelas e gerar o cliente type-safe:
    ```bash
    npx prisma migrate dev
    ```
5.  *(Opcional / Recomendado)* Rode o script de população de banco (seed) para gerar dados fictícios para testes:
    ```bash
    npx prisma db seed
    ```
6.  Inicie o servidor de desenvolvimento do back-end:
    ```bash
    npm run start:dev
    ```
    O servidor estará ativo no endereço `http://localhost:3333`. Você pode consultar a documentação das rotas diretamente em `http://localhost:3333/docs` (Swagger UI).

---

### Passo 2: Configurando o Front-End

1.  Em uma nova sessão de terminal, navegue até a pasta do cliente Next.js:
    ```bash
    cd frontend
    ```
2.  Instale as dependências do projeto:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env.local` na raiz do diretório `frontend` apontando para a URL da API que configuramos no passo anterior:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3333"
    ```
4.  Inicie a aplicação em modo de desenvolvimento:
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:3000` no seu navegador para utilizar a aplicação.

---

## 📅 Roadmap de Desenvolvimento Futuro
*   [ ] **Módulo de Estudos:** Implementação de um bloco de notas com suporte a Markdown, organização por tags de matérias e flashcards para revisões baseadas em repetição espaçada.
*   [ ] **Testes de Integração adicionais:** Aumento da cobertura de testes nos serviços de persistência física no back-end.
*   [ ] **Notificações integradas:** Envio de alertas de vencimento para transações recorrentes via e-mail ou integração com canais de mensagem.
