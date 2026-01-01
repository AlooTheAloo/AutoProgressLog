/*
  Warnings:

  - Added the required column `totalImmersionTime` to the `SyncData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SyncData" ADD COLUMN     "totalImmersionTime" INTEGER NOT NULL;
