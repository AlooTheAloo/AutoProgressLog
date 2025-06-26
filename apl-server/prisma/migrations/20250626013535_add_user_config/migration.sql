/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnkiRetentionMode" AS ENUM ('ANKI_DEFAULT', 'TRUE_RETENTION');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "userName" TEXT;

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" SERIAL NOT NULL,
    "togglToken" TEXT NOT NULL,
    "autoGenTime" TIMETZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnkiConfig" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL DEFAULT 'https://sync.ankiweb.net/',
    "ankiToken" TEXT NOT NULL,
    "retentionMode" "AnkiRetentionMode" NOT NULL,
    "trackedDecks" INTEGER[],
    "userConfigId" INTEGER NOT NULL,

    CONSTRAINT "AnkiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_userId_key" ON "UserConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnkiConfig_userConfigId_key" ON "AnkiConfig"("userConfigId");

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnkiConfig" ADD CONSTRAINT "AnkiConfig_userConfigId_fkey" FOREIGN KEY ("userConfigId") REFERENCES "UserConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
