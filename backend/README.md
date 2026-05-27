# Second Brain API

API RESTful modular desenvolvida com **NestJS**, **Prisma ORM** e **PostgreSQL** projetada para centralizar o controle de finanças pessoais e o acompanhamento de rotinas de treinamento físico (Fitness).

A API conta com arquitetura modular, autenticação via JWT, controle de permissões por usuário, exclusão lógica (*soft delete*) em todas as entidades cruciais e processamento em segundo plano por meio de tarefas agendadas (Cron Jobs).

---

## 🛠️ Tecnologias Utilizadas

*   **Framework:** [NestJS](https://nestjs.com/) (v11.x)
*   **ORM:** [Prisma ORM](https://www.prisma.io/) (v7.x)
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **Autenticação:** Passport JWT (`@nestjs/passport`, `passport-jwt`)
*   **Segurança:** Criptografia de senhas com `bcrypt`
*   **Validação:** `class-validator` e `class-transformer`
*   **Documentação:** Swagger UI (`@nestjs/swagger`)
*   **Agendamento:** NestJS Schedule (Cron Jobs)

---

## 📋 Módulos do Sistema

### 1. Autenticação e Usuários (`/auth`, `/users`)
*   Cadastro e gerenciamento de perfis de usuários com senhas criptografadas via bcrypt (12 salt rounds).
*   Geração de Token de Acesso JWT com expiração de 1 dia.
*   Suporte a exclusão lógica (*soft delete*) de contas de usuários.

### 2. Categorias (`/categories`)
*   Criação de categorias personalizadas vinculadas a um usuário ou disponibilização de categorias globais (`userId: null`).
*   Separação funcional por tipos: `INCOME` (Receitas), `EXPENSE` (Despesas) e `FITNESS` (Exercícios/Treinos).

### 3. Financeiro (`/transactions`)
*   Registro manual de transações (receitas ou despesas) com definição de datas e métodos de pagamento (`DEBIT` ou `CREDIT`).
*   Filtragem flexível por período (mês/ano), múltiplas categorias e métodos de pagamento.
*   **Painel Resumo (Summary):** Endpoint que retorna os consolidados de total de entradas, saídas e o saldo líquido calculado.

### 4. Recorrência Financeira (`/recurring-transactions`)
*   Agendamento de transações recorrentes com frequências parametrizáveis (`DAILY`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `YEARLY`).
*   **Motor Automático (Cron Job):** Tarefa agendada executada diariamente à 1h da manhã (`EVERY_DAY_AT_1AM`) que varre as recorrências ativas, calcula a próxima data de execução, gera os lançamentos físicos no livro caixa (`Transaction`) correspondente e inativa o agendamento caso atinja a data limite (`endDate`).

### 5. Planos de Treino (`/workout-plans`)
*   Montagem de planos estruturados de treinamento (fichas de treino).
*   Associação de múltiplos exercícios validados estritamente contra categorias do tipo `FITNESS`.
*   Operações individuais de inclusão e desativação lógica de exercícios diretamente nas fichas ativas.

### 6. Sessões de Treino (`/workout-sessions`)
*   Início de sessões ativas de treino baseadas em um plano de treino pré-existente (validação de concorrência que impede o início de múltiplas sessões simultâneas).
*   Gravação de séries executadas em tempo real contendo peso, repetições e sinalizador de falha concêntrica (`toFailure`).
*   Cálculo automático de métricas de desempenho, incluindo o volume de treino por série (Peso × Repetições).
*   Histórico de progressão de cargas cronológico por exercício.

---

## 🧪 Testes Unitários

A aplicação conta com uma suíte de testes unitários desenvolvida com **Jest** e **ts-jest**, focada em isolar e validar as regras de negócio mais complexas do sistema presentes nas classes de serviço.

### Estratégia de Teste
*   **Isolamento do Banco de Dados:** Mocks estruturados para o `PrismaService`, garantindo que os testes de serviços validem as regras de fluxo sem interações físicas com o banco de dados PostgreSQL.
*   **Resolução de Caminhos Nativos:** Configuração de mapeamento do Jest adaptada para resolver importações com extensões explícitas `.js` geradas nativamente pelo cliente Prisma sob o modelo `nodenext`.

### Principais Serviços Cobertos e Cenários Validados

*   **Financeiro (`TransactionsService`):**
    *   Validação de permissão e existência de categorias antes do lançamento físico de transações.
    *   Cálculo dos agregados de receitas, despesas e saldo líquido no painel resumo (`getSummary`).
*   **Sessões de Treino (`WorkoutSessionsService`):**
    *   Controle de sessões ativas concorrentes (prevenção do início de múltiplos treinos paralelos).
    *   Garantia de pertinência do exercício em relação à ficha selecionada ao salvar cada série.
    *   Cálculo cronológico de métricas de volume de treino acumulado por exercício (`reps * weight`).
*   **Recorrência Financeira (`RecurringTransactionsService`):**
    *   Operação correta do motor agendador do Cron Job.
    *   Cálculo de incrementos de datas futuras respeitando diferentes frequências (diária, semanal, quinzenal, mensal, anual).
    *   Verificação do encerramento automático do agendamento ao atingir a data limite estabelecida (`endDate`).

### Como Executar a Suíte de Testes

```bash
# Executar todos os testes unitários da aplicação
npm run test

# Executar os testes utilizando o gerenciador Yarn
yarn test
```

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
*   Node.js (versão 18 ou superior recomendado)
*   Banco de dados PostgreSQL ativo

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves de configuração:
```env
# Conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/second_brain?schema=public"

# Chave secreta de assinatura do JWT
JWT_SECRET="sua_chave_secreta_super_segura"

# Porta onde o servidor REST será disponibilizado (padrão: 8080)
PORT=8080
```

### 3. Executar as migrações do banco de dados (Prisma)
Aplique o esquema do banco de dados PostgreSQL e gere os arquivos do cliente do Prisma localizados em `src/generated/prisma`:
```bash
npx prisma db push
```

### 4. Iniciar a aplicação

```bash
# Modo de desenvolvimento (com hot reload ativo)
npm run start:dev

# Modo de produção
npm run build
npm run start:prod
```

A aplicação estará acessível em `http://localhost:8080` (ou na porta configurada na variável `PORT`).

---

## 📖 Documentação da API (Swagger)

A documentação interativa com todas as rotas de requisição, formatos de payload esperados (DTOs), respostas HTTP e autenticação pode ser acessada diretamente no navegador:

```
http://localhost:8080/docs
```

> **Nota:** Para consumir as rotas protegidas por segurança na interface do Swagger, realize a autenticação prévia na rota `POST /auth/login`, copie o `access_token` retornado e insira-o clicando no botão **"Authorize"** presente no cabeçalho do painel do Swagger.