/*
  Warnings:

  - You are about to drop the column `time` on the `ImmersionActivity` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `ImmersionActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImmersionActivity" DROP COLUMN "time",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
