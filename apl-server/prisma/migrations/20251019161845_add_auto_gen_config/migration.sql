/*
  Warnings:

  - You are about to drop the column `autoGenTime` on the `AutoGenConfig` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AutoGenConfig` table. All the data in the column will be lost.
  - Added the required column `secondsSinceMidnight` to the `AutoGenConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `AutoGenConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AutoGenConfig" DROP COLUMN "autoGenTime",
DROP COLUMN "createdAt",
ADD COLUMN     "secondsSinceMidnight" INTEGER NOT NULL,
ADD COLUMN     "timezone" TEXT NOT NULL;
