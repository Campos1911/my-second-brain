-- 1. Garante que a extensão de geração de UUIDs está ativa no PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Cria a nova tabela intermediária "WorkoutPlanExercise"
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- 3. Adiciona a coluna temporária "userId" na tabela "Exercise"
ALTER TABLE "Exercise" ADD COLUMN "userId" TEXT;

-- 4. MIGRAÇÃO DE DADOS: Associa os exercícios existentes aos seus respectivos criadores
-- (Descobre quem é o dono do WorkoutPlan e define como dono do Exercise)
UPDATE "Exercise" e
SET "userId" = wp."userId"
FROM "WorkoutPlan" wp
WHERE e."workoutPlanId" = wp."id";

-- 5. MIGRAÇÃO DE DADOS: Popula a tabela intermediária com as associações atuais
-- (Mantém o vínculo de qual exercício pertencia a qual treino)
INSERT INTO "WorkoutPlanExercise" ("id", "workoutPlanId", "exerciseId", "createdAt")
SELECT gen_random_uuid()::text, "workoutPlanId", "id", NOW()
FROM "Exercise"
WHERE "workoutPlanId" IS NOT NULL;

-- 6. Adiciona as chaves estrangeiras e constraints para a nova tabela intermediária
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey" 
    FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" 
    FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "WorkoutPlanExercise_workoutPlanId_exerciseId_key" 
    ON "WorkoutPlanExercise"("workoutPlanId", "exerciseId");

CREATE INDEX "WorkoutPlanExercise_workoutPlanId_deletedAt_idx" 
    ON "WorkoutPlanExercise"("workoutPlanId", "deletedAt");

CREATE INDEX "WorkoutPlanExercise_exerciseId_deletedAt_idx" 
    ON "WorkoutPlanExercise"("exerciseId", "deletedAt");

-- 7. Cria a chave estrangeira e índice para a nova relação de "userId" em "Exercise"
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Exercise_userId_categoryId_deletedAt_idx" 
    ON "Exercise"("userId", "categoryId", "deletedAt");

-- 8. REMOÇÃO DOS VÍNCULOS ANTIGOS (Limpeza segura)
-- Remove a chave estrangeira direta entre Exercise e WorkoutPlan
ALTER TABLE "Exercise" DROP CONSTRAINT IF EXISTS "Exercise_workoutPlanId_fkey";

-- Remove o índice antigo que dependia de "workoutPlanId"
DROP INDEX IF EXISTS "Exercise_workoutPlanId_deletedAt_idx";

-- Remove a coluna "workoutPlanId" que agora está obsoleta
ALTER TABLE "Exercise" DROP COLUMN "workoutPlanId";