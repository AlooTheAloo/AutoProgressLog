/*
  Warnings:

  - A unique constraint covering the columns `[activityTogglId,userId]` on the table `ImmersionActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ImmersionActivity_activityTogglId_key";

-- DropIndex
DROP INDEX "UserConfig_togglUserId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ImmersionActivity_activityTogglId_userId_key" ON "ImmersionActivity"("activityTogglId", "userId");
