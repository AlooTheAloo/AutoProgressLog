-- DropForeignKey
ALTER TABLE "AnkiConfig" DROP CONSTRAINT "AnkiConfig_userConfigId_fkey";

-- DropForeignKey
ALTER TABLE "AnkiData" DROP CONSTRAINT "AnkiData_syncDataId_fkey";

-- DropForeignKey
ALTER TABLE "ImmersionActivity" DROP CONSTRAINT "ImmersionActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_syncDataId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "Streak" DROP CONSTRAINT "Streak_reportId_fkey";

-- DropForeignKey
ALTER TABLE "SyncData" DROP CONSTRAINT "SyncData_userId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserConfig" DROP CONSTRAINT "UserConfig_userId_fkey";

-- CreateIndex
CREATE INDEX "AnkiConfig_userConfigId_idx" ON "AnkiConfig"("userConfigId");

-- CreateIndex
CREATE INDEX "AnkiData_syncDataId_idx" ON "AnkiData"("syncDataId");

-- CreateIndex
CREATE INDEX "ImmersionActivity_userId_idx" ON "ImmersionActivity"("userId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_syncDataId_idx" ON "Report"("syncDataId");

-- CreateIndex
CREATE INDEX "Streak_reportId_idx" ON "Streak"("reportId");

-- CreateIndex
CREATE INDEX "SyncData_userId_idx" ON "SyncData"("userId");

-- CreateIndex
CREATE INDEX "Token_token_userId_idx" ON "Token"("token", "userId");

-- CreateIndex
CREATE INDEX "UserConfig_userId_idx" ON "UserConfig"("userId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncData" ADD CONSTRAINT "SyncData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnkiData" ADD CONSTRAINT "AnkiData_syncDataId_fkey" FOREIGN KEY ("syncDataId") REFERENCES "SyncData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmersionActivity" ADD CONSTRAINT "ImmersionActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_syncDataId_fkey" FOREIGN KEY ("syncDataId") REFERENCES "SyncData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnkiConfig" ADD CONSTRAINT "AnkiConfig_userConfigId_fkey" FOREIGN KEY ("userConfigId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
