/*
  Warnings:

  - You are about to drop the column `autoGenTime` on the `UserConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserConfig" DROP COLUMN "autoGenTime";

-- CreateTable
CREATE TABLE "AutoGenConfig" (
    "id" SERIAL NOT NULL,
    "autoGenTime" TIMETZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userConfigId" INTEGER NOT NULL,

    CONSTRAINT "AutoGenConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoGenConfig_userConfigId_key" ON "AutoGenConfig"("userConfigId");

-- AddForeignKey
ALTER TABLE "AutoGenConfig" ADD CONSTRAINT "AutoGenConfig_userConfigId_fkey" FOREIGN KEY ("userConfigId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
