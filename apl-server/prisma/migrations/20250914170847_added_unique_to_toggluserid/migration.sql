/*
  Warnings:

  - A unique constraint covering the columns `[togglUserId]` on the table `UserConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_togglUserId_key" ON "UserConfig"("togglUserId");
