# Second Brain Hub

O **Second Brain Hub** é um ecossistema integrado para organização pessoal estruturado em torno de três domínios principais: **Gestão Financeira** (com lançamentos manuais, automações recorrentes e consolidação de saldos), **Planejamento Fitness** (com controle de fichas de treino, cronômetro de sessões em tempo real, catálogo de exercícios e análise de evolução por gráficos) e **Gestão de Tarefas** (com controle de prioridades, prazos e busca integrada).

O projeto adota uma arquitetura desacoplada, utilizando uma API RESTful modularizada no back-end e um cliente SPA responsivo no front-end.

---

## 🏗️ Arquitetura do Sistema

O fluxo de dados entre o cliente Next.js, a API NestJS, o mecanismo de agendamento de tarefas (Cron Engine) e o banco de dados relacional PostgreSQL é estruturado da seguinte forma:

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
        Throttle[Throttler Guard - Rate Limiter]
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
    API -->|Verificação de Limite de Requisições| Throttle
    Throttle -->|Validação de Token| Guard
    Guard -->|Dados Validados| Service
    Cron -->|Processamento de Lançamentos Recorrentes| Service
    Service --> Prisma
    Prisma --> DB
```

---

## 🛠️ Tecnologias Utilizadas

### Back-End (API)
*   **Framework:** [NestJS](https://nestjs.com/) (v11) - Arquitetura modular baseada em injeção de dependências.
*   **ORM:** [Prisma](https://www.prisma.io/) (v7) - Interface type-safe com o banco de dados.
*   **Banco de Dados:** PostgreSQL relacional.
*   **Autenticação & Segurança:** Passport.js com criptografia de senhas via `bcrypt`, tokens JWT, e `@nestjs/throttler` para prevenção de abusos de requisições.
*   **Validação:** `class-validator` e `class-transformer` para validação e tipagem rigorosa de DTOs nas requisições HTTP.
*   **Agendamento:** `@nestjs/schedule` para o motor diário de geração de transações recorrentes.

### Front-End (Web)
*   **Framework:** [Next.js](https://nextjs.org/) (v16.2) com App Router e React 19.
*   **Estilização:** Tailwind CSS v4 com variáveis nativas no Dark Mode e suporte a transições via Framer Motion.
*   **Gerenciamento de Estado de Servidor:** [TanStack React Query v5](https://tanstack.com/query/latest) para controle de cache, paginação e sincronização assíncrona.
*   **Gerenciamento de Estado Local:** [Zustand](https://github.com/pmndrs/zustand) com persistência automática no `localStorage` para manter o estado da sessão de treino ativa.
*   **Formulários:** React Hook Form integrado com validação de esquemas via **Zod**.
*   **Comunicação HTTP:** Axios com interceptores para injeção de tokens JWT e tratamento automático de desautenticação (HTTP 401).

---

## 📂 Organização do Repositório

O repositório está organizado de forma clara, separando as responsabilidades de cliente, servidor e automações:

```text
├── .github/                  # Fluxos de Integração Contínua (CI/CD GitHub Actions)
├── backend/                  # Código fonte do servidor NestJS
│   ├── prisma/               # Schema do banco de dados, sementes (seeds) e migrações
│   ├── src/                  # Módulos da aplicação (auth, finance, fitness, tasks, etc.)
│   └── tsconfig.json         # Configurações do compilador TypeScript
│
├── frontend/                 # Código fonte da aplicação web Next.js
│   ├── src/
│   │   ├── app/              # Estrutura de roteamento (App Router)
│   │   ├── components/       # Componentes globais reutilizáveis
│   │   ├── features/         # Lógica de negócio segmentada (auth, finance, fitness, tasks)
│   │   └── lib/              # Helpers de formatação e utilitários globais
│   └── tsconfig.json         # Configurações do compilador TypeScript
```

---

## 🚀 Funcionalidades Principais

### 1. Autenticação e Segurança
*   Fluxo de registro e login com validação de senhas.
*   **Rate Limiting:** Limitação de chamadas globais (máximo de 60 requisições por minuto por IP) e restrição extra nos endpoints críticos de criação de conta e login (limite de 5 tentativas por minuto) para mitigar ataques de força bruta.
*   Middleware nativo no Next.js para restrição de acesso a rotas autenticadas.

### 2. Módulo de Tarefas (`src/features/tasks`)
*   **Organização de Atividades:** Lançamento de tarefas com título, descrição opcional, datas de início e término.
*   **Controle de Prioridades:** Classificação em níveis `LOW` (Baixa), `MEDIUM` (Média) e `HIGH` (Alta), utilizando seletores customizados na interface de usuário.
*   **Filtros e Paginação:** Busca textual integrada (case-insensitive) combinada com filtros de prioridade diretamente na URL.
*   **Validação de Consistência:** Regras no Zod que impedem o agendamento de tarefas onde a data de encerramento seja anterior à data de início.

### 3. Módulo Financeiro (`src/features/finance`)
*   **Resumo Consolidado:** Dashboard de saldo disponível, total de entradas e saídas calculado de forma dinâmica para o mês de referência selecionado.
*   **Lançamentos Manuais:** Associação de transações com descrição, valor, data, método de pagamento (débito ou crédito) e categorias.
*   **Transações Recorrentes:** Agendamento de transações com frequências customizáveis (diária, semanal, quinzenal, mensal, anual) monitoradas pelo motor de tarefas automatizado (Cron) no back-end.
*   **Gerenciador de Categorias:** Criação e remoção em tempo real de categorias organizadas por tipo (Receita, Despesa e Fitness) com suporte a Soft Delete.

### 4. Módulo Fitness (`src/features/fitness`)
*   **Fichas de Treino:** Elaboração de fichas de treino com nome e lista flexível de exercícios associados.
*   **Treino Ativo com Cronômetro:** Início de sessão de treino ativa com persistência do cronômetro local e dados preenchidos mesmo se a página for recarregada.
*   **Gerenciador Desacoplado de Exercícios:** Biblioteca unificada de exercícios dividida entre exercícios padrões do sistema e personalizados criados pelo usuário.
*   **Registro de Séries (Set Log):** Lançamento de peso, repetições e indicação de falha muscular de forma rápida por exercício, permitindo alteração ou remoção de séries diretamente na sessão ativa.
*   **Gráficos de Progressão:** Plotagem dinâmica em formato SVG nativo para análise histórica de evolução de cargas (Carga Máxima e Volume Total) por exercício.

### 5. Integração Contínua (CI/CD)
*   **GitHub Actions:** Pipeline automatizado configurado no arquivo `.github/workflows/ci.yml` responsável pela validação de novos commits e Pull Requests, garantindo a integridade dos builds do front-end e back-end.

---

## ⚙️ Decisões de Design e Engenharia

1.  **Modularização por Funcionalidade (Feature-Based):**
    O front-end e o back-end são divididos por domínios (`auth`, `finance`, `fitness`, `tasks`). Isso isola as regras de negócio de cada contexto, otimizando o tempo de manutenção e a legibilidade do código.
2.  **Abordagem de Estado Híbrido:**
    O estado que depende de respostas do servidor é gerenciado pelo **TanStack React Query**, permitindo caching eficiente e invalidação automática apenas sob mudanças de dados. O estado local que requer persistência imediata (como a sessão de treino ativa) é mantido em uma store do **Zustand** com persistência em disco local (`localStorage`).
3.  **Transações Isoladas para Automações Financeiras:**
    O processamento diário das transações recorrentes é realizado através do recurso `$transaction` do Prisma no back-end. Caso ocorra qualquer falha na criação de uma transação automática ou na atualização de datas da tabela de recorrências, as alterações são revertidas em lote, preservando a consistência dos dados.
4.  **Normalização de Fusos Horários:**
    O utilitário `parseUTCToLocalDate` foi implementado para mitigar disparidades entre datas salvas em UTC no banco de dados e a conversão automática do fuso horário realizada pelos navegadores, exibindo as datas exatamente como informadas pelo usuário.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.
*   Instância ativa do banco de dados PostgreSQL (local ou em container Docker).

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
5.  *(Recomendado)* Popule o banco de dados com o script de sementes (seed) para gerar dados de simulação (como usuário convidado, categorias iniciais e histórico de treinos):
    ```bash
    npx prisma db seed
    ```
6.  Inicie o servidor de desenvolvimento do back-end:
    ```bash
    npm run start:dev
    ```
    O servidor estará ativo no endereço `http://localhost:3333`. Você pode consultar os endpoints mapeados no Swagger UI através do endereço `http://localhost:3333/docs`.

---

### Passo 2: Configurando o Front-End

1.  Navegue até a pasta do cliente Next.js:
    ```bash
    cd ../frontend
    ```
2.  Instale as dependências do projeto:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env.local` na raiz do diretório `frontend` apontando para a URL da API:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3333"
    ```
4.  Inicie a aplicação em modo de desenvolvimento:
    ```bash
    npm run dev
    ```
    Abra `http://localhost:3000` no seu navegador para utilizar a aplicação.