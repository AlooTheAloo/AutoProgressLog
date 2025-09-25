/*
  Warnings:

  - A unique constraint covering the columns `[activityTogglId]` on the table `ImmersionActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityTogglId` to the `ImmersionActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImmersionActivity" ADD COLUMN     "activityTogglId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ImmersionActivity_activityTogglId_key" ON "ImmersionActivity"("activityTogglId");
