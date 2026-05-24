## 🛠️ Tecnologias Utilizadas

A arquitetura do sistema foi projetada de forma modular, separando as funcionalidades principais por domínios e utilizando as seguintes ferramentas:

*   **Framework Principal**: [Next.js](https://nextjs.org/) (v16.2.6) com App Router.
*   **Gerenciamento de Estado**: 
    *   [TanStack React Query](https://tanstack.com/query/latest) (v5) para requisições de dados assíncronos, cache e sincronização com o backend.
    *   [Zustand](https://github.com/pmndrs/zustand) (v5) para gerenciamento de estado local global (dados de autenticação e sessão de treino ativa com persistência no `localStorage`).
*   **Estilização e Interface**:
    *   [Tailwind CSS](https://tailwindcss.com/) (v4) para design responsivo.
    *   [Framer Motion](https://www.framer.com/motion/) para transições e microinterações de interface.
    *   [Lucide React](https://lucide.dev/) para o conjunto de ícones.
*   **Formulários e Validação**:
    *   [React Hook Form](https://react-hook-form.com/) integrado com o resolver do [Zod](https://zod.dev/) para validações de formulários no lado do cliente.
*   **Comunicação com a API**:
    *   [Axios](https://axios-http.com/) para requisições HTTP, contendo interceptores para injeção automática de token e tratamento de expiração de sessão (HTTP 401).
    *   [js-cookie](https://github.com/js-cookie/js-cookie) para gerenciamento seguro do token de autenticação no navegador.

---

## 🚀 Funcionalidades Principais

### 1. Autenticação e Segurança (`src/features/auth`)
*   Fluxo completo de cadastro (`/register`) e login de usuários (`/login`).
*   Middleware nativo do Next.js para verificação de sessões, impedindo acessos não autorizados a rotas privadas.
*   Interceptor HTTP que desloga o usuário e o redireciona caso o token expire.

### 2. Módulo Financeiro (`src/features/finance`)
*   **Resumo Financeiro**: Visualização dinâmica do saldo atual, total de receitas e total de despesas do mês selecionado.
*   **Transações**: Lançamento de despesas e receitas associando descrição, valor, data, método de pagamento (crédito/débito) e categorias.
*   **Recorrências**: Agendamento de lançamentos recorrentes (diário, semanal, quinzenal, mensal ou anual) com controle de status (ativo/pausado).
*   **Gerenciamento de Categorias**: Criação e remoção inline de categorias organizadas por tipo (Receita, Despesa e Fitness).
*   **Filtros Avançados**: Filtragem em tempo real combinando busca por categoria e método de pagamento, mantendo o estado sincronizado via URL Search Params.

### 3. Módulo Fitness / Academia (`src/features/fitness`)
*   **Fichas de Treino**: Organização de planos de musculação com nome personalizado e lista editável de exercícios associados.
*   **Treino em Andamento**: Início de sessão de treino ativa com cronômetro em tempo real. Os dados da sessão persistem no navegador caso a página seja atualizada ou o usuário navegue para outras abas.
*   **Registro de Séries**: Lançamento rápido de séries de exercícios (peso, número de repetições e indicação de falha muscular), com capacidade de edição e exclusão de séries em tempo real.
*   **Histórico de Treinos**: Visualização em lista paginada dos treinos concluídos com detalhamento de pesos e repetições executados em cada data.
*   **Gráfico de Evolução**: Plotagem de desempenho ao longo do tempo (Carga Máxima ou Volume Total) gerada de forma dinâmica utilizando gráficos em formato SVG nativo para qualquer exercício selecionado.

---

## 📁 Estrutura do Projeto

O projeto adota uma estrutura baseada em *Features* para facilitar a manutenção e escalabilidade do código:

```text
src/
├── app/                  # Roteamento baseado em arquivos (App Router)
│   ├── (app)/            # Rotas autenticadas (dashboard de finanças e fitness)
│   ├── (auth)/           # Rotas públicas (login e registro)
│   └── globals.css       # Configurações do Tailwind CSS v4 e variáveis de cores
├── components/           # Componentes globais e compartilhados (ex: paginação)
├── features/             # Domínios de negócio isolados
│   ├── auth/             # Componentes, hooks, serviços e types do módulo de login
│   ├── finance/          # Componentes, modais de cadastro, listagens e lógica financeira
│   └── fitness/          # Cronômetro, cards, gráficos e lógica do tracker de treinos
├── lib/                  # Utilitários globais (formatação de moedas, manipulação de datas)
├── services/             # Instância do cliente Axios (api.ts) com interceptores
├── types/                # Contratos globais da API (respostas paginadas, etc.)
└── middleware.ts         # Controle de rotas privadas e públicas
```

---

## ⚙️ Configuração e Execução

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em seu ambiente de desenvolvimento.

### Instalação das dependências

Instale os pacotes necessários utilizando o seu gerenciador de pacotes de preferência:

```bash
# Usando npm
npm install

# Usando yarn
yarn install

# Usando pnpm
pnpm install
```

### Variáveis de Ambiente
Crie um arquivo `.env` ou `.env.local` na raiz do diretório e adicione a URL que aponta para o seu servidor backend (API):

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Inicializando em modo de desenvolvimento

Para iniciar a aplicação localmente, execute o seguinte comando:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para visualizar o projeto em execução.

### Compilação para produção

Para gerar o build de produção otimizado da aplicação Next.js:

```bash
npm run build
```