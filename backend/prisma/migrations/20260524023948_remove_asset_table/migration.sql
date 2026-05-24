/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_userId_fkey";

-- DropTable
DROP TABLE "Asset";
