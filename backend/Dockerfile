# Multi-stage Dockerfile para NestJS + Prisma 7

# --- Estágio 1: Build ---
FROM node:20-slim AS builder

# Instala o openssl, necessário para o motor do Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências e a pasta prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo as devDependencies necessárias para o build)
RUN npm ci

# Gera o Prisma Client
RUN npx prisma generate

# Copia o restante do código da aplicação
COPY . .

# Compila a aplicação NestJS
RUN npm run build

# Remove as dependências de desenvolvimento para otimizar o tamanho final da imagem
RUN npm prune --production

# --- Estágio 2: Execução (Runner) ---
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

# Copia os arquivos essenciais do estágio de build
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/generated ./src/generated
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

# Executa o NestJS a partir da pasta dist
CMD ["node", "dist/main"]