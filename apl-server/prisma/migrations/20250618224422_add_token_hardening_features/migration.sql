/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Token` table. All the data in the column will be lost.
  - Made the column `expiration` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "updatedAt",
ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiration" SET NOT NULL;
