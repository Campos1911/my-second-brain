-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- DropIndex
DROP INDEX "Task_userId_priority_deletedAt_idx";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "Task_userId_priority_status_deletedAt_idx" ON "Task"("userId", "priority", "status", "deletedAt");
