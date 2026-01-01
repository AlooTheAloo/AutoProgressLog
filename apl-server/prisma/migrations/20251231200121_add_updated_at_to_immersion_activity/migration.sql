/*
  Warnings:

  - A unique constraint covering the columns `[activityTogglId]` on the table `ImmersionActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ImmersionActivity" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "ImmersionActivity_activityTogglId_key" ON "ImmersionActivity"("activityTogglId");
