/*
  Warnings:

  - You are about to drop the column `icon` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `module` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `targetMuscle` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `SetLog` table. All the data in the column will be lost.
  - You are about to drop the column `workoutLogId` on the `SetLog` table. All the data in the column will be lost.
  - You are about to alter the column `weight` on the `SetLog` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `isPublicMode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Workout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workoutPlanId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workoutSessionId` to the `SetLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'FITNESS');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "SetLog" DROP CONSTRAINT "SetLog_workoutLogId_fkey";

-- DropForeignKey
ALTER TABLE "Workout" DROP CONSTRAINT "Workout_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_workoutId_fkey";

-- DropIndex
DROP INDEX "Category_name_userId_module_key";

-- DropIndex
DROP INDEX "Exercise_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "icon",
DROP COLUMN "module",
ADD COLUMN     "type" "CategoryType" NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "targetMuscle",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "workoutPlanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SetLog" DROP COLUMN "order",
DROP COLUMN "workoutLogId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "toFailure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workoutSessionId" TEXT NOT NULL,
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdAt",
DROP COLUMN "type",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPublicMode",
DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- DropTable
DROP TABLE "Workout";

-- DropTable
DROP TABLE "WorkoutLog";

-- DropEnum
DROP TYPE "ModuleType";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "bookValue" DECIMAL(12,2) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_startedAt_idx" ON "WorkoutSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Category_userId_type_idx" ON "Category"("userId", "type");

-- CreateIndex
CREATE INDEX "SetLog_exerciseId_createdAt_idx" ON "SetLog"("exerciseId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
