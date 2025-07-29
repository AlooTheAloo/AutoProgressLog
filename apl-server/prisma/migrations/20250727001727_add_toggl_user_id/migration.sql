/*
  Warnings:

  - Added the required column `togglUserId` to the `UserConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserConfig" ADD COLUMN     "togglUserId" INTEGER NOT NULL;
