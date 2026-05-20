-- DropIndex
DROP INDEX "Asset_userId_idx";

-- DropIndex
DROP INDEX "Category_userId_type_idx";

-- DropIndex
DROP INDEX "SetLog_exerciseId_createdAt_idx";

-- DropIndex
DROP INDEX "Transaction_userId_date_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "WorkoutPlan_userId_idx";

-- DropIndex
DROP INDEX "WorkoutSession_userId_startedAt_idx";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SetLog" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkoutSession" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Asset_userId_deletedAt_idx" ON "Asset"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Category_userId_type_deletedAt_idx" ON "Category"("userId", "type", "deletedAt");

-- CreateIndex
CREATE INDEX "Exercise_workoutPlanId_deletedAt_idx" ON "Exercise"("workoutPlanId", "deletedAt");

-- CreateIndex
CREATE INDEX "SetLog_exerciseId_createdAt_deletedAt_idx" ON "SetLog"("exerciseId", "createdAt", "deletedAt");

-- CreateIndex
CREATE INDEX "SetLog_workoutSessionId_deletedAt_idx" ON "SetLog"("workoutSessionId", "deletedAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_deletedAt_idx" ON "Transaction"("userId", "date", "deletedAt");

-- CreateIndex
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_deletedAt_idx" ON "WorkoutPlan"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_startedAt_deletedAt_idx" ON "WorkoutSession"("userId", "startedAt", "deletedAt");
