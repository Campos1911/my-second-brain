-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DEBIT', 'CREDIT');

-- DropIndex
DROP INDEX "Transaction_userId_date_deletedAt_idx";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'DEBIT';

-- CreateIndex
CREATE INDEX "Transaction_userId_date_paymentMethod_deletedAt_idx" ON "Transaction"("userId", "date", "paymentMethod", "deletedAt");
