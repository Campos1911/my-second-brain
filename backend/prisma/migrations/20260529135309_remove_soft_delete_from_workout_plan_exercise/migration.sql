/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `WorkoutPlanExercise` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "WorkoutPlanExercise_exerciseId_deletedAt_idx";

-- DropIndex
DROP INDEX "WorkoutPlanExercise_workoutPlanId_deletedAt_idx";

-- AlterTable
ALTER TABLE "WorkoutPlanExercise" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_workoutPlanId_idx" ON "WorkoutPlanExercise"("workoutPlanId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_exerciseId_idx" ON "WorkoutPlanExercise"("exerciseId");
